"""
HubSpot Agent - Query marketing and CRM data from HubSpot.
"""
from typing import Dict, Any, Optional
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)


class HubSpotAgentConfig(AgentConfigSchema):
    """Configuration schema for HubSpot Agent."""

    connector: str = Field(
        default="hubspot",
        description="Connector to use (hubspot)"
    )
    object_type: str = Field(
        default="contacts",
        description="HubSpot object type to query",
        json_schema_extra={
            "enum": ["contacts", "companies", "deals", "tickets", "marketing_emails"]
        }
    )
    lifecycle_stage: Optional[str] = Field(
        default=None,
        description="Filter by lifecycle stage",
        json_schema_extra={
            "enum": ["Lead", "MQL", "SQL", "Opportunity", "Customer", "All"]
        }
    )
    lead_status_filter: Optional[str] = Field(
        default=None,
        description="Filter by lead status",
        json_schema_extra={
            "enum": ["new", "contacted", "qualified", "unqualified", "All"]
        }
    )
    deal_stage: Optional[str] = Field(
        default=None,
        description="Filter by deal stage",
        json_schema_extra={
            "enum": ["Qualified", "Presentation", "Negotiation", "Closed Won", "Closed Lost", "All"]
        }
    )
    date_range: Optional[str] = Field(
        default="last_30_days",
        description="Date range filter",
        json_schema_extra={
            "enum": ["today", "last_7_days", "last_30_days", "last_quarter", "all_time"]
        }
    )
    max_results: Optional[int] = Field(
        default=20,
        description="Maximum number of results to return",
        ge=1,
        le=100
    )


