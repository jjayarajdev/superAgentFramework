"""
Chat Router - Conversational AI interface for SuperAgent.

This router provides a chat endpoint where users can:
1. Ask questions in natural language
2. Get routed to appropriate workflows or agents automatically
3. See execution results in conversational format
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import User
from auth.jwt import get_current_user
from agents.supervisor_agent import SupervisorAgent, SupervisorConfig


router = APIRouter()


class ChatMessageRequest(BaseModel):
    """Request body for chat message."""
    message: str


class ChatMessageResponse(BaseModel):
    """Response for chat message."""
    response: str
    workflow_executed: Optional[str] = None
    agents_used: Optional[list] = None
    execution_id: Optional[str] = None
    status: str = "success"


@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process a chat message using the Supervisor Agent.

    Flow:
    1. Receive natural language query from user
    2. Pass to Supervisor Agent for intent classification
    3. Supervisor routes to workflow or agent(s)
    4. Return results in conversational format

    Examples:
    - "Show me high-value deals" → Sales Intelligence Agent
    - "Onboard new employee" → HR Onboarding Workflow
    - "Find deals and notify team" → Sales + Slack Workflow
    """

    # Validate input
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )

    # Create context for supervisor
    context = {
        "org_id": current_user.org_id,
        "team_id": current_user.team_id,
        "user_id": current_user.id,
        "user_email": current_user.email,
        "user_role": current_user.role
    }

    # Initialize Supervisor Agent
    supervisor_config = SupervisorConfig(
        llm_provider="openai",
        model="gpt-4",
        workflow_matching_threshold=0.7
    )

    supervisor = SupervisorAgent(
        agent_id="chat_supervisor",
        config=supervisor_config.model_dump()
    )

    # Execute supervisor
    try:
        result = await supervisor.execute(
            input_data={"query": request.message},
            context=context
        )

        if result.success:
            # Extract information from result
            output = result.output or {}

            # Format conversational response
            response_text = _format_response(output, request.message)

            return ChatMessageResponse(
                response=response_text,
                workflow_executed=output.get("workflow_name"),
                agents_used=output.get("agents_used"),
                execution_id=output.get("execution_id"),
                status="success"
            )
        else:
            # Handle failure
            error_message = result.error or "I couldn't process that request."
            suggestions = result.output.get("suggestions", []) if result.output else []

            response_text = f"{error_message}\n\n"
            if suggestions:
                response_text += "Here are some things I can help with:\n"
                for suggestion in suggestions:
                    response_text += f"• {suggestion}\n"

            return ChatMessageResponse(
                response=response_text,
                status="error"
            )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )


