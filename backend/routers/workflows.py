"""
Workflows API router - DATABASE EDITION.
Uses SQLite/PostgreSQL for persistent storage with multi-tenancy.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from models.workflow import Workflow, WorkflowCreate
from database.session import get_db
from database.models import WorkflowDB, User
from auth.jwt import get_current_user
from auth.rbac import Permission, require_permission, has_permission
from auth.middleware import get_tenant_context
from services.audit import audit_logger
from config import settings

router = APIRouter()


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def workflow_db_to_model(db_workflow: WorkflowDB) -> Workflow:
    """Convert database WorkflowDB to API Workflow model."""
    return Workflow(
        id=db_workflow.id,
        name=db_workflow.name,
        description=db_workflow.description,
        created_at=db_workflow.created_at,
        updated_at=db_workflow.updated_at,
        agents=db_workflow.agents,
        edges=db_workflow.edges
    )


# ============================================================================
# WORKFLOW CRUD ENDPOINTS
# ============================================================================

@router.post("/", response_model=Workflow)
async def create_workflow(
    workflow: WorkflowCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new workflow.

    Requires: workflows.create permission (Developer or Admin role)
    """
    # Check permission
    if not has_permission(current_user, Permission.WORKFLOW_CREATE):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required: workflows.create"
        )

    # Get tenant context
    context = get_tenant_context(request)

    # Create workflow in database
    workflow_id = f"wf_{str(uuid.uuid4())[:8]}"

    db_workflow = WorkflowDB(
        id=workflow_id,
        org_id=current_user.org_id,
        team_id=current_user.team_id,
        created_by=current_user.id,
        name=workflow.name,
        description=workflow.description,
        agents=[agent.model_dump() if hasattr(agent, 'model_dump') else agent for agent in workflow.agents],
        edges=[edge.model_dump() if hasattr(edge, 'model_dump') else edge for edge in workflow.edges],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)

    # Audit log
    await audit_logger.log_workflow_created(
        db=db,
        workflow_id=db_workflow.id,
        workflow_name=db_workflow.name,
        org_id=current_user.org_id,
        user_id=current_user.id
    )

    return workflow_db_to_model(db_workflow)


@router.get("/", response_model=List[Workflow])
async def list_workflows(
    request: Request,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List workflows for current user's organization/team.

    Requires: workflows.read permission (All roles)

    Multi-tenancy: Only returns workflows from user's org/team.
    """
    # Check permission
    if not has_permission(current_user, Permission.WORKFLOW_READ):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required: workflows.read"
        )

    # Query workflows for user's org/team (data isolation)
    query = db.query(WorkflowDB).filter(
        WorkflowDB.org_id == current_user.org_id,
        WorkflowDB.team_id == current_user.team_id
    )

    # Apply pagination
    workflows = query.order_by(WorkflowDB.created_at.desc()).offset(offset).limit(limit).all()

    return [workflow_db_to_model(wf) for wf in workflows]


@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(
    workflow_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get workflow by ID.

    Requires: workflows.read permission

    Multi-tenancy: Can only access workflows in user's org/team.
    """
    # Check permission
    if not has_permission(current_user, Permission.WORKFLOW_READ):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required: workflows.read"
        )

    # Query with tenant filtering
    db_workflow = db.query(WorkflowDB).filter(
        WorkflowDB.id == workflow_id,
        WorkflowDB.org_id == current_user.org_id,
        WorkflowDB.team_id == current_user.team_id
    ).first()

    if not db_workflow:
        raise HTTPException(
            status_code=404,
            detail="Workflow not found or access denied"
        )

    return workflow_db_to_model(db_workflow)


@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(
    workflow_id: str,
    workflow: WorkflowCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update workflow.

    Requires: workflows.update permission (Developer or Admin)

    Multi-tenancy: Can only update workflows in user's org/team.
    """
    # Check permission
    if not has_permission(current_user, Permission.WORKFLOW_UPDATE):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required: workflows.update"
        )

    # Query with tenant filtering
    db_workflow = db.query(WorkflowDB).filter(
        WorkflowDB.id == workflow_id,
        WorkflowDB.org_id == current_user.org_id,
        WorkflowDB.team_id == current_user.team_id
    ).first()

    if not db_workflow:
        raise HTTPException(
            status_code=404,
            detail="Workflow not found or access denied"
        )

    # Update workflow
    db_workflow.name = workflow.name
    db_workflow.description = workflow.description
    db_workflow.agents = [agent.model_dump() if hasattr(agent, 'model_dump') else agent for agent in workflow.agents]
    db_workflow.edges = [edge.model_dump() if hasattr(edge, 'model_dump') else edge for edge in workflow.edges]
    db_workflow.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(db_workflow)

    # Audit log
    await audit_logger.log(
        db=db,
        action="workflow.updated",
        resource_type="workflow",
        resource_id=workflow_id,
        org_id=current_user.org_id,
        user_id=current_user.id,
        details={"name": workflow.name}
    )

    return workflow_db_to_model(db_workflow)


@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete workflow.

    Requires: workflows.delete permission (Developer or Admin)

    Multi-tenancy: Can only delete workflows in user's org/team.
    """
    # Check permission
    if not has_permission(current_user, Permission.WORKFLOW_DELETE):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required: workflows.delete"
        )

    # Query with tenant filtering
    db_workflow = db.query(WorkflowDB).filter(
        WorkflowDB.id == workflow_id,
        WorkflowDB.org_id == current_user.org_id,
        WorkflowDB.team_id == current_user.team_id
    ).first()

    if not db_workflow:
        raise HTTPException(
            status_code=404,
            detail="Workflow not found or access denied"
        )

    # Store name for audit log
    workflow_name = db_workflow.name

    # Delete workflow
    db.delete(db_workflow)
    db.commit()

    # Audit log
    await audit_logger.log_workflow_deleted(
        db=db,
        workflow_id=workflow_id,
        workflow_name=workflow_name,
        org_id=current_user.org_id,
        user_id=current_user.id
    )

    return {"deleted": True, "workflow_id": workflow_id}


# ============================================================================
# STATISTICS & ANALYTICS
# ============================================================================

@router.get("/{workflow_id}/stats")
async def get_workflow_stats(
    workflow_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get workflow statistics (execution count, success rate, etc.).

    Requires: workflows.read permission
    """
    # Check permission
    if not has_permission(current_user, Permission.WORKFLOW_READ):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required: workflows.read"
        )

    # Query with tenant filtering
    db_workflow = db.query(WorkflowDB).filter(
        WorkflowDB.id == workflow_id,
        WorkflowDB.org_id == current_user.org_id,
        WorkflowDB.team_id == current_user.team_id
    ).first()

    if not db_workflow:
        raise HTTPException(
            status_code=404,
            detail="Workflow not found or access denied"
        )

    # Calculate statistics
    total_executions = db_workflow.execution_count
    success_count = db_workflow.success_count
    failure_count = db_workflow.failure_count
    success_rate = (success_count / total_executions * 100) if total_executions > 0 else 0

    return {
        "workflow_id": workflow_id,
        "workflow_name": db_workflow.name,
        "total_executions": total_executions,
        "success_count": success_count,
        "failure_count": failure_count,
        "success_rate": round(success_rate, 2),
        "created_at": db_workflow.created_at.isoformat(),
        "updated_at": db_workflow.updated_at.isoformat()
    }