@register_agent
class HubSpotAgent(BaseAgent):
    """
    HubSpot Agent.

    Query HubSpot for marketing and CRM data including
    contacts, companies, deals, tickets, and email campaigns.
    """

    agent_type = "hubspot"
    name = "HubSpot Agent"
    description = "Query HubSpot for marketing and CRM data (contacts, deals, campaigns)"
    icon = "target"
    category = AgentCategory.DATA_RETRIEVAL
    supported_connectors = ["hubspot"]
    config_schema = HubSpotAgentConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute HubSpot query."""
        self.log(f"Querying HubSpot for {self.config.object_type}...")

        # Mock HubSpot data
        mock_data = {
            "contacts": [
                {"id": "10001", "email": "john.smith@acmecorp.com", "firstname": "John", "lastname": "Smith",
                 "company": "Acme Corporation", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 75, "last_contacted": "2025-10-23"},
                {"id": "10002", "email": "sarah.johnson@globex.com", "firstname": "Sarah", "lastname": "Johnson",
                 "company": "Globex Industries", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 82, "last_contacted": "2025-10-23"},
                {"id": "10003", "email": "mike.chen@initech.com", "firstname": "Mike", "lastname": "Chen",
                 "company": "Initech Solutions", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 68, "last_contacted": "2025-10-24"},
                {"id": "10004", "email": "lisa.anderson@umbrella.com", "firstname": "Lisa", "lastname": "Anderson",
                 "company": "Umbrella Corp", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 91, "last_contacted": "2025-10-24"},
                {"id": "10005", "email": "david.martinez@stark.com", "firstname": "David", "lastname": "Martinez",
                 "company": "Stark Industries", "lifecycle_stage": "MQL", "lead_status": "contacted", "lead_score": 85, "last_contacted": "2025-10-20"},
                {"id": "10006", "email": "emma.wilson@wayne.com", "firstname": "Emma", "lastname": "Wilson",
                 "company": "Wayne Enterprises", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 77, "last_contacted": "2025-10-24"},
                {"id": "10007", "email": "james.taylor@tyrell.com", "firstname": "James", "lastname": "Taylor",
                 "company": "Tyrell Corporation", "lifecycle_stage": "SQL", "lead_status": "qualified", "lead_score": 95, "last_contacted": "2025-10-18"},
                {"id": "10008", "email": "sophia.brown@massive.com", "firstname": "Sophia", "lastname": "Brown",
                 "company": "Massive Dynamic", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 71, "last_contacted": "2025-10-24"},
                {"id": "10009", "email": "ryan.garcia@cyberdyne.com", "firstname": "Ryan", "lastname": "Garcia",
                 "company": "Cyberdyne Systems", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 80, "last_contacted": "2025-10-23"},
                {"id": "10010", "email": "olivia.lee@soylent.com", "firstname": "Olivia", "lastname": "Lee",
                 "company": "Soylent Corp", "lifecycle_stage": "Opportunity", "lead_status": "qualified", "lead_score": 88, "last_contacted": "2025-10-19"},
                {"id": "10011", "email": "william.kim@weyland.com", "firstname": "William", "lastname": "Kim",
                 "company": "Weyland-Yutani", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 73, "last_contacted": "2025-10-24"},
                {"id": "10012", "email": "ava.rodriguez@oscorp.com", "firstname": "Ava", "lastname": "Rodriguez",
                 "company": "Oscorp Industries", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 79, "last_contacted": "2025-10-23"},
                {"id": "10013", "email": "ethan.nguyen@hooli.com", "firstname": "Ethan", "lastname": "Nguyen",
                 "company": "Hooli", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 84, "last_contacted": "2025-10-24"},
                {"id": "10014", "email": "mia.patel@piedpiper.com", "firstname": "Mia", "lastname": "Patel",
                 "company": "Pied Piper", "lifecycle_stage": "MQL", "lead_status": "contacted", "lead_score": 87, "last_contacted": "2025-10-21"},
                {"id": "10015", "email": "noah.jackson@aviato.com", "firstname": "Noah", "lastname": "Jackson",
                 "company": "Aviato", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 76, "last_contacted": "2025-10-23"},
                {"id": "10016", "email": "isabella.white@raviga.com", "firstname": "Isabella", "lastname": "White",
                 "company": "Raviga Capital", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 81, "last_contacted": "2025-10-24"},
                {"id": "10017", "email": "lucas.thomas@bluth.com", "firstname": "Lucas", "lastname": "Thomas",
                 "company": "Bluth Company", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 70, "last_contacted": "2025-10-24"},
                {"id": "10018", "email": "amelia.harris@dunder.com", "firstname": "Amelia", "lastname": "Harris",
                 "company": "Dunder Mifflin", "lifecycle_stage": "SQL", "lead_status": "qualified", "lead_score": 93, "last_contacted": "2025-10-17"},
                {"id": "10019", "email": "mason.clark@sterling.com", "firstname": "Mason", "lastname": "Clark",
                 "company": "Sterling Cooper", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 78, "last_contacted": "2025-10-23"},
                {"id": "10020", "email": "harper.lopez@bachmanity.com", "firstname": "Harper", "lastname": "Lopez",
                 "company": "Bachmanity", "lifecycle_stage": "Lead", "lead_status": "new", "lead_score": 74, "last_contacted": "2025-10-24"}
            ],
            "deals": [
                {
                    "id": "20001",
                    "dealname": "Acme Corp - Enterprise Plan",
                    "amount": 125000,
                    "dealstage": "Negotiation",
                    "closedate": "2025-11-30",
                    "pipeline": "Sales",
                    "owner": "sales@example.com"
                },
                {
                    "id": "20002",
                    "dealname": "Globex - Annual Contract",
                    "amount": 87500,
                    "dealstage": "Presentation",
                    "closedate": "2025-12-15",
                    "pipeline": "Sales",
                    "owner": "sales@example.com"
                }
            ],
            "marketing_emails": [
                {
                    "id": "30001",
                    "name": "Q4 Product Launch",
                    "subject": "Introducing our new Enterprise Platform",
                    "sent_count": 5420,
                    "open_rate": 28.5,
                    "click_rate": 12.3,
                    "sent_date": "2025-10-15"
                }
            ]
        }

        results = mock_data.get(self.config.object_type, [])

        # Apply filters
        if self.config.lifecycle_stage and self.config.lifecycle_stage != "All":
            results = [r for r in results if r.get("lifecycle_stage") == self.config.lifecycle_stage]

        if self.config.lead_status_filter and self.config.lead_status_filter != "All":
            results = [r for r in results if r.get("lead_status") == self.config.lead_status_filter]

        if self.config.deal_stage and self.config.deal_stage != "All":
            results = [r for r in results if r.get("dealstage") == self.config.deal_stage]

        # Limit results
        if self.config.max_results:
            results = results[:self.config.max_results]

        self.log(f"Found {len(results)} {self.config.object_type}")

        return AgentExecutionResult(
            success=True,
            output={
                "object_type": self.config.object_type,
                "records": results,
                "count": len(results)
            },
            tokens_used=380,
            cost=0.013
        )
