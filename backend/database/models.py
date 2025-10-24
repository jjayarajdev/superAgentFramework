"""
Database models for Super Agent Framework.
Implements multi-tenancy, authentication, and persistent storage.
"""
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
import uuid

from database.base import Base


# ============================================================================
# ENUMS
# ============================================================================

class UserRole(str, Enum):
    """User roles for RBAC."""
    ADMIN = "admin"
    DEVELOPER = "developer"
    OPERATOR = "operator"
    VIEWER = "viewer"


class BillingPlan(str, Enum):
    """Organization billing plans."""
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class WorkflowStatus(str, Enum):
    """Workflow execution status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


# ============================================================================
# ORGANIZATION & MULTI-TENANCY
# ============================================================================

class Organization(Base):
    """
    Organization model for multi-tenancy.
    Every user, workflow, and execution belongs to an organization.
    """
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=lambda: f"org_{uuid.uuid4().hex[:16]}")
    name = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)

    # Billing
    billing_plan = Column(SQLEnum(BillingPlan), default=BillingPlan.FREE)
    billing_email = Column(String)

    # Usage limits
    max_workflows = Column(Integer, default=5)
    max_agents = Column(Integer, default=10)
    max_executions_per_month = Column(Integer, default=100)
    max_teams = Column(Integer, default=1)

    # Settings
    settings = Column(JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="organization")
    teams = relationship("Team", back_populates="organization")
    workflows = relationship("WorkflowDB", back_populates="organization")
    executions = relationship("ExecutionDB", back_populates="organization")


class Team(Base):
    """
    Team model for organizing users and workflows within an organization.
    """
    __tablename__ = "teams"

    id = Column(String, primary_key=True, default=lambda: f"team_{uuid.uuid4().hex[:16]}")
    org_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)

    # Settings
    settings = Column(JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="teams")
    users = relationship("User", back_populates="team")
    workflows = relationship("WorkflowDB", back_populates="team")


# ============================================================================
# USER & AUTHENTICATION
# ============================================================================

class User(Base):
    """
    User model for authentication and authorization.
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: f"user_{uuid.uuid4().hex[:16]}")
    org_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    team_id = Column(String, ForeignKey("teams.id", ondelete="SET NULL"), index=True)

    # Identity
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String)

    # Authentication
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Authorization
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, nullable=False)
    permissions = Column(JSON, default=list)  # Additional permissions beyond role

    # Profile
    avatar_url = Column(String)
    settings = Column(JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    team = relationship("Team", back_populates="users")
    workflows_created = relationship("WorkflowDB", back_populates="created_by_user", foreign_keys="WorkflowDB.created_by")
    audit_logs = relationship("AuditLog", back_populates="user")


# ============================================================================
# WORKFLOWS & EXECUTIONS
# ============================================================================

class WorkflowDB(Base):
    """
    Persistent workflow model.
    Replaces in-memory _workflows dict.
    """
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, default=lambda: f"wf_{uuid.uuid4().hex[:8]}")
    org_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    team_id = Column(String, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), index=True)

    # Workflow definition
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    agents = Column(JSON, nullable=False)  # List of agent configurations
    edges = Column(JSON, default=list)  # List of edges between agents

    # Metadata
    tags = Column(JSON, default=list)
    category = Column(String, index=True)
    icon = Column(String)

    # Version control
    version = Column(Integer, default=1)
    is_published = Column(Boolean, default=False)

    # Environment
    environment = Column(String, default="development", index=True)  # dev, staging, prod

    # Statistics
    execution_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="workflows")
    team = relationship("Team", back_populates="workflows")
    created_by_user = relationship("User", back_populates="workflows_created", foreign_keys=[created_by])
    executions = relationship("ExecutionDB", back_populates="workflow")


class ExecutionDB(Base):
    """
    Persistent execution model.
    Replaces in-memory _executions dict.
    """
    __tablename__ = "executions"

    id = Column(String, primary_key=True, default=lambda: f"exec_{uuid.uuid4().hex[:8]}")
    workflow_id = Column(String, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    org_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)

    # Execution details
    status = Column(SQLEnum(WorkflowStatus), default=WorkflowStatus.PENDING, nullable=False, index=True)
    input_data = Column(Text)
    output = Column(JSON)
    error = Column(Text)

    # Results
    agent_results = Column(JSON, default=dict)  # Results from each agent
    execution_graph = Column(JSON, default=dict)  # Execution flow

    # Metrics
    tokens_used = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    duration_seconds = Column(Float)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)

    # Relationships
    workflow = relationship("WorkflowDB", back_populates="executions")
    organization = relationship("Organization", back_populates="executions")


# ============================================================================
# AUDIT LOGGING
# ============================================================================

class AuditLog(Base):
    """
    Audit log for security and compliance.
    Tracks all important actions in the system.
    """
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: f"audit_{uuid.uuid4().hex[:16]}")
    org_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), index=True)

    # Event details
    action = Column(String, nullable=False, index=True)  # e.g., "workflow.created", "user.login"
    resource_type = Column(String, index=True)  # e.g., "workflow", "user", "execution"
    resource_id = Column(String, index=True)

    # Context
    details = Column(JSON, default=dict)
    ip_address = Column(String)
    user_agent = Column(String)

    # Result
    success = Column(Boolean, default=True)
    error_message = Column(Text)

    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


# ============================================================================
# WORKFLOW VERSIONS (for version control)
# ============================================================================

class WorkflowVersion(Base):
    """
    Version history for workflows.
    Enables rollback and change tracking.
    """
    __tablename__ = "workflow_versions"

    id = Column(String, primary_key=True, default=lambda: f"wfv_{uuid.uuid4().hex[:16]}")
    workflow_id = Column(String, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)

    # Version info
    version = Column(Integer, nullable=False)
    parent_version = Column(Integer)

    # Snapshot
    snapshot = Column(JSON, nullable=False)  # Complete workflow definition at this version

    # Metadata
    author = Column(String, ForeignKey("users.id", ondelete="SET NULL"))
    message = Column(Text)  # Commit message
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# ============================================================================
# SCHEDULED EXECUTIONS
# ============================================================================

class ScheduledExecution(Base):
    """
    Scheduled workflow executions.
    """
    __tablename__ = "scheduled_executions"

    id = Column(String, primary_key=True, default=lambda: f"sched_{uuid.uuid4().hex[:16]}")
    workflow_id = Column(String, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    org_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)

    # Schedule
    cron_expression = Column(String, nullable=False)
    timezone = Column(String, default="UTC")
    input_data = Column(Text)

    # State
    is_active = Column(Boolean, default=True)
    next_run = Column(DateTime, index=True)
    last_run = Column(DateTime)

    # Metadata
    created_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
