"""
Executions API router - DATABASE EDITION.
Uses SQLite/PostgreSQL for persistent storage with multi-tenancy.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import List
import uuid
import json
from datetime import datetime

from models.execution import (
    Execution, ExecutionCreate, ExecutionStatus,
    ExecutionTimeline, ExecutionLogs
)
from models.workflow import Workflow
from database.session import get_db
from database.models import ExecutionDB, WorkflowDB, User, WorkflowStatus
from auth.jwt import get_current_user
from auth.rbac import Permission, has_permission
from auth.middleware import get_tenant_context
from services.audit import audit_logger
from orchestrator import OrchestrationEngine

router = APIRouter()

# Orchestration engine instance
_orchestrator = OrchestrationEngine()


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def execution_db_to_model(db_execution: ExecutionDB) -> Execution:
    """Convert database ExecutionDB to API Execution model."""
    # Handle status - it might be an enum or a string
    if hasattr(db_execution.status, 'value'):
        status = ExecutionStatus(db_execution.status.value)
    else:
        status = ExecutionStatus(db_execution.status)

    # Calculate latency in milliseconds
    total_latency_ms = 0
    if db_execution.duration_seconds:
        total_latency_ms = int(db_execution.duration_seconds * 1000)

    # Keep input_data as string (don't parse JSON)
    input_data = db_execution.input_data or ""

    return Execution(
        id=db_execution.id,
        workflow_id=db_execution.workflow_id,
        status=status,
        input=input_data,
        output=db_execution.output if db_execution.output else {},
        error=db_execution.error,
        created_at=db_execution.created_at,
        started_at=db_execution.started_at,
        completed_at=db_execution.completed_at,
        agent_executions=[],  # TODO: Add agent execution tracking
        metrics={
            "total_tokens": db_execution.tokens_used or 0,
            "total_cost": db_execution.cost or 0.0,
            "duration_seconds": db_execution.duration_seconds or 0.0,
            "total_latency_ms": total_latency_ms,
            "agents": []  # TODO: Add per-agent metrics
        }
    )


# ============================================================================
# EXECUTION ENDPOINTS
# ============================================================================

@router.post("/", response_model=Execution)
async def create_execution(
    execution: ExecutionCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Execute a workflow.

    Requires: workflows.execute permission (Developer, Operator, or Admin)

    Multi-tenancy: Can only execute workflows in user's org/team.
    """
    # Check permission
    if not has_permission(current_user, Permission.WORKFLOW_EXECUTE):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required: workflows.execute"
        )

    # Get workflow with tenant filtering
    db_workflow = db.query(WorkflowDB).filter(
        WorkflowDB.id == execution.workflow_id,
        WorkflowDB.org_id == current_user.org_id,
        WorkflowDB.team_id == current_user.team_id
    ).first()

    if not db_workflow:
        raise HTTPException(
            status_code=404,
            detail="Workflow not found or access denied"
        )

    # Create execution record
    execution_id = f"exec_{str(uuid.uuid4())[:8]}"
    started_at = datetime.utcnow()

    # Convert input_data to JSON string if it's a dict
    input_data_str = execution.input
    if isinstance(execution.input, dict):
        input_data_str = json.dumps(execution.input)
    elif not isinstance(execution.input, str):
        input_data_str = str(execution.input)

    db_execution = ExecutionDB(
        id=execution_id,
        workflow_id=execution.workflow_id,
        org_id=current_user.org_id,
        status=WorkflowStatus.RUNNING,
        input_data=input_data_str,
        created_at=started_at,
        started_at=started_at
    )

    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)

    # Convert database workflow to model for orchestrator
    workflow_model = Workflow(
        id=db_workflow.id,
        name=db_workflow.name,
        description=db_workflow.description,
        agents=db_workflow.agents,
        edges=db_workflow.edges,
        created_at=db_workflow.created_at,
        updated_at=db_workflow.updated_at
    )

    try:
        # Execute workflow using orchestrator
        result = await _orchestrator.execute_workflow(
            workflow=workflow_model,
            input_data=execution.input,
            execution_id=execution_id
        )

        # Update execution with results
        db_execution.status = WorkflowStatus.COMPLETED
        db_execution.output = result.output if hasattr(result, 'output') else {}
        db_execution.agent_results = result.metrics.agent_results if hasattr(result, 'metrics') and hasattr(result.metrics, 'agent_results') else {}
        db_execution.tokens_used = result.metrics.total_tokens if hasattr(result, 'metrics') and hasattr(result.metrics, 'total_tokens') else 0
        db_execution.cost = result.metrics.total_cost if hasattr(result, 'metrics') and hasattr(result.metrics, 'total_cost') else 0.0
        db_execution.completed_at = datetime.utcnow()
        db_execution.duration_seconds = (db_execution.completed_at - db_execution.started_at).total_seconds()

        # Update workflow stats
        db_workflow.execution_count += 1
        db_workflow.success_count += 1

        db.commit()
        db.refresh(db_execution)

        # Audit log
        await audit_logger.log_workflow_executed(
            db=db,
            workflow_id=execution.workflow_id,
            execution_id=execution_id,
            org_id=current_user.org_id,
            user_id=current_user.id,
            success=True
        )

        return execution_db_to_model(db_execution)

    except Exception as e:
        # Update execution with error
        db_execution.status = WorkflowStatus.FAILED
        db_execution.error = str(e)
        db_execution.completed_at = datetime.utcnow()
        db_execution.duration_seconds = (db_execution.completed_at - db_execution.started_at).total_seconds()

        # Update workflow stats
        db_workflow.execution_count += 1
        db_workflow.failure_count += 1

        db.commit()
        db.refresh(db_execution)

        # Audit log
        await audit_logger.log_workflow_executed(
            db=db,
            workflow_id=execution.workflow_id,
            execution_id=execution_id,
            org_id=current_user.org_id,
            user_id=current_user.id,
            success=False
        )

        raise HTTPException(
            status_code=500,
            detail=f"Workflow execution failed: {str(e)}"
        )