def _format_response(output: Dict[str, Any], original_query: str) -> str:
    """
    Format supervisor output into a conversational response.

    This makes the chat feel more natural and user-friendly.
    """

    # If workflow was executed
    if "workflow_name" in output and "execution_id" in output:
        workflow_name = output["workflow_name"]
        status = output.get("status", "completed")

        if status == "completed":
            response = f"✅ I've executed the **{workflow_name}** workflow for you!\n\n"

            # Add intent and workflow identification information
            if "intent" in output:
                intent = output["intent"]
                response += f"**Intent Detected:**\n"
                response += f"• Type: {intent.get('execution_type', 'N/A')}\n"
                response += f"• Action: {intent.get('primary_action', 'N/A')}\n"
                if intent.get('entities'):
                    response += f"• Entities: {intent.get('entities')}\n"
                response += f"• Query: \"{intent.get('query_normalized', original_query)}\"\n\n"

            if "workflow_identified" in output:
                wf = output["workflow_identified"]
                response += f"**Workflow Identified:**\n"
                response += f"• Name: {wf.get('name')}\n"
                response += f"• ID: {wf.get('id')}\n"
                if wf.get('description'):
                    response += f"• Description: {wf.get('description')}\n"
                response += f"• Method: {wf.get('matching_method', 'keyword')}\n\n"

            # Add results if available
            if "results" in output and output["results"]:
                results = output["results"]

                # Format based on result type
                if isinstance(results, dict):
                    # Check for common result patterns
                    if "deals" in results:
                        deals = results["deals"]
                        if isinstance(deals, list) and deals:
                            response += f"Found {len(deals)} deal(s):\n"
                            for deal in deals[:5]:  # Show first 5
                                name = deal.get("Name", "Unnamed")
                                amount = deal.get("Amount", 0)
                                stage = deal.get("StageName", "Unknown")
                                response += f"• **{name}** - ${amount:,} ({stage})\n"

                            if len(deals) > 5:
                                response += f"...and {len(deals) - 5} more\n"

                    elif "message" in results:
                        response += f"{results['message']}\n"

                    elif "emails_sent" in results:
                        count = results.get("emails_sent", 0)
                        response += f"Sent {count} email(s) successfully.\n"

                    elif "issues" in results:
                        issues = results["issues"]
                        if isinstance(issues, list):
                            response += f"Found {len(issues)} Jira issue(s).\n"

                    else:
                        # Generic result display
                        response += f"Results: {results}\n"

            return response

        elif status == "running":
            return f"⏳ Running the **{workflow_name}** workflow... Check back shortly for results."

        else:
            return f"⚠️ The **{workflow_name}** workflow encountered an issue. Please check the execution logs."

    # If dynamic orchestration was performed
    elif "workflow_type" in output and output["workflow_type"] == "dynamic_orchestration":
        response = f"🤖 **Dynamic Multi-Agent Orchestration**\n\n"

        # Add intent information
        if "intent" in output:
            intent = output["intent"]
            response += f"**Intent Detected:**\n"
            response += f"• Type: {intent.get('execution_type', 'N/A')}\n"
            response += f"• Action: {intent.get('primary_action', 'N/A')}\n"
            if intent.get('entities'):
                response += f"• Entities: {intent.get('entities')}\n"
            response += f"• Query: \"{intent.get('query_normalized', original_query)}\"\n\n"

        # Add execution plan
        if "execution_plan" in output:
            plan = output["execution_plan"]
            response += f"**Execution Plan:**\n"
            response += f"• Agents: {len(plan.get('agents', []))}\n"
            response += f"• Flow: {plan.get('data_flow', 'sequential')}\n"
            response += f"• Rationale: {plan.get('rationale', 'N/A')}\n\n"

            response += f"**Agent Chain:**\n"
            for idx, agent in enumerate(plan.get('agents', []), 1):
                response += f"{idx}. **{agent['type'].title()}**"
                if agent.get('config'):
                    response += f" (config: {agent['config']})"
                response += "\n"
            response += "\n"

        # Add results if available
        if "results" in output and output["results"]:
            results = output["results"]
            response += f"**Results:**\n"
            if isinstance(results, dict):
                if "message" in results:
                    response += f"{results['message']}\n"
                else:
                    response += f"{results}\n"
            else:
                response += f"{results}\n"

        response += f"\n✅ Execution ID: `{output.get('execution_id', 'N/A')}`"

        return response

    # If single agent was executed
    elif "agent_type" in output:
        agent_type = output["agent_type"]
        return f"I would execute the **{agent_type}** agent for: \"{original_query}\""

    # If multiple agents would be orchestrated (fallback/preview mode)
    elif "agents" in output and isinstance(output["agents"], list):
        agents = output["agents"]
        return f"I would orchestrate these agents: {', '.join(agents)}"

    # Generic fallback
    elif "message" in output:
        return output["message"]

    else:
        return "I processed your request, but couldn't generate a detailed response."


@router.get("/history")
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get chat history for current user.

    TODO: Implement chat history storage in database.
    For now, return empty list.
    """
    return {
        "history": [],
        "message": "Chat history not yet implemented"
    }


@router.delete("/history")
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear chat history for current user.

    TODO: Implement when chat history storage is added.
    """
    return {
        "message": "Chat history cleared"
    }
