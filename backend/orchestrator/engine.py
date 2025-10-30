"""
Multi-Agent Orchestration Engine.

Handles sequential execution of agents, data passing, and metrics tracking.
"""
from typing import Dict, Any, List
from datetime import datetime
import asyncio

from agents import AgentRegistry
from models.workflow import Workflow
from models.execution import (
    Execution, ExecutionStatus, AgentExecutionResult as ModelAgentExecResult,
    ExecutionMetrics, AgentExecutionMetrics
)


class OrchestrationEngine:
    """
    Orchestration engine for multi-agent workflows.

    Supports:
    - Sequential execution (Agent 1 → Agent 2 → Agent 3)
    - Agent-to-agent data passing
    - Metrics tracking (tokens, cost, latency)
    - Error handling and logging
    """

    def __init__(self):
        """Initialize orchestrator."""
        self.execution_logs = []

    async def execute_workflow(
        self,
        workflow: Workflow,
        input_data: str,
        execution_id: str
    ) -> Execution:
        """
        Execute a workflow with multiple agents.

        Args:
            workflow: Workflow definition with agents and edges
            input_data: Natural language input from user
            execution_id: Unique execution ID

        Returns:
            Execution result with agent outputs and metrics
        """
        self.log(execution_id, "INFO", "workflow", f"Starting workflow execution: {workflow.name}")

        # Convert input_data to JSON string if it's a dict
        input_str = input_data
        if isinstance(input_data, dict):
            import json
            input_str = json.dumps(input_data)
        elif not isinstance(input_data, str):
            input_str = str(input_data)

        # Initialize execution
        execution = Execution(
            id=execution_id,
            workflow_id=workflow.id,
            status=ExecutionStatus.RUNNING,
            started_at=datetime.now(),
            input=input_str,
            agent_executions=[]
        )

        try:
            # Build execution order from workflow graph
            execution_order = self._build_execution_order(workflow)

            self.log(execution_id, "INFO", "workflow",
                    f"Execution order: {' → '.join([a.name for a in execution_order])}")

            # Execute agents sequentially
            current_output = input_data

            for agent_node in execution_order:
                agent_result = await self._execute_agent(
                    agent_node=agent_node,
                    input_data=current_output,
                    execution_id=execution_id,
                    workflow_id=workflow.id
                )

                # Add to execution history
                execution.agent_executions.append(agent_result)

                # Pass output to next agent
                if agent_result.status == ExecutionStatus.COMPLETED:
                    current_output = agent_result.output
                else:
                    # Agent failed, stop execution
                    self.log(execution_id, "ERROR", agent_node.id,
                            f"Agent execution failed, stopping workflow")
                    execution.status = ExecutionStatus.FAILED
                    execution.completed_at = datetime.now()
                    return execution

            # All agents completed successfully
            execution.status = ExecutionStatus.COMPLETED
            execution.completed_at = datetime.now()
            execution.results = current_output

            # Calculate overall metrics
            execution.metrics = self._calculate_metrics(execution.agent_executions)

            self.log(execution_id, "INFO", "workflow",
                    f"Workflow completed successfully. Total tokens: {execution.metrics.total_tokens}")

            return execution

        except Exception as e:
            self.log(execution_id, "ERROR", "workflow", f"Workflow execution failed: {str(e)}")
            execution.status = ExecutionStatus.FAILED
            execution.completed_at = datetime.now()
            return execution

    async def _execute_agent(
        self,
        agent_node: Any,
        input_data: Any,
        execution_id: str,
        workflow_id: str
    ) -> ModelAgentExecResult:
        """Execute a single agent."""
        agent_id = agent_node.id
        agent_type = agent_node.type

        self.log(execution_id, "INFO", agent_id, f"Executing agent: {agent_node.name}")

        started_at = datetime.now()

        try:
            # Create agent instance via registry
            agent = AgentRegistry.create_agent(
                agent_type=agent_type.value if hasattr(agent_type, 'value') else agent_type,
                agent_id=agent_id,
                config=agent_node.config.dict() if hasattr(agent_node.config, 'dict') else {}
            )

            # Execute agent
            context = {
                "workflow_id": workflow_id,
                "execution_id": execution_id,
                "agent_id": agent_id
            }

            result = await agent.execute(input_data, context)

            completed_at = datetime.now()
            latency_ms = int((completed_at - started_at).total_seconds() * 1000)

            # Build metrics
            metrics = AgentExecutionMetrics(
                agent_id=agent_id,
                agent_name=agent_node.name,
                started_at=started_at,
                completed_at=completed_at,
                status=ExecutionStatus.COMPLETED if result.success else ExecutionStatus.FAILED,
                tokens_used=result.tokens_used,
                cost=result.cost,
                latency_ms=latency_ms
            )

            # Build result
            agent_exec_result = ModelAgentExecResult(
                agent_id=agent_id,
                agent_name=agent_node.name,
                started_at=started_at,
                completed_at=completed_at,
                status=ExecutionStatus.COMPLETED if result.success else ExecutionStatus.FAILED,
                output=result.output,
                sources=result.sources,
                metrics=metrics
            )

            self.log(execution_id, "INFO", agent_id,
                    f"Agent completed. Tokens: {result.tokens_used}, Cost: ${result.cost:.4f}, Latency: {latency_ms}ms")

            return agent_exec_result

        except Exception as e:
            completed_at = datetime.now()
            latency_ms = int((completed_at - started_at).total_seconds() * 1000)

            self.log(execution_id, "ERROR", agent_id, f"Agent execution failed: {str(e)}")

            metrics = AgentExecutionMetrics(
                agent_id=agent_id,
                agent_name=agent_node.name,
                started_at=started_at,
                completed_at=completed_at,
                status=ExecutionStatus.FAILED,
                tokens_used=0,
                cost=0.0,
                latency_ms=latency_ms
            )

            return ModelAgentExecResult(
                agent_id=agent_id,
                agent_name=agent_node.name,
                started_at=started_at,
                completed_at=completed_at,
                status=ExecutionStatus.FAILED,
                output={"error": str(e)},
                sources=None,
                metrics=metrics
            )

    def _build_execution_order(self, workflow: Workflow) -> List[Any]:
        """
        Build execution order from workflow graph.

        For now, implements simple sequential execution based on edge ordering.
        Future: Support parallel execution, conditional branching, etc.
        """
        if not workflow.edges:
            # No edges, execute all agents in order
            return workflow.agents

        # Build adjacency list
        adjacency = {agent.id: [] for agent in workflow.agents}
        in_degree = {agent.id: 0 for agent in workflow.agents}

        for edge in workflow.edges:
            adjacency[edge.source].append(edge.target)
            in_degree[edge.target] += 1

        # Find starting agents (in_degree = 0)
        start_agents = [agent_id for agent_id, degree in in_degree.items() if degree == 0]

        if not start_agents:
            # Cycle detected or invalid graph, fall back to sequential
            return workflow.agents

        # Topological sort
        execution_order = []
        queue = start_agents.copy()
        agent_map = {agent.id: agent for agent in workflow.agents}

        while queue:
            current_id = queue.pop(0)
            execution_order.append(agent_map[current_id])

            for neighbor_id in adjacency[current_id]:
                in_degree[neighbor_id] -= 1
                if in_degree[neighbor_id] == 0:
                    queue.append(neighbor_id)

        return execution_order

    def _calculate_metrics(self, agent_executions: List[ModelAgentExecResult]) -> ExecutionMetrics:
        """Calculate overall execution metrics."""
        total_tokens = sum(ae.metrics.tokens_used for ae in agent_executions)
        total_cost = sum(ae.metrics.cost for ae in agent_executions)
        total_latency_ms = sum(ae.metrics.latency_ms for ae in agent_executions)

        agent_metrics = [ae.metrics for ae in agent_executions]

        return ExecutionMetrics(
            total_tokens=total_tokens,
            total_cost=total_cost,
            total_latency_ms=total_latency_ms,
            agents=agent_metrics
        )

    def log(self, execution_id: str, level: str, component: str, message: str):
        """Log execution event."""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "execution_id": execution_id,
            "level": level,
            "component": component,
            "message": message
        }
        self.execution_logs.append(log_entry)
        print(f"[{level}] [{execution_id}] [{component}] {message}")

    def get_logs(self, execution_id: str) -> List[Dict[str, Any]]:
        """Get logs for a specific execution."""
        return [log for log in self.execution_logs if log["execution_id"] == execution_id]
