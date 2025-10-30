"""
Supervisor Agent - Intelligent orchestrator for natural language queries.

This agent analyzes user queries and:
1. Detects if an existing workflow matches the intent
2. Routes to single agents for simple queries
3. Dynamically orchestrates multiple agents for complex queries
"""
from typing import Dict, Any, List, Optional
from pydantic import Field
import json

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, AgentRegistry, register_agent
)


class SupervisorConfig(AgentConfigSchema):
    """Configuration for Supervisor Agent."""

    llm_provider: str = Field(
        default="openai",
        description="LLM provider to use for intent classification"
    )
    model: str = Field(
        default="gpt-4",
        description="Model to use for analysis"
    )
    workflow_matching_threshold: float = Field(
        default=0.7,
        description="Confidence threshold for workflow matching (0-1)"
    )


@register_agent
class SupervisorAgent(BaseAgent):
    """
    Supervisor Agent - Routes queries to agents/workflows intelligently.

    Examples:
    - "Show me high-value deals" → Salesforce Agent
    - "Onboard John Doe" → HR Onboarding Workflow
    - "Find deals and notify team" → Salesforce + Slack (chained)
    """

    agent_type = "supervisor"
    name = "Supervisor Agent"
    description = "Intelligent orchestrator that routes queries to appropriate agents or workflows"
    icon = "brain"
    category = AgentCategory.ANALYSIS
    supported_connectors = []
    config_schema = SupervisorConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """
        Main execution logic for supervisor.

        Flow:
        1. Parse user query
        2. Analyze intent using LLM
        3. Check for workflow matches
        4. Execute workflow OR route to agent(s)
        """
        user_query = input_data.get('query', '') if isinstance(input_data, dict) else str(input_data)

        self.log(f"Processing query: {user_query}")

        # Step 1: Classify intent
        intent = await self._classify_intent(user_query, context)

        self.log(f"Intent classification: {intent['execution_type']}")

        # Step 2: Check for workflow matches FIRST (but only if appropriate!)
        if intent['execution_type'] in ['workflow', 'multi_agent']:
            workflow_match = await self._match_workflow(intent, context)

            if workflow_match:
                # IMPORTANT: Verify the workflow actually contains the required agents
                required_agents = set(intent.get('agent_hints', []))
                # workflow_match['agents'] is already a list of agent type strings
                workflow_agents = set(workflow_match.get('agents', []))

                self.log(f"Agent overlap check - Required: {required_agents}, Workflow has: {workflow_agents}")

                # Calculate overlap
                if required_agents:
                    # Check if workflow has ALL required agents (100% match)
                    missing_agents = required_agents - workflow_agents

                    if not missing_agents:
                        # Workflow has all required agents
                        self.log(f"Matched workflow: {workflow_match['name']} (has all required agents)")
                        result = await self._execute_workflow(workflow_match, intent, context)
                        return result
                    else:
                        # Workflow is missing some required agents
                        self.log(f"Workflow {workflow_match['name']} rejected - missing agents: {missing_agents}")
                        # Fall through to dynamic orchestration
                else:
                    # No specific agent hints, use the workflow
                    self.log(f"Matched workflow: {workflow_match['name']}")
                    result = await self._execute_workflow(workflow_match, intent, context)
                    return result

        # Step 3: Fallback to agent routing
        if intent['execution_type'] == 'single_agent':
            result = await self._route_to_agent(intent, context)
        elif intent['execution_type'] == 'multi_agent':
            self.log("No matching workflow found - triggering dynamic orchestration")
            result = await self._orchestrate_agents(intent, context)
        else:
            result = await self._handle_unknown(user_query, context)

        return result

    async def _classify_intent(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use LLM to understand user intent.

        Returns:
        {
            "execution_type": "single_agent" | "workflow" | "multi_agent",
            "primary_action": "retrieve_data" | "send_message" | "create_record",
            "entities": {"employee_name": "John Doe", "date": "Q4"},
            "agent_hints": ["salesforce", "slack"],
            "workflow_hints": ["onboarding", "sales_pipeline"]
        }
        """

        # Get available agents and workflows for context
        available_agents = self._get_available_agents()
        available_workflows = await self._get_available_workflows(context)

        # Build LLM prompt
        prompt = self._build_classification_prompt(
            query=query,
            agents=available_agents,
            workflows=available_workflows
        )

        # Call LLM (OpenAI/Anthropic)
        llm_response = await self._call_llm(prompt, context)

        # Parse response
        try:
            intent = json.loads(llm_response)
        except json.JSONDecodeError:
            # Fallback to simple parsing
            intent = self._simple_intent_parsing(query)

        return intent

    async def _match_workflow(
        self,
        intent: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Match user intent to existing workflows.

        This is THE KEY FUNCTION that enables workflow reuse!

        Matching criteria:
        1. Keyword matching (workflow name/description)
        2. Agent composition similarity
        3. Intent alignment (data retrieval vs action)
        4. LLM-based semantic matching
        """
        from database.session import get_db
        from database.models import WorkflowDB

        # Get all workflows for this org
        db = next(get_db())
        workflows = db.query(WorkflowDB).filter(
            WorkflowDB.org_id == context['org_id']
        ).all()

        if not workflows:
            return None

        # Convert to dict format
        workflow_candidates = [
            {
                "id": wf.id,
                "name": wf.name,
                "description": wf.description or "",
                "agents": [agent['type'] for agent in wf.agents],
                "category": wf.category,
                "tags": wf.tags or []
            }
            for wf in workflows
        ]

        self.log(f"Found {len(workflow_candidates)} workflows to match against")

        # Method 1: Keyword matching (fast)
        keyword_matches = self._keyword_match_workflows(intent, workflow_candidates)
        if keyword_matches:
            self.log(f"Keyword match found: {keyword_matches[0]['name']}")
            return keyword_matches[0]

        # Method 2: Agent composition matching
        agent_matches = self._agent_composition_match(intent, workflow_candidates)
        if agent_matches:
            self.log(f"Agent composition match found: {agent_matches[0]['name']}")
            return agent_matches[0]

        # Method 3: LLM semantic matching (slower but more accurate)
        semantic_match = await self._semantic_match_workflow(
            intent,
            workflow_candidates,
            context
        )

        return semantic_match

    def _keyword_match_workflows(
        self,
        intent: Dict[str, Any],
        workflows: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Fast keyword-based workflow matching.

        Example:
        - Query: "onboard new employee" → "HR Onboarding Workflow"
        - Query: "sales pipeline" → "Sales Lead Management"
        """
        query_words = set(intent.get('query_normalized', '').lower().split())
        workflow_hints = intent.get('workflow_hints', [])

        matches = []

        for workflow in workflows:
            # Combine name, description, and tags for matching
            workflow_text = (
                workflow['name'] + " " +
                workflow['description'] + " " +
                " ".join(workflow.get('tags', []))
            ).lower()

            workflow_words = set(workflow_text.split())

            # Calculate overlap
            overlap = len(query_words & workflow_words)

            # Check hints
            hint_match = any(hint.lower() in workflow_text for hint in workflow_hints)

            if overlap > 2 or hint_match:
                matches.append({
                    **workflow,
                    "match_score": overlap + (5 if hint_match else 0)
                })

        # Sort by score
        matches.sort(key=lambda x: x['match_score'], reverse=True)

        return matches if matches else []

    def _agent_composition_match(
        self,
        intent: Dict[str, Any],
        workflows: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Match based on required agents.

        Example:
        - Intent needs: [salesforce, slack]
        - Workflow has: [sales_intelligence, slack]
        - Match score: 2/2 = 100%
        """
        required_agents = set(intent.get('agent_hints', []))

        if not required_agents:
            return []

        matches = []

        for workflow in workflows:
            workflow_agents = set(workflow['agents'])

            # Calculate Jaccard similarity
            intersection = required_agents & workflow_agents
            union = required_agents | workflow_agents

            if union:
                similarity = len(intersection) / len(union)

                if similarity >= self.config.workflow_matching_threshold:
                    matches.append({
                        **workflow,
                        "match_score": similarity
                    })

        matches.sort(key=lambda x: x['match_score'], reverse=True)

        return matches if matches else []

    async def _semantic_match_workflow(
        self,
        intent: Dict[str, Any],
        workflows: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Use LLM to semantically match query to workflow.

        This is the most accurate but slowest method.
        """
        if not workflows:
            return None

        # Build comparison prompt
        prompt = f"""
        User Query Intent: {json.dumps(intent, indent=2)}

        Available Workflows:
        {json.dumps(workflows, indent=2)}

        Task: Determine which workflow (if any) best matches the user's intent.

        Return JSON:
        {{
            "matched_workflow_id": "wf_xxx" or null,
            "confidence": 0.0-1.0,
            "reasoning": "why this workflow matches"
        }}

        Only return a match if confidence > {self.config.workflow_matching_threshold}.
        """

        llm_response = await self._call_llm(prompt, context)

        try:
            match_result = json.loads(llm_response)

            if match_result.get('matched_workflow_id') and \
               match_result.get('confidence', 0) >= self.config.workflow_matching_threshold:

                # Find the workflow
                matched_wf = next(
                    (wf for wf in workflows if wf['id'] == match_result['matched_workflow_id']),
                    None
                )

                if matched_wf:
                    self.log(f"Semantic match: {matched_wf['name']} (confidence: {match_result['confidence']})")
                    return matched_wf

        except (json.JSONDecodeError, KeyError):
            pass

        return None

    async def _execute_workflow(
        self,
        workflow: Dict[str, Any],
        intent: Dict[str, Any],
        context: Dict[str, Any]
    ) -> AgentExecutionResult:
        """
        Execute the matched workflow.

        Steps:
        1. Extract parameters from user query
        2. Fill workflow inputs
        3. Trigger workflow execution via orchestrator
        4. Return results
        """
        from database.session import get_db
        from database.models import WorkflowDB, ExecutionDB, WorkflowStatus
        from orchestrator import OrchestrationEngine
        from models.workflow import Workflow
        from datetime import datetime
        import uuid

        self.log(f"Executing workflow: {workflow['name']}")

        # Extract parameters from entities
        workflow_params = self._extract_workflow_params(intent, workflow)

        # Execute workflow using orchestrator
        try:
            # Get database session
            db = next(get_db())

            # Get full workflow from database
            db_workflow = db.query(WorkflowDB).filter(
                WorkflowDB.id == workflow['id'],
                WorkflowDB.org_id == context['org_id']
            ).first()

            if not db_workflow:
                raise Exception(f"Workflow {workflow['id']} not found")

            # Create execution record
            execution_id = f"exec_{str(uuid.uuid4())[:8]}"
            started_at = datetime.utcnow()

            # Convert workflow_params to JSON string
            input_data_str = workflow_params
            if isinstance(workflow_params, dict):
                input_data_str = json.dumps(workflow_params)
            elif not isinstance(workflow_params, str):
                input_data_str = str(workflow_params)

            db_execution = ExecutionDB(
                id=execution_id,
                workflow_id=workflow['id'],
                org_id=context['org_id'],
                status=WorkflowStatus.RUNNING,
                input_data=input_data_str,
                created_at=started_at,
                started_at=started_at
            )

            db.add(db_execution)
            db.commit()
            db.refresh(db_execution)

            # Convert to model for orchestrator
            workflow_model = Workflow(
                id=db_workflow.id,
                name=db_workflow.name,
                description=db_workflow.description,
                agents=db_workflow.agents,
                edges=db_workflow.edges,
                created_at=db_workflow.created_at,
                updated_at=db_workflow.updated_at
            )

            # Execute via orchestrator
            orchestrator = OrchestrationEngine()
            result = await orchestrator.execute_workflow(
                workflow=workflow_model,
                input_data=workflow_params,
                execution_id=execution_id
            )

            # Update execution with results
            db_execution.status = WorkflowStatus.COMPLETED
            db_execution.output = result.output if hasattr(result, 'output') else {}

            # Safely extract metrics (could be None or missing)
            metrics = getattr(result, 'metrics', None)
            if metrics and isinstance(metrics, dict):
                db_execution.agent_results = metrics.get('agent_results', {})
                db_execution.tokens_used = metrics.get('total_tokens', 0)
                db_execution.cost = metrics.get('total_cost', 0.0)
            else:
                db_execution.agent_results = {}
                db_execution.tokens_used = 0
                db_execution.cost = 0.0

            db_execution.completed_at = datetime.utcnow()
            db_execution.duration_seconds = (db_execution.completed_at - db_execution.started_at).total_seconds()

            # Update workflow stats
            db_workflow.execution_count += 1
            db_workflow.success_count += 1

            db.commit()
            db.refresh(db_execution)

            # Extract agent names from agent_results
            agents_used = []
            if metrics and isinstance(metrics, dict) and 'agent_results' in metrics:
                agents_used = [ar.get('agent_name', '') for ar in metrics.get('agent_results', [])]

            return AgentExecutionResult(
                success=True,
                output={
                    "message": f"Executed workflow: {workflow['name']}",
                    "workflow_id": workflow['id'],
                    "workflow_name": workflow['name'],
                    "execution_id": execution_id,
                    "status": "completed",
                    "results": db_execution.output,
                    "agents_used": agents_used,
                    "intent": {
                        "execution_type": intent.get("execution_type"),
                        "primary_action": intent.get("primary_action"),
                        "entities": intent.get("entities", {}),
                        "query_normalized": intent.get("query_normalized", "")
                    },
                    "workflow_identified": {
                        "id": workflow['id'],
                        "name": workflow['name'],
                        "description": workflow.get('description', ''),
                        "matching_method": "llm_classification"
                    }
                },
                tokens_used=100,
                cost=0.01
            )

        except Exception as e:
            self.log(f"Workflow execution failed: {e}", level="ERROR")

            # Update execution as failed
            try:
                db_execution.status = WorkflowStatus.FAILED
                db_execution.error = str(e)
                db_execution.completed_at = datetime.utcnow()
                db_execution.duration_seconds = (db_execution.completed_at - db_execution.started_at).total_seconds()

                db_workflow.execution_count += 1
                db_workflow.failure_count += 1

                db.commit()
            except:
                pass

            return AgentExecutionResult(
                success=False,
                output=None,
                error=f"Failed to execute workflow: {str(e)}"
            )

    def _extract_workflow_params(
        self,
        intent: Dict[str, Any],
        workflow: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Extract parameters from user query for workflow execution.

        Example:
        - Query: "Onboard John Doe starting Jan 1"
        - Entities: {"employee_name": "John Doe", "start_date": "2025-01-01"}
        - Workflow params: {"name": "John Doe", "start_date": "2025-01-01"}
        """
        entities = intent.get('entities', {})

        # Map entities to workflow parameters
        # TODO: Make this smarter with workflow schema matching
        return entities

    async def _route_to_agent(
        self,
        intent: Dict[str, Any],
        context: Dict[str, Any]
    ) -> AgentExecutionResult:
        """
        Route query to a single agent.

        Example: "Show me Salesforce opportunities" → SalesIntelligence Agent
        """
        agent_hints = intent.get('agent_hints', [])

        if not agent_hints:
            return AgentExecutionResult(
                success=False,
                output=None,
                error="Could not determine which agent to use"
            )

        # Get the primary agent
        agent_type = agent_hints[0]

        self.log(f"Routing to agent: {agent_type}")

        # TODO: Actually execute the agent
        # For now, return a placeholder

        return AgentExecutionResult(
            success=True,
            output={
                "message": f"Would execute {agent_type} agent",
                "agent_type": agent_type,
                "intent": intent
            },
            tokens_used=50,
            cost=0.005
        )

    async def _orchestrate_agents(
        self,
        intent: Dict[str, Any],
        context: Dict[str, Any]
    ) -> AgentExecutionResult:
        """
        Dynamically chain multiple agents on-the-fly.

        This is the key feature for handling queries with no pre-defined workflow!

        Example: "Find deals and notify team" → Salesforce → Slack

        Flow:
        1. Use LLM to determine execution plan (which agents, in what order)
        2. Create ad-hoc workflow dynamically
        3. Execute via orchestrator engine
        4. Return results
        """
        from database.session import get_db
        from database.models import ExecutionDB, WorkflowStatus
        from orchestrator import OrchestrationEngine
        from models.workflow import Workflow, AgentNode, AgentConfig
        from datetime import datetime
        import uuid

        agent_hints = intent.get('agent_hints', [])
        self.log(f"Orchestrating agents dynamically: {agent_hints}")

        if not agent_hints or len(agent_hints) < 2:
            return AgentExecutionResult(
                success=False,
                output={"message": "Need at least 2 agents for dynamic orchestration"},
                error="Insufficient agents"
            )

        try:
            # Step 1: Ask LLM to create execution plan
            execution_plan = await self._create_execution_plan(intent, agent_hints, context)

            self.log(f"Execution plan: {execution_plan}")

            # Step 2: Build ad-hoc workflow from plan
            workflow = self._build_adhoc_workflow(execution_plan, intent)

            # Step 3: Create execution record
            execution_id = f"exec_{str(uuid.uuid4())[:8]}"
            db = next(get_db())

            # Convert input to JSON string
            input_data_str = json.dumps({
                "query": intent.get("query_normalized", ""),
                "intent": intent
            })

            db_execution = ExecutionDB(
                id=execution_id,
                workflow_id="adhoc_multi_agent",
                org_id=context['org_id'],
                status=WorkflowStatus.RUNNING,
                input_data=input_data_str,
                created_at=datetime.utcnow(),
                started_at=datetime.utcnow()
            )

            db.add(db_execution)
            db.commit()
            db.refresh(db_execution)

            # Step 4: Execute via orchestrator
            orchestrator = OrchestrationEngine()
            result = await orchestrator.execute_workflow(
                workflow=workflow,
                input_data=input_data_str,
                execution_id=execution_id
            )

            # Step 5: Update execution with results
            db_execution.status = WorkflowStatus.COMPLETED
            db_execution.output = result.results if hasattr(result, 'results') else {}

            metrics = getattr(result, 'metrics', None)
            if metrics:
                db_execution.tokens_used = metrics.total_tokens
                db_execution.cost = metrics.total_cost

            db_execution.completed_at = datetime.utcnow()
            db_execution.duration_seconds = (db_execution.completed_at - db_execution.started_at).total_seconds()

            db.commit()
            db.refresh(db_execution)

            self.log(f"Dynamic orchestration completed: {execution_id}")

            return AgentExecutionResult(
                success=True,
                output={
                    "message": f"Dynamically orchestrated {len(agent_hints)} agents",
                    "execution_id": execution_id,
                    "agents_used": [agent['type'] for agent in execution_plan['agents']],
                    "execution_plan": execution_plan,
                    "results": db_execution.output,
                    "intent": {
                        "execution_type": intent.get("execution_type"),
                        "primary_action": intent.get("primary_action"),
                        "entities": intent.get("entities", {}),
                        "query_normalized": intent.get("query_normalized", "")
                    },
                    "workflow_type": "dynamic_orchestration"
                },
                tokens_used=metrics.total_tokens if metrics else 0,
                cost=metrics.total_cost if metrics else 0.0
            )

        except Exception as e:
            self.log(f"Dynamic orchestration failed: {str(e)}", level="ERROR")

            return AgentExecutionResult(
                success=False,
                output={
                    "message": f"Failed to orchestrate agents: {str(e)}",
                    "agents": agent_hints
                },
                error=str(e)
            )

    async def _create_execution_plan(
        self,
        intent: Dict[str, Any],
        agent_hints: List[str],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Use LLM to create a detailed execution plan.

        Returns:
        {
            "agents": [
                {"type": "sales_intelligence", "config": {"filter": "high_value"}},
                {"type": "slack", "config": {"channel": "#sales"}}
            ],
            "data_flow": "sequential",
            "rationale": "First fetch deals, then notify team"
        }
        """
        from config import settings

        # Build prompt for LLM
        prompt = f"""
You are an AI orchestration planner. Create an execution plan for a multi-agent workflow.

User Intent:
{json.dumps(intent, indent=2)}

Available Agents: {', '.join(agent_hints)}

Task: Determine:
1. The optimal order to execute these agents
2. Configuration for each agent
3. How data should flow between them

Respond with JSON only:
{{
    "agents": [
        {{"type": "agent_name", "config": {{}}}},
        ...
    ],
    "data_flow": "sequential",
    "rationale": "explanation"
}}

Important:
- First agent retrieves/analyzes data
- Subsequent agents use that data for actions (send, create, update)
- Use entities from intent to configure agents
"""

        try:
            llm_response = await self._call_llm(prompt, context)
            plan = json.loads(llm_response)

            # Validate plan structure
            if 'agents' not in plan or not isinstance(plan['agents'], list):
                raise ValueError("Invalid plan structure")

            return plan

        except Exception as e:
            self.log(f"Failed to create execution plan: {str(e)}", level="ERROR")

            # Fallback: simple sequential plan
            return {
                "agents": [{"type": agent, "config": {}} for agent in agent_hints],
                "data_flow": "sequential",
                "rationale": "Fallback sequential execution"
            }

    def _build_adhoc_workflow(
        self,
        execution_plan: Dict[str, Any],
        intent: Dict[str, Any]
    ) -> 'Workflow':
        """
        Build an ad-hoc workflow from the execution plan.

        This creates a temporary workflow object that can be executed
        by the orchestrator engine.
        """
        from models.workflow import Workflow, AgentNode, AgentConfig, WorkflowEdge, AgentPosition
        from datetime import datetime
        import uuid

        workflow_id = f"adhoc_{str(uuid.uuid4())[:8]}"
        agents = []
        edges = []

        # Create agent nodes
        for idx, agent_spec in enumerate(execution_plan['agents']):
            agent_type = agent_spec['type']
            agent_config = agent_spec.get('config', {})

            # Agent type is just a string, validated by AgentRegistry at runtime
            # Position agents in a vertical flow for dynamic workflows
            agent_node = AgentNode(
                id=f"agent_{idx + 1}",
                name=f"{agent_type.replace('_', ' ').title()} Agent",
                type=agent_type,
                config=AgentConfig(**agent_config) if agent_config else AgentConfig(),
                position=AgentPosition(x=100, y=100 + (idx * 100))
            )

            agents.append(agent_node)

            # Create edge to next agent (sequential flow)
            if idx > 0:
                edges.append(WorkflowEdge(
                    source=f"agent_{idx}",
                    target=f"agent_{idx + 1}"
                ))

        # Build workflow
        workflow = Workflow(
            id=workflow_id,
            name=f"Dynamic: {intent.get('query_normalized', 'Multi-Agent')[:50]}",
            description=execution_plan.get('rationale', 'Dynamically orchestrated workflow'),
            agents=agents,
            edges=edges,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        return workflow

    async def _handle_unknown(
        self,
        query: str,
        context: Dict[str, Any]
    ) -> AgentExecutionResult:
        """Handle queries that don't match any agent or workflow."""

        return AgentExecutionResult(
            success=False,
            output={
                "message": "I couldn't understand that request. Try rephrasing or use the visual builder.",
                "suggestions": [
                    "Show me Salesforce opportunities",
                    "Run the HR onboarding workflow",
                    "Send a message to Slack"
                ]
            },
            error="Intent unclear"
        )

    # Helper methods

    def _get_available_agents(self) -> List[Dict[str, Any]]:
        """Get list of available agents for context."""
        return [
            {
                "type": agent_type,
                "name": agent_class.name,
                "description": agent_class.description,
                "category": agent_class.category.value
            }
            for agent_type, agent_class in AgentRegistry._agents.items()
        ]

    async def _get_available_workflows(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get list of available workflows for this org."""
        from database.session import get_db
        from database.models import WorkflowDB

        db = next(get_db())
        workflows = db.query(WorkflowDB).filter(
            WorkflowDB.org_id == context['org_id']
        ).all()

        return [
            {
                "id": wf.id,
                "name": wf.name,
                "description": wf.description or "",
                "category": wf.category,
                "agents": [agent['type'] for agent in wf.agents]
            }
            for wf in workflows
        ]

    def _build_classification_prompt(
        self,
        query: str,
        agents: List[Dict],
        workflows: List[Dict]
    ) -> str:
        """Build LLM prompt for intent classification."""

        return f"""
You are an intelligent agent orchestrator. Analyze this user query and determine how to execute it.

User Query: "{query}"

Available Agents:
{json.dumps(agents, indent=2)}

Available Workflows:
{json.dumps(workflows, indent=2)}

Task: Return JSON with this structure:
{{
    "execution_type": "single_agent" | "workflow" | "multi_agent",
    "primary_action": "retrieve_data" | "send_message" | "create_record" | "update_record",
    "entities": {{
        // Extract any entities like names, dates, amounts
    }},
    "agent_hints": [
        // Agent types that could handle this (e.g., ["stripe", "salesforce", "email_outreach"])
    ],
    "workflow_hints": [
        // Keywords that might match workflow names
    ],
    "query_normalized": "normalized version of query"
}}

Rules:
1. **CAREFULLY** check if workflows ACTUALLY match the query's required agents
2. Use "workflow" ONLY if an existing workflow has the EXACT or nearly-exact agents needed
3. Use "single_agent" for simple queries (e.g., "Show me X")
4. Use "multi_agent" when query needs MULTIPLE DISTINCT AGENTS that don't have a matching workflow
5. Extract entities like names, dates, amounts from the query
6. Be VERY specific with agent_hints - include ALL agents mentioned (e.g., ["stripe", "salesforce", "email_outreach"])

Examples:
- "Compare Stripe revenue with Salesforce forecast" → multi_agent (needs Stripe + Salesforce)
- "Find high-value deals" → workflow (Sales Outreach Pipeline exists)
- "Get employee birthdays and Slack team" → multi_agent (needs Workday + Slack)
- "Onboard new employee" → workflow (Employee Onboarding exists)

IMPORTANT: If query mentions agents NOT covered by any workflow, return "multi_agent"!

Return ONLY valid JSON, no other text.
"""

    async def _call_llm(self, prompt: str, context: Dict[str, Any]) -> str:
        """
        Call LLM (OpenAI/Anthropic) for analysis.
        """
        from openai import AsyncOpenAI
        from config import settings

        # Get API key from centralized config
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            self.log("OpenAI API key not found, falling back to simple parsing", level="WARN")
            raise Exception("No API key")

        try:
            client = AsyncOpenAI(api_key=api_key)

            # Call OpenAI API
            response = await client.chat.completions.create(
                model=self.config.model,
                messages=[
                    {"role": "system", "content": "You are an AI assistant that classifies user intents and matches them to workflows and agents. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )

            llm_response = response.choices[0].message.content.strip()
            self.log(f"LLM classified intent: {llm_response[:100]}...")

            return llm_response

        except Exception as e:
            self.log(f"LLM call failed: {str(e)}", level="ERROR")
            raise

    def _simple_intent_parsing(self, query: str) -> Dict[str, Any]:
        """Simple fallback parsing if LLM fails."""

        query_lower = query.lower()

        # Simple keyword detection
        if "workflow" in query_lower or "onboard" in query_lower:
            execution_type = "workflow"
        elif " and " in query_lower:
            execution_type = "multi_agent"
        else:
            execution_type = "single_agent"

        return {
            "execution_type": execution_type,
            "primary_action": "retrieve_data",
            "entities": {},
            "agent_hints": [],
            "workflow_hints": [],
            "query_normalized": query_lower
        }
