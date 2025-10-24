"""
SAP ERP Agent - Query SAP for financial and operational data.
"""
from typing import Dict, Any, Optional, List
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)


class SAPAgentConfig(AgentConfigSchema):
    """Configuration schema for SAP Agent."""

    connector: str = Field(
        default="sap",
        description="Connector to use (sap)"
    )
    module: Optional[str] = Field(
        default="finance",
        description="SAP module to query",
        json_schema_extra={
            "enum": [
                "finance",
                "procurement",
                "sales_distribution",
                "materials_management",
                "human_capital"
            ]
        }
    )
    query_type: Optional[str] = Field(
        default="purchase_orders",
        description="Type of data to retrieve",
        json_schema_extra={
            "enum": [
                "purchase_orders",
                "vendor_invoices",
                "inventory_levels",
                "sales_orders",
                "general_ledger"
            ]
        }
    )
    object_type: Optional[str] = Field(
        default=None,
        description="Alternative: Object type to query (purchase_order, invoice, etc.)"
    )
    status_filter: Optional[str] = Field(
        default=None,
        description="Filter by status (approved, pending, open, etc.)",
        json_schema_extra={
            "enum": ["approved", "pending", "open", "closed", "All"]
        }
    )
    date_range: Optional[str] = Field(
        default="last_30_days",
        description="Date range for query",
        json_schema_extra={
            "enum": ["today", "last_7_days", "last_30_days", "this_month", "last_quarter", "last_year"]
        }
    )
    company_code: Optional[str] = Field(
        default=None,
        description="SAP company code filter"
    )


@register_agent
class SAPAgent(BaseAgent):
    """
    SAP ERP Agent.

    Query SAP for financial, procurement, and operational data.
    Supports multiple modules and query types.
    """

    agent_type = "sap"
    name = "SAP ERP Agent"
    description = "Query SAP ERP system for financial, procurement, and operational data"
    icon = "building"
    category = AgentCategory.DATA_RETRIEVAL
    supported_connectors = ["sap"]
    config_schema = SAPAgentConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute SAP query."""
        # Handle both query_type and object_type fields
        query_key = self.config.query_type or "purchase_orders"
        if self.config.object_type:
            # Map object_type to query_type
            if "purchase" in self.config.object_type.lower():
                query_key = "purchase_orders"
            elif "invoice" in self.config.object_type.lower():
                query_key = "vendor_invoices"

        self.log(f"Querying SAP for {query_key}...")

        # Mock SAP data based on query type
        mock_data = {
            "purchase_orders": [
                {"po_number": "PO-2025-001", "vendor": "Acme Supplies Inc", "amount": 125000, "currency": "USD",
                 "status": "approved", "created_date": "2025-10-15", "delivery_date": "2025-11-30"},
                {"po_number": "PO-2025-002", "vendor": "Globex Materials", "amount": 87500, "currency": "USD",
                 "status": "approved", "created_date": "2025-10-18", "delivery_date": "2025-12-15"},
                {"po_number": "PO-2025-003", "vendor": "Initech Hardware", "amount": 65000, "currency": "USD",
                 "status": "approved", "created_date": "2025-10-20", "delivery_date": "2025-12-05"},
                {"po_number": "PO-2025-004", "vendor": "Umbrella Tech", "amount": 92000, "currency": "USD",
                 "status": "pending", "created_date": "2025-10-22", "delivery_date": "2025-12-20"},
                {"po_number": "PO-2025-005", "vendor": "Stark Components", "amount": 145000, "currency": "USD",
                 "status": "approved", "created_date": "2025-10-10", "delivery_date": "2025-11-15"}
            ],
            "vendor_invoices": [
                {"invoice_number": "INV-45678", "vendor": "Initech Solutions", "amount": 50000, "currency": "USD",
                 "status": "approved", "due_date": "2025-11-15"},
                {"invoice_number": "INV-45679", "vendor": "Acme Corp", "amount": 72000, "currency": "USD",
                 "status": "pending", "due_date": "2025-11-20"},
                {"invoice_number": "INV-45680", "vendor": "Globex Industries", "amount": 38000, "currency": "USD",
                 "status": "approved", "due_date": "2025-11-10"}
            ]
        }

        results = mock_data.get(query_key, [])

        # Apply status filter
        if self.config.status_filter and self.config.status_filter != "All":
            results = [r for r in results if r.get("status", "").lower() == self.config.status_filter.lower()]

        self.log(f"Found {len(results)} records from SAP")

        return AgentExecutionResult(
            success=True,
            output={
                "query_type": query_key,
                "records": results,
                "count": len(results)
            },
            tokens_used=400,
            cost=0.015
        )
