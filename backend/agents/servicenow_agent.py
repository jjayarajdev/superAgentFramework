"""
ServiceNow Agent - Query and manage IT service tickets and incidents.
"""
from typing import Dict, Any, Optional
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)


class ServiceNowAgentConfig(AgentConfigSchema):
    """Configuration schema for ServiceNow Agent."""

    connector: str = Field(
        default="servicenow",
        description="Connector to use (servicenow)"
    )
    table: str = Field(
        default="incident",
        description="ServiceNow table to query",
        json_schema_extra={
            "enum": ["incident", "change_request", "problem", "catalog_task", "knowledge_base"]
        }
    )
    priority: Optional[str] = Field(
        default=None,
        description="Filter by priority",
        json_schema_extra={
            "enum": ["Critical", "High", "Medium", "Low", "All"]
        }
    )
    state: Optional[str] = Field(
        default="Open",
        description="Filter by state",
        json_schema_extra={
            "enum": ["Open", "In Progress", "Resolved", "Closed", "All"]
        }
    )
    assigned_to: Optional[str] = Field(
        default=None,
        description="Filter by assigned user"
    )


@register_agent
class ServiceNowAgent(BaseAgent):
    """
    ServiceNow Agent.

    Query ServiceNow for IT tickets, incidents, change requests.
    Can also create and update tickets.
    """

    agent_type = "servicenow"
    name = "ServiceNow Agent"
    description = "Query and manage ServiceNow IT service tickets and incidents"
    icon = "ticket"
    category = AgentCategory.DATA_RETRIEVAL
    supported_connectors = ["servicenow"]
    config_schema = ServiceNowAgentConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute ServiceNow query."""
        self.log(f"Querying ServiceNow {self.config.table} table...")

        # Mock ServiceNow data
        mock_incidents = [
            {
                "number": "INC0010234",
                "short_description": "VPN connection issues for remote workers",
                "priority": "High",
                "state": "In Progress",
                "assigned_to": "IT Support Tier 2",
                "opened_at": "2025-10-23 09:15:00",
                "category": "Network"
            },
            {
                "number": "INC0010235",
                "short_description": "Email sync failing for mobile devices",
                "priority": "Medium",
                "state": "Open",
                "assigned_to": "IT Support Tier 1",
                "opened_at": "2025-10-24 08:30:00",
                "category": "Email"
            },
            {
                "number": "INC0010236",
                "short_description": "Database performance degradation in production",
                "priority": "Critical",
                "state": "In Progress",
                "assigned_to": "Database Admin",
                "opened_at": "2025-10-24 10:00:00",
                "category": "Database"
            }
        ]

        # Apply filters
        results = mock_incidents

        if self.config.priority and self.config.priority != "All":
            results = [r for r in results if r["priority"] == self.config.priority]

        if self.config.state and self.config.state != "All":
            results = [r for r in results if r["state"] == self.config.state]

        self.log(f"Found {len(results)} {self.config.table} records")

        return AgentExecutionResult(
            success=True,
            output={
                "table": self.config.table,
                "records": results,
                "count": len(results)
            },
            tokens_used=350,
            cost=0.012
        )
