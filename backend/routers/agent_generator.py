"""
Agent Generator API - Create new agents programmatically.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import subprocess
import os
from pathlib import Path

router = APIRouter()


class ConfigField(BaseModel):
    """Configuration field definition."""
    name: str
    type: str
    description: str
    required: bool = False
    default: Optional[str] = None


class AgentGenerateRequest(BaseModel):
    """Request to generate a new agent."""
    name: str = Field(description="Agent display name")
    id: str = Field(description="Agent identifier (lowercase, underscores)")
    category: str = Field(description="Agent category")
    description: str = Field(description="What does this agent do")
    icon: Optional[str] = Field(default=None, description="Lucide icon name")
    template: Optional[str] = Field(default="custom", description="Template to use")
    config_fields: List[ConfigField] = Field(default_factory=list, description="Configuration fields")


@router.post("/generate")
async def generate_agent(request: AgentGenerateRequest):
    """
    Generate a new agent using the CLI tool.

    Creates agent file, test file, and updates imports automatically.
    """

    # Validate agent ID
    if not request.id.replace('_', '').isalnum():
        raise HTTPException(
            status_code=400,
            detail="Agent ID must contain only letters, numbers, and underscores"
        )

    # Check if agent already exists
    backend_dir = Path(__file__).parent.parent
    agent_path = backend_dir / "agents" / f"{request.id}_agent.py"

    if agent_path.exists():
        raise HTTPException(
            status_code=400,
            detail=f"Agent '{request.id}' already exists"
        )

    # Build CLI command
    cmd = [
        "python3",
        str(backend_dir / "scripts" / "create_agent.py"),
        "--name", request.name,
        "--id", request.id,
        "--category", request.category,
        "--description", request.description
    ]

    if request.icon:
        cmd.extend(["--icon", request.icon])

    # Run CLI tool
    try:
        result = subprocess.run(
            cmd,
            cwd=str(backend_dir),
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Agent generation failed: {result.stderr}"
            )

        return {
            "success": True,
            "agent_id": request.id,
            "agent_file": str(agent_path),
            "message": f"Agent '{request.name}' created successfully. Restart backend to use it.",
            "output": result.stdout
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=500,
            detail="Agent generation timed out"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Agent generation failed: {str(e)}"
        )


@router.get("/templates")
async def list_templates():
    """List available agent templates."""
    from scripts.agent_templates import TEMPLATES

    return {
        "templates": [
            {
                "id": template_id,
                "name": template["name"],
                "description": template["description"],
                "category": template["category"]
            }
            for template_id, template in TEMPLATES.items()
        ]
    }


@router.get("/categories")
async def list_categories():
    """List available agent categories."""
    return {
        "categories": [
            {
                "id": "data_retrieval",
                "name": "Data Retrieval",
                "description": "Query and fetch data from external sources",
                "icon": "database"
            },
            {
                "id": "action",
                "name": "Action",
                "description": "Perform actions like create, update, delete",
                "icon": "zap"
            },
            {
                "id": "communication",
                "name": "Communication",
                "description": "Send messages and notifications",
                "icon": "message-square"
            },
            {
                "id": "analysis",
                "name": "Analysis",
                "description": "Analyze and process data",
                "icon": "brain"
            },
            {
                "id": "automation",
                "name": "Automation",
                "description": "Automated workflows and tasks",
                "icon": "cpu"
            }
        ]
    }


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str):
    """
    Delete an agent (remove files and imports).

    WARNING: This is destructive and cannot be undone!
    """

    backend_dir = Path(__file__).parent.parent
    agent_path = backend_dir / "agents" / f"{agent_id}_agent.py"
    test_path = backend_dir / "tests" / f"test_{agent_id}_agent.py"

    if not agent_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Agent '{agent_id}' not found"
        )

    try:
        # Remove agent file
        agent_path.unlink()
        removed = [str(agent_path)]

        # Remove test file if exists
        if test_path.exists():
            test_path.unlink()
            removed.append(str(test_path))

        # TODO: Remove from __init__.py imports
        # (requires parsing and modifying Python file)

        return {
            "success": True,
            "removed_files": removed,
            "message": f"Agent '{agent_id}' deleted. Restart backend to complete removal."
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete agent: {str(e)}"
        )
