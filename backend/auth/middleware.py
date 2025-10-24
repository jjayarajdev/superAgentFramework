"""
Middleware for multi-tenancy and request context.
"""
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional

from auth.jwt import verify_token
from database.session import SessionLocal
from database.models import User
from config import settings


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Middleware to inject tenant context into every request.

    Extracts user information from JWT token and adds org_id and team_id
    to request.state for easy access in route handlers.
    """

    async def dispatch(self, request: Request, call_next):
        """
        Process each request to extract tenant information.

        Args:
            request: FastAPI request object
            call_next: Next middleware/route handler

        Returns:
            Response from next handler
        """
        # Initialize tenant context
        request.state.org_id = None
        request.state.team_id = None
        request.state.user_id = None
        request.state.user_role = None

        # Skip auth for public endpoints
        public_paths = [
            "/",
            "/health",
            "/docs",
            "/openapi.json",
            "/api/v1/auth/login",
            "/api/v1/auth/register",
        ]

        if request.url.path in public_paths or not settings.ENABLE_AUTH:
            return await call_next(request)

        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

            try:
                # Verify token and extract user info
                payload = verify_token(token)
                user_id = payload.get("sub")

                if user_id:
                    # Get user from database
                    db = SessionLocal()
                    try:
                        user = db.query(User).filter(User.id == user_id).first()

                        if user and user.is_active:
                            # Inject tenant context into request
                            request.state.org_id = user.org_id
                            request.state.team_id = user.team_id
                            request.state.user_id = user.id
                            request.state.user_role = user.role
                    finally:
                        db.close()

            except Exception:
                # Token verification failed, but don't block request
                # Let route handler's auth dependency handle it
                pass

        response = await call_next(request)
        return response


def get_tenant_context(request: Request) -> dict:
    """
    Get tenant context from request.

    Args:
        request: FastAPI request object

    Returns:
        Dictionary with org_id, team_id, user_id

    Usage:
        from fastapi import Request

        @app.get("/api/v1/workflows/")
        async def list_workflows(request: Request):
            context = get_tenant_context(request)
            org_id = context["org_id"]
            ...
    """
    return {
        "org_id": getattr(request.state, "org_id", None),
        "team_id": getattr(request.state, "team_id", None),
        "user_id": getattr(request.state, "user_id", None),
        "user_role": getattr(request.state, "user_role", None),
    }


def require_tenant_context(request: Request):
    """
    Dependency that ensures tenant context is present.

    Raises:
        HTTPException: If tenant context is missing

    Usage:
        from fastapi import Depends

        @app.get("/api/v1/workflows/")
        async def list_workflows(
            request: Request,
            _: None = Depends(require_tenant_context)
        ):
            org_id = request.state.org_id
            ...
    """
    if not getattr(request.state, "org_id", None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tenant context required. Please authenticate."
        )
