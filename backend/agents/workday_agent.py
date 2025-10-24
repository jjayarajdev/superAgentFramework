"""
Workday Agent - Example of adding a new agent in ~30 lines.
"""
from typing import Dict, Any, Optional
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)
from data import mock_darwinbox  # Using Darwinbox as mock Workday data


class WorkdayAgentConfig(AgentConfigSchema):
    """Configuration schema for Workday Agent."""

    connector: str = Field(default="workday", description="Connector (workday)")
    query_type: str = Field(
        default="employees",
        description="Type of data to query",
        json_schema_extra={"enum": ["employees", "departments", "performance_reviews"]}
    )
    department_filter: Optional[str] = Field(
        default=None,
        description="Filter by department",
        json_schema_extra={"enum": ["Engineering", "Sales", "Marketing", "Product", "All"]}
    )
    performance_rating: Optional[str] = Field(
        default=None,
        description="Filter by performance rating",
        json_schema_extra={"enum": ["Outstanding", "Exceeds Expectations", "Meets Expectations", "All"]}
    )


@register_agent
class WorkdayAgent(BaseAgent):
    """
    Workday Agent - Query HR data.

    THIS IS AN EXAMPLE showing how easy it is to add a new agent:
    1. Define config schema (fields with types)
    2. Implement execute() method
    3. Set metadata
    4. Use @register_agent decorator
    DONE! Agent is now available in API and UI.
    """

    agent_type = "workday"
    name = "Workday Agent"
    description = "Query Workday HR system for employee data and performance reviews"
    icon = "users"
    category = AgentCategory.DATA_RETRIEVAL
    supported_connectors = ["workday"]
    config_schema = WorkdayAgentConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute Workday query."""
        self.log(f"Querying Workday for {self.config.query_type}...")

        # Build filters
        filters = {}
        if self.config.department_filter and self.config.department_filter != "All":
            filters["department"] = self.config.department_filter
        if self.config.performance_rating and self.config.performance_rating != "All":
            filters["performance_rating"] = self.config.performance_rating

        # Query mock Workday (using Darwinbox data)
        employees = mock_darwinbox.get_employees(filters)

        self.log(f"Found {len(employees)} employees")

        return AgentExecutionResult(
            success=True,
            output={
                "employees": employees,
                "count": len(employees)
            },
            tokens_used=300,
            cost=0.01
        )


# That's it! Agent is now:
# - Available in GET /api/v1/agents/types
# - Automatically appears in UI agent palette
# - Configuration form auto-generated from config schema
# - No frontend code changes needed!
