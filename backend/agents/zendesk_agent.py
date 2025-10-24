"""
Zendesk Agent - Query customer support tickets and manage support operations.
"""
from typing import Dict, Any, Optional
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)


class ZendeskAgentConfig(AgentConfigSchema):
    """Configuration schema for Zendesk Agent."""

    connector: str = Field(
        default="zendesk",
        description="Connector to use (zendesk)"
    )
    query_type: str = Field(
        default="tickets",
        description="Type of data to query",
        json_schema_extra={
            "enum": ["tickets", "users", "organizations", "satisfaction_ratings"]
        }
    )
    ticket_status: Optional[str] = Field(
        default="open",
        description="Filter tickets by status",
        json_schema_extra={
            "enum": ["new", "open", "pending", "solved", "closed", "all"]
        }
    )
    priority: Optional[str] = Field(
        default=None,
        description="Filter by priority",
        json_schema_extra={
            "enum": ["urgent", "high", "normal", "low", "All"]
        }
    )
    assigned_to: Optional[str] = Field(
        default=None,
        description="Filter by assignee (agent email or ID)"
    )
    tags: Optional[str] = Field(
        default=None,
        description="Filter by tags (comma-separated)"
    )


@register_agent
class ZendeskAgent(BaseAgent):
    """
    Zendesk Agent.

    Query Zendesk for customer support tickets, users, and satisfaction ratings.
    Can retrieve tickets by status, priority, assignee, and tags.
    """

    agent_type = "zendesk"
    name = "Zendesk Agent"
    description = "Query Zendesk for customer support tickets and satisfaction data"
    icon = "headphones"
    category = AgentCategory.DATA_RETRIEVAL
    supported_connectors = ["zendesk"]
    config_schema = ZendeskAgentConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute Zendesk query."""
        self.log(f"Querying Zendesk for {self.config.query_type}...")

        # Mock Zendesk tickets
        mock_tickets = [
            {
                "id": "12345",
                "subject": "Login issues after password reset",
                "status": "open",
                "priority": "high",
                "requester": "customer1@example.com",
                "assignee": "support@example.com",
                "tags": ["password", "login", "urgent"],
                "created_at": "2025-10-23 14:30:00",
                "updated_at": "2025-10-24 09:15:00"
            },
            {
                "id": "12346",
                "subject": "Feature request: Export to CSV",
                "status": "open",
                "priority": "normal",
                "requester": "customer2@example.com",
                "assignee": "product@example.com",
                "tags": ["feature_request", "export"],
                "created_at": "2025-10-22 10:00:00",
                "updated_at": "2025-10-23 16:20:00"
            },
            {
                "id": "12347",
                "subject": "Billing inquiry about invoice",
                "status": "pending",
                "priority": "normal",
                "requester": "customer3@example.com",
                "assignee": "billing@example.com",
                "tags": ["billing", "invoice"],
                "created_at": "2025-10-24 08:00:00",
                "updated_at": "2025-10-24 10:30:00"
            },
            {
                "id": "12348",
                "subject": "API integration not working",
                "status": "open",
                "priority": "urgent",
                "requester": "customer4@example.com",
                "assignee": "engineering@example.com",
                "tags": ["api", "integration", "bug"],
                "created_at": "2025-10-24 11:00:00",
                "updated_at": "2025-10-24 11:30:00"
            }
        ]

        # Mock satisfaction ratings
        mock_ratings = [
            {
                "ticket_id": "12340",
                "rating": "good",
                "comment": "Very helpful support team!",
                "created_at": "2025-10-20"
            },
            {
                "ticket_id": "12341",
                "rating": "bad",
                "comment": "Took too long to resolve",
                "created_at": "2025-10-21"
            }
        ]

        # Select data based on query type
        if self.config.query_type == "tickets":
            results = mock_tickets

            # Apply filters
            if self.config.ticket_status != "all":
                results = [r for r in results if r["status"] == self.config.ticket_status]

            if self.config.priority and self.config.priority != "All":
                results = [r for r in results if r["priority"] == self.config.priority]

            if self.config.assigned_to:
                results = [r for r in results if r["assignee"] == self.config.assigned_to]

        elif self.config.query_type == "satisfaction_ratings":
            results = mock_ratings

        else:
            results = []

        self.log(f"Found {len(results)} {self.config.query_type}")

        return AgentExecutionResult(
            success=True,
            output={
                "query_type": self.config.query_type,
                "records": results,
                "count": len(results)
            },
            tokens_used=420,
            cost=0.014
        )
