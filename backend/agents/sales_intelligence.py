"""
Sales Intelligence Agent - queries SFDC for opportunities.
"""
from typing import Dict, Any, Optional
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)
from data import mock_sfdc


class SalesIntelligenceConfig(AgentConfigSchema):
    """Configuration schema for Sales Intelligence Agent."""

    connector: str = Field(
        default="sfdc",
        description="Connector to use (sfdc)"
    )
    object_type: str = Field(
        default="Opportunity",
        description="SFDC object type to query",
        json_schema_extra={"enum": ["Opportunity", "Account", "Contact"]}
    )
    amount_threshold: Optional[int] = Field(
        default=100000,
        description="Minimum opportunity amount ($)",
        ge=0
    )
    close_date_filter: Optional[str] = Field(
        default="Q4",
        description="Close date filter (Q4, Q1, etc.)",
        json_schema_extra={"enum": ["Q1", "Q2", "Q3", "Q4", "All"]}
    )
    stage_filter: Optional[str] = Field(
        default=None,
        description="Filter by stage name"
    )


@register_agent
class SalesIntelligenceAgent(BaseAgent):
    """
    Sales Intelligence Agent.

    Queries Salesforce for opportunities matching criteria.
    Returns structured deal data for downstream agents.
    """

    agent_type = "sales_intelligence"
    name = "Sales Intelligence Agent"
    description = "Query CRM systems for sales data and opportunities"
    icon = "chart-line"
    category = AgentCategory.DATA_RETRIEVAL
    supported_connectors = ["sfdc"]
    config_schema = SalesIntelligenceConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute SFDC query."""
        self.log(f"Querying SFDC for opportunities...")

        # Build filters from config
        filters = {}

        if self.config.amount_threshold:
            filters["Amount"] = f"> {self.config.amount_threshold}"

        if self.config.close_date_filter and self.config.close_date_filter != "All":
            filters["CloseDate"] = f">= {self.config.close_date_filter}"

        if self.config.stage_filter:
            filters["StageName"] = self.config.stage_filter

        # Query mock SFDC connector
        opportunities = mock_sfdc.get_opportunities(filters)

        self.log(f"Found {len(opportunities)} opportunities matching criteria")

        # Return structured output
        return AgentExecutionResult(
            success=True,
            output={
                "deals": opportunities,
                "count": len(opportunities)
            },
            tokens_used=500,  # Mock token count
            cost=0.02  # Mock cost
        )
