"""
Execution data models.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class ExecutionStatus(str, Enum):
    """Execution status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentExecutionMetrics(BaseModel):
    """Metrics for a single agent execution."""
    agent_id: str
    agent_name: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: ExecutionStatus
    tokens_used: int = 0
    cost: float = 0.0
    latency_ms: int = 0


class ExecutionMetrics(BaseModel):
    """Overall execution metrics."""
    total_tokens: int
    total_cost: float
    total_latency_ms: int
    agents: List[AgentExecutionMetrics]


class AgentExecutionResult(BaseModel):
    """Result from a single agent execution."""
    agent_id: str
    agent_name: str
    started_at: datetime
    completed_at: datetime
    status: ExecutionStatus
    output: Any
    sources: Optional[List[Dict[str, Any]]] = None
    metrics: AgentExecutionMetrics


class ExecutionCreate(BaseModel):
    """Request model for executing workflow."""
    workflow_id: str
    input: str
    params: Optional[Dict[str, Any]] = None


class Execution(BaseModel):
    """Execution model."""
    id: str
    workflow_id: str
    status: ExecutionStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    input: str
    results: Optional[Dict[str, Any]] = None
    metrics: Optional[ExecutionMetrics] = None
    agent_executions: List[AgentExecutionResult] = []


class ExecutionTimeline(BaseModel):
    """Simplified timeline view."""
    execution_id: str
    agents: List[Dict[str, Any]]


class ExecutionLogs(BaseModel):
    """Execution logs."""
    execution_id: str
    logs: List[Dict[str, Any]]
