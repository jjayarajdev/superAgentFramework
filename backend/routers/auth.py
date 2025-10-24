"""
Authentication router - Login, register, profile management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from typing import Optional

from database.session import get_db
from database.models import User, Organization, Team, UserRole
from auth.jwt import create_access_token, get_current_user
from auth.password import hash_password, verify_password
from auth.rbac import get_user_permissions
from config import settings

router = APIRouter()


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class RegisterRequest(BaseModel):
    """User registration request."""
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None
    organization_name: Optional[str] = None  # For new orgs


class LoginResponse(BaseModel):
    """Login response with token and user info."""
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserProfileResponse(BaseModel):
    """User profile response."""
    id: str
    email: str
    username: str
    full_name: Optional[str]
    role: str
    org_id: str
    team_id: Optional[str]
    permissions: list
    is_active: bool
    created_at: str


# ============================================================================
# AUTH ENDPOINTS
# ============================================================================

@router.post("/register", response_model=LoginResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user.

    If organization_name is provided, creates a new organization.
    Otherwise, user must be invited to existing organization (future feature).
    """
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == request.email) | (User.username == request.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )

    # Create or get organization
    if request.organization_name:
        # Create new organization
        org_slug = request.organization_name.lower().replace(" ", "-")

        # Check if org slug exists
        existing_org = db.query(Organization).filter(Organization.slug == org_slug).first()
        if existing_org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization with this name already exists"
            )

        organization = Organization(
            name=request.organization_name,
            slug=org_slug,
            billing_plan="free"
        )
        db.add(organization)
        db.flush()

        # Create default team
        team = Team(
            org_id=organization.id,
            name="Default Team",
            description="Default team for organization"
        )
        db.add(team)
        db.flush()

        # First user in org is admin
        user_role = UserRole.ADMIN
        user_team_id = team.id
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="organization_name required for new users"
        )

    # Create user
    user = User(
        email=request.email,
        username=request.username,
        full_name=request.full_name,
        hashed_password=hash_password(request.password),
        org_id=organization.id,
        team_id=user_team_id,
        role=user_role,
        is_active=True,
        is_verified=True  # Auto-verify for demo (should be email verification in prod)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Create access token
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role.value,
            "org_id": user.org_id,
            "permissions": get_user_permissions(user)
        }
    }


@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with username/email and password.

    Returns JWT access token.
    """
    # Find user by username or email
    user = db.query(User).filter(
        (User.username == form_data.username) | (User.email == form_data.username)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role.value,
            "org_id": user.org_id,
            "team_id": user.team_id,
            "permissions": get_user_permissions(user)
        }
    }


@router.get("/me", response_model=UserProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user's profile.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "org_id": current_user.org_id,
        "team_id": current_user.team_id,
        "permissions": get_user_permissions(current_user),
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat()
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout current user.

    Note: With JWT, logout is handled client-side by removing the token.
    This endpoint is mainly for audit logging.
    """
    # In a production system, you might want to:
    # 1. Add token to blacklist
    # 2. Log the logout event
    # 3. Clear any server-side sessions

    return {"message": "Successfully logged out"}
