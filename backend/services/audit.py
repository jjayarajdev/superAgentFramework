"""
Audit logging service for security and compliance.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from database.models import AuditLog
from config import settings


class AuditLogger:
    """
    Service for logging security-relevant events.

    Logs events to database for compliance and security monitoring.
    """

    async def log(
        self,
        db: Session,
        action: str,
        resource_type: str,
        resource_id: str,
        org_id: str,
        user_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None
    ):
        """
        Log an audit event.

        Args:
            db: Database session
            action: Action performed (e.g., "workflow.created", "user.login")
            resource_type: Type of resource (e.g., "workflow", "user")
            resource_id: ID of the resource
            org_id: Organization ID
            user_id: User who performed the action
            details: Additional context
            ip_address: IP address of the request
            user_agent: User agent string
            success: Whether the action succeeded
            error_message: Error message if action failed

        Usage:
            await audit_logger.log(
                db=db,
                action="workflow.created",
                resource_type="workflow",
                resource_id=workflow.id,
                org_id=user.org_id,
                user_id=user.id,
                details={"name": workflow.name}
            )
        """
        if not settings.ENABLE_AUDIT_LOGGING:
            return

        audit_log = AuditLog(
            org_id=org_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            error_message=error_message,
            timestamp=datetime.utcnow()
        )

        db.add(audit_log)
        db.commit()

    async def log_user_login(
        self,
        db: Session,
        user_id: str,
        org_id: str,
        success: bool = True,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        error_message: Optional[str] = None
    ):
        """Log user login attempt."""
        await self.log(
            db=db,
            action="user.login",
            resource_type="user",
            resource_id=user_id,
            org_id=org_id,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            error_message=error_message
        )

    async def log_workflow_created(
        self,
        db: Session,
        workflow_id: str,
        workflow_name: str,
        org_id: str,
        user_id: str
    ):
        """Log workflow creation."""
        await self.log(
            db=db,
            action="workflow.created",
            resource_type="workflow",
            resource_id=workflow_id,
            org_id=org_id,
            user_id=user_id,
            details={"name": workflow_name}
        )

    async def log_workflow_executed(
        self,
        db: Session,
        workflow_id: str,
        execution_id: str,
        org_id: str,
        user_id: Optional[str] = None,
        success: bool = True
    ):
        """Log workflow execution."""
        await self.log(
            db=db,
            action="workflow.executed",
            resource_type="workflow",
            resource_id=workflow_id,
            org_id=org_id,
            user_id=user_id,
            details={"execution_id": execution_id},
            success=success
        )

    async def log_workflow_deleted(
        self,
        db: Session,
        workflow_id: str,
        workflow_name: str,
        org_id: str,
        user_id: str
    ):
        """Log workflow deletion."""
        await self.log(
            db=db,
            action="workflow.deleted",
            resource_type="workflow",
            resource_id=workflow_id,
            org_id=org_id,
            user_id=user_id,
            details={"name": workflow_name}
        )

    async def log_agent_created(
        self,
        db: Session,
        agent_id: str,
        agent_name: str,
        org_id: str,
        user_id: str
    ):
        """Log agent creation."""
        await self.log(
            db=db,
            action="agent.created",
            resource_type="agent",
            resource_id=agent_id,
            org_id=org_id,
            user_id=user_id,
            details={"name": agent_name}
        )

    async def log_permission_changed(
        self,
        db: Session,
        user_id: str,
        org_id: str,
        changed_by: str,
        old_role: str,
        new_role: str
    ):
        """Log permission changes."""
        await self.log(
            db=db,
            action="user.permission_changed",
            resource_type="user",
            resource_id=user_id,
            org_id=org_id,
            user_id=changed_by,
            details={"old_role": old_role, "new_role": new_role}
        )


# Global audit logger instance
audit_logger = AuditLogger()
