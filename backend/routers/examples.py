"""
Example workflows API router.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import uuid
from datetime import datetime

from data.example_workflows import get_example_workflows, get_example_workflow
from models.workflow import Workflow
from database.session import get_db
from database.models import WorkflowDB, User
from auth.jwt import get_current_user
from auth.rbac import Permission, has_permission
from services.audit import audit_logger

router = APIRouter()


@router.get("/")
async def list_examples() -> Dict[str, List[Dict[str, Any]]]:
    """List all example workflow templates."""
    examples = get_example_workflows()
    return {"examples": examples}


@router.get("/{example_id}")
async def get_example(example_id: str) -> Dict[str, Any]:
    """Get specific example workflow."""
    example = get_example_workflow(example_id)

    if not example:
        raise HTTPException(status_code=404, detail="Example not found")

    return example


@router.post("/{example_id}/instantiate")
async def instantiate_example(
    example_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Instantiate an example as a real workflow.

    Creates a new workflow from the example template.
    Requires: workflows.create permission
    """
    # Check permission
    if not has_permission(current_user, Permission.WORKFLOW_CREATE):
        raise HTTPException(status_code=403, detail="Insufficient permissions to create workflows")

    example = get_example_workflow(example_id)

    if not example:
        raise HTTPException(status_code=404, detail="Example not found")

    # Create new workflow ID
    workflow_id = f"wf_{str(uuid.uuid4())[:8]}"

    # Create workflow in database
    db_workflow = WorkflowDB(
        id=workflow_id,
        org_id=current_user.org_id,
        team_id=current_user.team_id,
        created_by=current_user.id,
        name=f"{example['name']} (Copy)",
        description=example['description'],
        agents=example['agents'],
        edges=example['edges']
    )

    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)

    # Audit log
    await audit_logger.log_workflow_created(
        db=db,
        workflow_id=workflow_id,
        workflow_name=db_workflow.name,
        org_id=current_user.org_id,
        user_id=current_user.id
    )

    # Convert to Workflow model
    workflow = Workflow(
        id=db_workflow.id,
        name=db_workflow.name,
        description=db_workflow.description,
        created_at=db_workflow.created_at,
        updated_at=db_workflow.updated_at,
        agents=db_workflow.agents,
        edges=db_workflow.edges
    )

    return {
        "workflow_id": workflow_id,
        "workflow": workflow,
        "sample_input": example.get('sample_input'),
        "message": f"Created workflow from example: {example['name']}"
    }


@router.post("/run-all")
async def run_all_examples(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Run all example workflows.

    Instantiates and executes each example, returns results for all.
    Perfect for demos!
    Requires: workflows.execute permission
    """
    # Check permission
    if not has_permission(current_user, Permission.WORKFLOW_EXECUTE):
        raise HTTPException(status_code=403, detail="Insufficient permissions to execute workflows")

    from orchestrator import OrchestrationEngine
    from database.models import ExecutionDB, WorkflowStatus

    examples = get_example_workflows()
    orchestrator = OrchestrationEngine()
    results = []

    for example in examples:
        try:
            # Create workflow in database
            workflow_id = f"wf_{str(uuid.uuid4())[:8]}"
            db_workflow = WorkflowDB(
                id=workflow_id,
                org_id=current_user.org_id,
                team_id=current_user.team_id,
                created_by=current_user.id,
                name=example['name'],
                description=example['description'],
                agents=example['agents'],
                edges=example['edges']
            )
            db.add(db_workflow)
            db.commit()

            # Create workflow model
            workflow = Workflow(
                id=workflow_id,
                name=example['name'],
                description=example['description'],
                created_at=datetime.now(),
                updated_at=datetime.now(),
                agents=example['agents'],
                edges=example['edges']
            )

            # Execute workflow
            execution_id = f"exec_{str(uuid.uuid4())[:8]}"

            # Create execution record
            db_execution = ExecutionDB(
                id=execution_id,
                workflow_id=workflow_id,
                org_id=current_user.org_id,
                status=WorkflowStatus.RUNNING,
                input_data=example.get('sample_input', ''),
                started_at=datetime.utcnow()
            )
            db.add(db_execution)
            db.commit()

            # Execute
            execution = await orchestrator.execute_workflow(
                workflow=workflow,
                input_data=example.get('sample_input', ''),
                execution_id=execution_id
            )

            # Update execution with results
            db_execution.status = WorkflowStatus.COMPLETED
            db_execution.completed_at = datetime.utcnow()
            db_execution.output = execution.output if hasattr(execution, 'output') else {}
            db_execution.tokens_used = execution.metrics.total_tokens if execution.metrics else 0

            # Update workflow stats
            db_workflow.execution_count += 1
            db_workflow.success_count += 1
            db.commit()

            results.append({
                "example_id": example['id'],
                "example_name": example['name'],
                "category": example['category'],
                "icon": example['icon'],
                "workflow_id": workflow_id,
                "execution_id": execution_id,
                "status": execution.status.value if hasattr(execution.status, 'value') else execution.status,
                "input": example.get('sample_input'),
                "metrics": {
                    "total_tokens": execution.metrics.total_tokens if execution.metrics else 0,
                    "total_cost": execution.metrics.total_cost if execution.metrics else 0,
                    "total_latency_ms": execution.metrics.total_latency_ms if execution.metrics else 0
                } if execution.metrics else None,
                "agent_count": len(example['agents']),
                "agents_executed": len(execution.agent_executions) if execution.agent_executions else 0,
                "success": execution.status.value == "completed" if hasattr(execution.status, 'value') else execution.status == "completed"
            })

        except Exception as e:
            # Mark execution as failed
            if 'db_execution' in locals():
                db_execution.status = WorkflowStatus.FAILED
                db_execution.error = str(e)
                db_execution.completed_at = datetime.utcnow()
            if 'db_workflow' in locals():
                db_workflow.failure_count += 1
            db.commit()

            results.append({
                "example_id": example['id'],
                "example_name": example['name'],
                "category": example['category'],
                "icon": example['icon'],
                "status": "failed",
                "error": str(e),
                "success": False
            })

    # Summary stats
    successful = sum(1 for r in results if r.get('success', False))
    total_tokens = sum(r.get('metrics', {}).get('total_tokens', 0) if r.get('metrics') else 0 for r in results)
    total_cost = sum(r.get('metrics', {}).get('total_cost', 0) if r.get('metrics') else 0 for r in results)

    return {
        "summary": {
            "total_examples": len(examples),
            "successful": successful,
            "failed": len(examples) - successful,
            "total_tokens": total_tokens,
            "total_cost": total_cost
        },
        "results": results
    }
