"""
Export workflows from database to JSON format.
"""
import sys
import os
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database.session import SessionLocal
from database.models import WorkflowDB

def export_workflows():
    """Export all workflows to JSON."""
    db = SessionLocal()

    try:
        workflows = db.query(WorkflowDB).order_by(WorkflowDB.created_at.desc()).all()

        workflows_data = []
        for wf in workflows:
            workflows_data.append({
                "id": wf.id,
                "name": wf.name,
                "description": wf.description,
                "category": wf.category,
                "tags": wf.tags,
                "icon": wf.icon,
                "org_id": wf.org_id,
                "team_id": wf.team_id,
                "created_by": wf.created_by,
                "agents": wf.agents,
                "edges": wf.edges,
                "version": wf.version,
                "is_published": wf.is_published,
                "environment": wf.environment,
                "execution_count": wf.execution_count,
                "success_count": wf.success_count,
                "failure_count": wf.failure_count,
                "created_at": wf.created_at.isoformat() if wf.created_at else None,
                "updated_at": wf.updated_at.isoformat() if wf.updated_at else None
            })

        print(json.dumps(workflows_data, indent=2))

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    export_workflows()
