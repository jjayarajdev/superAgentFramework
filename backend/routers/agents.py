"""
Agents API router.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from datetime import datetime

from agents import AgentRegistry
from database.models import AgentConfiguration, User
from database.session import get_db
from routers.auth import get_current_user

router = APIRouter()


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class AgentConfigCreate(BaseModel):
    """Schema for creating agent configuration."""
    agent_type: str
    agent_name: str
    config_data: Dict[str, Any]
    is_active: bool = True


class AgentConfigUpdate(BaseModel):
    """Schema for updating agent configuration."""
    agent_name: Optional[str] = None
    config_data: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class AgentConfigResponse(BaseModel):
    """Schema for agent configuration response."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str
    team_id: Optional[str]
    agent_type: str
    agent_name: str
    config_data: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime


@router.get("/types")
async def list_agent_types() -> Dict[str, List[Dict[str, Any]]]:
    """
    List available agent types.

    Agents are dynamically discovered from the agents/ directory.
    No code changes needed here when adding new agents!
    """
    agent_types = AgentRegistry.list_agents()
    return {"agent_types": agent_types}


@router.get("/types/{agent_type}/schema")
async def get_agent_config_schema(agent_type: str) -> Dict[str, Any]:
    """
    Get configuration schema for a specific agent type.

    The schema is used by the frontend to dynamically generate
    configuration forms - no frontend code changes needed!
    """
    try:
        schema = AgentRegistry.get_agent_config_schema(agent_type)
        return {
            "agent_type": agent_type,
            "config_schema": schema
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ============================================================================
# AGENT CONFIGURATION ENDPOINTS
# ============================================================================

@router.post("/configurations", response_model=AgentConfigResponse)
async def create_agent_configuration(
    config: AgentConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create or update agent configuration for the current organization.
    """
    # Check if configuration already exists for this agent type
    existing = db.query(AgentConfiguration).filter(
        AgentConfiguration.org_id == current_user.org_id,
        AgentConfiguration.agent_type == config.agent_type
    ).first()

    if existing:
        # Update existing configuration
        existing.agent_name = config.agent_name
        existing.config_data = config.config_data
        existing.is_active = config.is_active
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    # Create new configuration
    new_config = AgentConfiguration(
        org_id=current_user.org_id,
        team_id=current_user.team_id,
        agent_type=config.agent_type,
        agent_name=config.agent_name,
        config_data=config.config_data,
        is_active=config.is_active,
        created_by=current_user.id
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return new_config


@router.get("/configurations", response_model=List[AgentConfigResponse])
async def list_agent_configurations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all agent configurations for the current organization.
    """
    configs = db.query(AgentConfiguration).filter(
        AgentConfiguration.org_id == current_user.org_id
    ).all()
    return configs


@router.get("/configurations/{agent_type}", response_model=Optional[AgentConfigResponse])
async def get_agent_configuration(
    agent_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get configuration for a specific agent type.
    """
    config = db.query(AgentConfiguration).filter(
        AgentConfiguration.org_id == current_user.org_id,
        AgentConfiguration.agent_type == agent_type
    ).first()

    if not config:
        return None

    return config


@router.put("/configurations/{agent_type}", response_model=AgentConfigResponse)
async def update_agent_configuration(
    agent_type: str,
    config_update: AgentConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update configuration for a specific agent type.
    """
    config = db.query(AgentConfiguration).filter(
        AgentConfiguration.org_id == current_user.org_id,
        AgentConfiguration.agent_type == agent_type
    ).first()

    if not config:
        raise HTTPException(status_code=404, detail="Agent configuration not found")

    # Update fields if provided
    if config_update.agent_name is not None:
        config.agent_name = config_update.agent_name
    if config_update.config_data is not None:
        config.config_data = config_update.config_data
    if config_update.is_active is not None:
        config.is_active = config_update.is_active

    config.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(config)
    return config


@router.delete("/configurations/{agent_type}")
async def delete_agent_configuration(
    agent_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete configuration for a specific agent type.
    """
    config = db.query(AgentConfiguration).filter(
        AgentConfiguration.org_id == current_user.org_id,
        AgentConfiguration.agent_type == agent_type
    ).first()

    if not config:
        raise HTTPException(status_code=404, detail="Agent configuration not found")

    db.delete(config)
    db.commit()
    return {"message": "Agent configuration deleted successfully"}
