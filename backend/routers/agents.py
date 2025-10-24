"""
Agents API router.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from agents import AgentRegistry

router = APIRouter()


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
