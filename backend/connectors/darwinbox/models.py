"""
Pydantic models for Darwinbox API data structures.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


# ============================================================================
# EMPLOYEE MODELS
# ============================================================================

class EmploymentStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    ON_LEAVE = "On Leave"
    TERMINATED = "Terminated"


class Employee(BaseModel):
    """Employee record."""
    employee_id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    manager_id: Optional[str] = None
    manager_name: Optional[str] = None
    hire_date: Optional[date] = None
    employment_status: EmploymentStatus = EmploymentStatus.ACTIVE
    location: Optional[str] = None
    salary: Optional[float] = None


class EmployeeCreate(BaseModel):
    """Data for creating a new employee."""
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    department: str
    title: str
    manager_id: Optional[str] = None
    hire_date: date
    location: Optional[str] = None


class EmployeeUpdate(BaseModel):
    """Data for updating an employee."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    manager_id: Optional[str] = None
    location: Optional[str] = None
    employment_status: Optional[EmploymentStatus] = None


# ============================================================================
# LEAVE MODELS
# ============================================================================

class LeaveType(str, Enum):
    PTO = "PTO"
    SICK = "Sick"
    CASUAL = "Casual"
    MATERNITY = "Maternity"
    PATERNITY = "Paternity"
    COMP_OFF = "Comp Off"
    UNPAID = "Unpaid"


class LeaveStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    CANCELLED = "Cancelled"


class LeaveBalance(BaseModel):
    """Employee leave balance."""
    employee_id: str
    leave_type: LeaveType
    total_allocated: float
    used: float
    pending: float
    available: float


class LeaveRequest(BaseModel):
    """Leave request details."""
    leave_id: Optional[str] = None
    employee_id: str
    employee_name: Optional[str] = None
    leave_type: LeaveType
    start_date: date
    end_date: date
    days_count: float
    reason: Optional[str] = None
    status: LeaveStatus = LeaveStatus.PENDING
    approver_id: Optional[str] = None
    approver_name: Optional[str] = None
    applied_date: Optional[datetime] = None
    approved_date: Optional[datetime] = None


class LeaveRequestCreate(BaseModel):
    """Data for creating leave request."""
    employee_id: str
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: Optional[str] = None


class LeaveApproval(BaseModel):
    """Leave approval/rejection data."""
    leave_id: str
    approver_id: str
    status: LeaveStatus  # APPROVED or REJECTED
    comments: Optional[str] = None


# ============================================================================
# ATTENDANCE MODELS
# ============================================================================

class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"
    HALF_DAY = "Half Day"
    LEAVE = "Leave"
    HOLIDAY = "Holiday"
    WEEKEND = "Weekend"


class ShiftType(str, Enum):
    DAY = "Day"
    NIGHT = "Night"
    ROTATIONAL = "Rotational"
    FLEXIBLE = "Flexible"


class AttendanceRecord(BaseModel):
    """Daily attendance record."""
    attendance_id: Optional[str] = None
    employee_id: str
    employee_name: Optional[str] = None
    date: date
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    work_hours: Optional[float] = None
    overtime_hours: Optional[float] = None
    status: AttendanceStatus = AttendanceStatus.PRESENT
    shift_type: Optional[ShiftType] = None
    location: Optional[str] = None  # Office, Remote, Field
    regularization_required: bool = False
    regularization_reason: Optional[str] = None


class ClockInRequest(BaseModel):
    """Clock-in request."""
    employee_id: str
    timestamp: Optional[datetime] = None
    location: Optional[str] = "Office"


class ClockOutRequest(BaseModel):
    """Clock-out request."""
    employee_id: str
    timestamp: Optional[datetime] = None


class AttendanceSummary(BaseModel):
    """Monthly attendance summary."""
    employee_id: str
    month: int
    year: int
    total_days: int
    present_days: int
    absent_days: int
    leave_days: int
    half_days: int
    total_hours: float
    overtime_hours: float
    late_arrivals: int
    early_exits: int