@router.get("/", response_model=List[Execution])
async def list_executions(
    request: Request,
    workflow_id: str = None,
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List executions for current user's organization.

    Requires: executions.view permission

    Multi-tenancy: Only returns executions from user's org.
    """
    # Check permission
    if not has_permission(current_user, Permission.EXECUTION_VIEW):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required: executions.view"
        )

    # Query with tenant filtering
    query = db.query(ExecutionDB).filter(
        ExecutionDB.org_id == current_user.org_id
    )

    # Filter by workflow_id if provided
    if workflow_id:
        query = query.filter(ExecutionDB.workflow_id == workflow_id)

    # Filter by status if provided
    if status:
        query = query.filter(ExecutionDB.status == status)

    # Apply pagination
    executions = query.order_by(ExecutionDB.created_at.desc()).offset(offset).limit(limit).all()

    return [execution_db_to_model(ex) for ex in executions]


@router.get("/{execution_id}", response_model=Execution)
async def get_execution(
    execution_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get execution by ID.

    Requires: executions.view permission

    Multi-tenancy: Can only access executions in user's org.
    """
    # Check permission
    if not has_permission(current_user, Permission.EXECUTION_VIEW):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required: executions.view"
        )

    # Query with tenant filtering
    db_execution = db.query(ExecutionDB).filter(
        ExecutionDB.id == execution_id,
        ExecutionDB.org_id == current_user.org_id
    ).first()

    if not db_execution:
        raise HTTPException(
            status_code=404,
            detail="Execution not found or access denied"
        )

    return execution_db_to_model(db_execution)


@router.get("/{execution_id}/metrics")
async def get_execution_metrics(
    execution_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get execution metrics.

    Requires: executions.view permission
    """
    # Check permission
    if not has_permission(current_user, Permission.EXECUTION_VIEW):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required: executions.view"
        )

    # Query with tenant filtering
    db_execution = db.query(ExecutionDB).filter(
        ExecutionDB.id == execution_id,
        ExecutionDB.org_id == current_user.org_id
    ).first()

    if not db_execution:
        raise HTTPException(
            status_code=404,
            detail="Execution not found or access denied"
        )

    return {
        "execution_id": execution_id,
        "workflow_id": db_execution.workflow_id,
        "status": db_execution.status.value,
        "total_tokens": db_execution.tokens_used,
        "total_cost": db_execution.cost,
        "duration_seconds": db_execution.duration_seconds,
        "created_at": db_execution.created_at.isoformat() if db_execution.created_at else None,
        "started_at": db_execution.started_at.isoformat() if db_execution.started_at else None,
        "completed_at": db_execution.completed_at.isoformat() if db_execution.completed_at else None
    }


@router.get("/{execution_id}/logs", response_model=ExecutionLogs)
async def get_execution_logs(
    execution_id: str,
    request: Request,
    level: str = None,
    agent_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get execution logs.

    Requires: executions.view permission
    """
    # Check permission
    if not has_permission(current_user, Permission.EXECUTION_VIEW):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions. Required: executions.view"
        )

    # Verify execution exists and user has access
    db_execution = db.query(ExecutionDB).filter(
        ExecutionDB.id == execution_id,
        ExecutionDB.org_id == current_user.org_id
    ).first()

    if not db_execution:
        raise HTTPException(
            status_code=404,
            detail="Execution not found or access denied"
        )

    # Get logs from orchestrator
    logs = _orchestrator.get_logs(execution_id)

    # Filter by level if specified
    if level:
        logs = [log for log in logs if log["level"] == level]

    # Filter by agent_id if specified
    if agent_id:
        logs = [log for log in logs if log["component"] == agent_id]

    return ExecutionLogs(execution_id=execution_id, logs=logs)


@router.delete("/{execution_id}")
async def delete_execution(
    execution_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete execution record.

    Requires: executions.cancel permission (Admin only)

    Note: This deletes the execution record, not cancel a running execution.
    """
    # Only admins can delete executions
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can delete execution records"
        )

    # Query with tenant filtering
    db_execution = db.query(ExecutionDB).filter(
        ExecutionDB.id == execution_id,
        ExecutionDB.org_id == current_user.org_id
    ).first()

    if not db_execution:
        raise HTTPException(
            status_code=404,
            detail="Execution not found or access denied"
        )

    # Delete execution
    db.delete(db_execution)
    db.commit()

    # Audit log
    await audit_logger.log(
        db=db,
        action="execution.deleted",
        resource_type="execution",
        resource_id=execution_id,
        org_id=current_user.org_id,
        user_id=current_user.id,
        details={"workflow_id": db_execution.workflow_id}
    )

    return {"deleted": True, "execution_id": execution_id}
