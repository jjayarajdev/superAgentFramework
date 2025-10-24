"""
Role-Based Access Control (RBAC) system.
"""
from enum import Enum
from typing import List, Callable
from fastapi import HTTPException, status, Depends
from functools import wraps

from database.models import User, UserRole
from auth.jwt import get_current_user


class Permission(str, Enum):
    """
    System permissions.
    Permissions are checked in addition to roles.
    """
    # Workflow permissions
    WORKFLOW_CREATE = "workflows.create"
    WORKFLOW_READ = "workflows.read"
    WORKFLOW_UPDATE = "workflows.update"
    WORKFLOW_DELETE = "workflows.delete"
    WORKFLOW_EXECUTE = "workflows.execute"
    WORKFLOW_PUBLISH = "workflows.publish"

    # Agent permissions
    AGENT_CREATE = "agents.create"
    AGENT_READ = "agents.read"
    AGENT_UPDATE = "agents.update"
    AGENT_DELETE = "agents.delete"
    AGENT_PUBLISH = "agents.publish"

    # Execution permissions
    EXECUTION_VIEW = "executions.view"
    EXECUTION_CANCEL = "executions.cancel"

    # User management permissions
    USER_CREATE = "users.create"
    USER_READ = "users.read"
    USER_UPDATE = "users.update"
    USER_DELETE = "users.delete"

    # Organization permissions
    ORG_SETTINGS = "org.settings"
    ORG_BILLING = "org.billing"

    # Team permissions
    TEAM_CREATE = "teams.create"
    TEAM_MANAGE = "teams.manage"

    # System permissions
    SYSTEM_ADMIN = "system.admin"


# Role to permissions mapping
ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        # Admins have all permissions
        Permission.WORKFLOW_CREATE,
        Permission.WORKFLOW_READ,
        Permission.WORKFLOW_UPDATE,
        Permission.WORKFLOW_DELETE,
        Permission.WORKFLOW_EXECUTE,
        Permission.WORKFLOW_PUBLISH,
        Permission.AGENT_CREATE,
        Permission.AGENT_READ,
        Permission.AGENT_UPDATE,
        Permission.AGENT_DELETE,
        Permission.AGENT_PUBLISH,
        Permission.EXECUTION_VIEW,
        Permission.EXECUTION_CANCEL,
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.ORG_SETTINGS,
        Permission.ORG_BILLING,
        Permission.TEAM_CREATE,
        Permission.TEAM_MANAGE,
        Permission.SYSTEM_ADMIN,
    ],
    UserRole.DEVELOPER: [
        # Developers can create and manage workflows/agents
        Permission.WORKFLOW_CREATE,
        Permission.WORKFLOW_READ,
        Permission.WORKFLOW_UPDATE,
        Permission.WORKFLOW_DELETE,
        Permission.WORKFLOW_EXECUTE,
        Permission.AGENT_CREATE,
        Permission.AGENT_READ,
        Permission.AGENT_UPDATE,
        Permission.EXECUTION_VIEW,
        Permission.EXECUTION_CANCEL,
    ],
    UserRole.OPERATOR: [
        # Operators can execute workflows and view results
        Permission.WORKFLOW_READ,
        Permission.WORKFLOW_EXECUTE,
        Permission.AGENT_READ,
        Permission.EXECUTION_VIEW,
        Permission.EXECUTION_CANCEL,
    ],
    UserRole.VIEWER: [
        # Viewers have read-only access
        Permission.WORKFLOW_READ,
        Permission.AGENT_READ,
        Permission.EXECUTION_VIEW,
    ],
}


def has_permission(user: User, permission: Permission) -> bool:
    """
    Check if user has a specific permission.

    Args:
        user: User object
        permission: Permission to check

    Returns:
        True if user has permission, False otherwise
    """
    # Check role-based permissions
    role_perms = ROLE_PERMISSIONS.get(user.role, [])
    if permission in role_perms:
        return True

    # Check additional user-specific permissions
    user_perms = user.permissions or []
    if permission.value in user_perms:
        return True

    return False


def require_permission(permission: Permission):
    """
    Decorator to require a specific permission for a route.

    Args:
        permission: Required permission

    Usage:
        @app.post("/api/v1/workflows/")
        @require_permission(Permission.WORKFLOW_CREATE)
        async def create_workflow(current_user: User = Depends(get_current_user)):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_user), **kwargs):
            if not has_permission(current_user, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required: {permission.value}"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator


def require_role(role: UserRole):
    """
    Decorator to require a specific role for a route.

    Args:
        role: Required role

    Usage:
        @app.get("/api/v1/admin/stats")
        @require_role(UserRole.ADMIN)
        async def get_admin_stats(current_user: User = Depends(get_current_user)):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_user), **kwargs):
            if current_user.role != role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required role: {role.value}"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator


def get_user_permissions(user: User) -> List[str]:
    """
    Get all permissions for a user.

    Args:
        user: User object

    Returns:
        List of permission strings
    """
    # Get role-based permissions
    role_perms = ROLE_PERMISSIONS.get(user.role, [])
    permissions = [p.value for p in role_perms]

    # Add user-specific permissions
    if user.permissions:
        permissions.extend(user.permissions)

    return list(set(permissions))  # Remove duplicates
