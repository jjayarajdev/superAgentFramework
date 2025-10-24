"""
Workflow data models.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime


class AgentPosition(BaseModel):
    """Agent position on canvas."""
    x: int
    y: int


class AgentConfig(BaseModel):
    """Agent configuration - accepts any fields for agent-specific configs."""
    model_config = {"extra": "allow"}  # Allow any additional fields

    # Common fields (all optional)
    connector: Optional[str] = None
    object_type: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    use_rag: bool = False
    email_template: Optional[str] = None
    params: Dict[str, Any] = Field(default_factory=dict)


class AgentNode(BaseModel):
    """Agent node in workflow."""
    id: str
    type: str  # Agent type - validated against AgentRegistry at runtime
    name: str
    description: Optional[str] = None
    config: AgentConfig
    position: AgentPosition

    @field_validator('type')
    @classmethod
    def validate_agent_type(cls, v: str) -> str:
        """Validate that agent type is registered."""
        from agents.base import AgentRegistry
        try:
            AgentRegistry.get_agent_class(v)
            return v
        except ValueError:
            # Get list of available types for error message
            available = list(AgentRegistry._agents.keys())
            raise ValueError(f"Unknown agent type '{v}'. Available types: {', '.join(available)}")


class WorkflowEdge(BaseModel):
    """Edge connecting two agents."""
    source: str  # source agent id
    target: str  # target agent id
    data_mapping: Optional[Dict[str, str]] = None


class WorkflowCreate(BaseModel):
    """Request model for creating workflow."""
    name: str
    description: Optional[str] = None
    agents: List[AgentNode]
    edges: List[WorkflowEdge]


class Workflow(BaseModel):
    """Workflow model."""
    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    created_by: str = "demo_user"
    agents: List[AgentNode]
    edges: List[WorkflowEdge]

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "wf-123",
                "name": "Sales Outreach Workflow",
                "description": "Find deals and send emails",
                "created_at": "2025-10-24T12:00:00Z",
                "updated_at": "2025-10-24T12:00:00Z",
                "created_by": "demo_user",
                "agents": [
                    {
                        "id": "agent_1",
                        "type": "sales_intelligence",
                        "name": "Find High-Value Deals",
                        "config": {
                            "connector": "sfdc",
                            "object_type": "Opportunity",
                            "filters": {"CloseDate": ">= Q4", "Amount": "> 100000"}
                        },
                        "position": {"x": 100, "y": 100}
                    }
                ],
                "edges": []
            }
        }
    }
