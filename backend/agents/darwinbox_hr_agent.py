"""
Darwinbox HR Agent - Enterprise-Grade HR Operations.

Handles Employee Core, Leave Management, and Attendance operations.
"""
from typing import Dict, Any, Optional
from pydantic import Field
from datetime import date, datetime

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)
from connectors.darwinbox.client import DarwinboxClient
from connectors.darwinbox.modules import EmployeeModule, LeaveModule, AttendanceModule
from connectors.darwinbox.models import (
    EmployeeCreate, EmployeeUpdate, LeaveRequestCreate,
    LeaveApproval, LeaveStatus, ClockInRequest, ClockOutRequest
)


class DarwinboxHRConfig(AgentConfigSchema):
    """Configuration schema for Darwinbox HR Agent."""

    action: str = Field(
        default="employee_search",
        description="HR action to perform",
        json_schema_extra={
            "enum": [
                # Employee actions
                "employee_get",
                "employee_search",
                "employee_create",
                "employee_update",
                "employee_deactivate",
                # Leave actions
                "leave_get_balance",
                "leave_request",
                "leave_approve",
                "leave_reject",
                "leave_cancel",
                # Attendance actions
                "attendance_clock_in",
                "attendance_clock_out",
                "attendance_get",
                "attendance_regularize",
                "attendance_summary"
            ]
        }
    )

    # Connection parameters
    admin_email: Optional[str] = Field(
        default="admin@company.com",
        description="Darwinbox admin email"
    )
    secret_key: Optional[str] = Field(
        default="mock_secret_key",
        description="Darwinbox secret key"
    )
    base_url: Optional[str] = Field(
        default="https://api.darwinbox.in",
        description="Darwinbox API base URL"
    )
    use_mock: bool = Field(
        default=True,
        description="Use mock data for testing"
    )

    # Action parameters
    params: Dict[str, Any] = Field(
        default_factory=dict,
        description="Action-specific parameters"
    )


@register_agent
class DarwinboxHRAgent(BaseAgent):
    """
    Darwinbox HR Agent.

    Comprehensive HR operations covering:
    - Employee management (CRUD operations)
    - Leave management (request, approve, balance tracking)
    - Attendance tracking (clock in/out, regularization)

    Supports 15 core HR actions for enterprise workflows.
    """

    agent_type = "darwinbox_hr"
    name = "Darwinbox HR Agent"
    description = "Core HR operations: employees, leave, attendance management"
    icon = "users"
    category = AgentCategory.DATA_RETRIEVAL
    supported_connectors = ["darwinbox"]
    config_schema = DarwinboxHRConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute Darwinbox HR operation."""
        action = self.config.action
        params = self.config.params

        self.log(f"Executing Darwinbox HR action: {action}")

        try:
            # Initialize Darwinbox client and modules
            client = DarwinboxClient(
                admin_email=self.config.admin_email,
                secret_key=self.config.secret_key,
                base_url=self.config.base_url
            )

            employee_module = EmployeeModule(client, use_mock=self.config.use_mock)
            leave_module = LeaveModule(client, use_mock=self.config.use_mock)
            attendance_module = AttendanceModule(client, use_mock=self.config.use_mock)

            # Route to appropriate handler
            if action.startswith('employee_'):
                result = await self._handle_employee_action(employee_module, action, params)
            elif action.startswith('leave_'):
                result = await self._handle_leave_action(leave_module, action, params)
            elif action.startswith('attendance_'):
                result = await self._handle_attendance_action(attendance_module, action, params)
            else:
                raise ValueError(f"Unknown action: {action}")

            self.log(f"Action {action} completed successfully")

            return AgentExecutionResult(
                success=True,
                output=result,
                tokens_used=0,  # No LLM tokens for API calls
                cost=0.0
            )

        except Exception as e:
            self.log(f"Action {action} failed: {str(e)}", level="ERROR")
            return AgentExecutionResult(
                success=False,
                output={"error": str(e)},
                error=str(e),
                tokens_used=0,
                cost=0.0
            )

    # ========================================================================
    # EMPLOYEE ACTIONS
    # ========================================================================

    async def _handle_employee_action(
        self,
        module: EmployeeModule,
        action: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle employee-related actions."""

        if action == "employee_get":
            employee_id = params.get("employee_id")
            if not employee_id:
                raise ValueError("employee_id is required")

            employee = await module.get_employee(employee_id)
            if not employee:
                return {"error": f"Employee {employee_id} not found"}

            return {
                "action": "employee_get",
                "employee": employee.model_dump()
            }

        elif action == "employee_search":
            filters = params.get("filters", {})
            employees = await module.search_employees(filters)

            return {
                "action": "employee_search",
                "count": len(employees),
                "employees": [emp.model_dump() for emp in employees]
            }

        elif action == "employee_create":
            emp_data = EmployeeCreate(**params)
            employee = await module.create_employee(emp_data)

            return {
                "action": "employee_create",
                "employee_id": employee.employee_id,
                "employee": employee.model_dump()
            }

        elif action == "employee_update":
            employee_id = params.get("employee_id")
            if not employee_id:
                raise ValueError("employee_id is required")

            # Remove employee_id from params before creating EmployeeUpdate
            update_params = {k: v for k, v in params.items() if k != "employee_id"}
            update_data = EmployeeUpdate(**update_params)

            employee = await module.update_employee(employee_id, update_data)

            return {
                "action": "employee_update",
                "employee_id": employee_id,
                "employee": employee.model_dump()
            }

        elif action == "employee_deactivate":
            employee_id = params.get("employee_id")
            if not employee_id:
                raise ValueError("employee_id is required")

            result = await module.deactivate_employee(employee_id)

            return {
                "action": "employee_deactivate",
                **result
            }

        else:
            raise ValueError(f"Unknown employee action: {action}")

    # ========================================================================
    # LEAVE ACTIONS
    # ========================================================================

    async def _handle_leave_action(
        self,
        module: LeaveModule,
        action: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle leave-related actions."""

        if action == "leave_get_balance":
            employee_id = params.get("employee_id")
            if not employee_id:
                raise ValueError("employee_id is required")

            balances = await module.get_leave_balance(employee_id)

            return {
                "action": "leave_get_balance",
                "employee_id": employee_id,
                "balances": [bal.model_dump() for bal in balances]
            }

        elif action == "leave_request":
            # Convert date strings to date objects
            if "start_date" in params and isinstance(params["start_date"], str):
                params["start_date"] = datetime.fromisoformat(params["start_date"]).date()
            if "end_date" in params and isinstance(params["end_date"], str):
                params["end_date"] = datetime.fromisoformat(params["end_date"]).date()

            leave_data = LeaveRequestCreate(**params)
            leave_request = await module.request_leave(leave_data)

            return {
                "action": "leave_request",
                "leave_id": leave_request.leave_id,
                "leave_request": leave_request.model_dump()
            }

        elif action == "leave_approve":
            approval_data = LeaveApproval(
                leave_id=params.get("leave_id"),
                approver_id=params.get("approver_id"),
                status=LeaveStatus.APPROVED,
                comments=params.get("comments")
            )
            leave_request = await module.approve_leave(approval_data)

            return {
                "action": "leave_approve",
                "leave_id": leave_request.leave_id,
                "status": "approved",
                "leave_request": leave_request.model_dump()
            }

        elif action == "leave_reject":
            approval_data = LeaveApproval(
                leave_id=params.get("leave_id"),
                approver_id=params.get("approver_id"),
                status=LeaveStatus.REJECTED,
                comments=params.get("comments")
            )
            leave_request = await module.approve_leave(approval_data)

            return {
                "action": "leave_reject",
                "leave_id": leave_request.leave_id,
                "status": "rejected",
                "leave_request": leave_request.model_dump()
            }

        elif action == "leave_cancel":
            leave_id = params.get("leave_id")
            employee_id = params.get("employee_id")

            if not leave_id or not employee_id:
                raise ValueError("leave_id and employee_id are required")

            result = await module.cancel_leave(leave_id, employee_id)

            return {
                "action": "leave_cancel",
                **result
            }

        else:
            raise ValueError(f"Unknown leave action: {action}")

    # ========================================================================
    # ATTENDANCE ACTIONS
    # ========================================================================

    async def _handle_attendance_action(
        self,
        module: AttendanceModule,
        action: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle attendance-related actions."""

        if action == "attendance_clock_in":
            clock_in_data = ClockInRequest(**params)
            attendance = await module.clock_in(clock_in_data)

            return {
                "action": "attendance_clock_in",
                "attendance_id": attendance.attendance_id,
                "clock_in": attendance.clock_in.isoformat() if attendance.clock_in else None,
                "attendance": attendance.model_dump()
            }

        elif action == "attendance_clock_out":
            clock_out_data = ClockOutRequest(**params)
            attendance = await module.clock_out(clock_out_data)

            return {
                "action": "attendance_clock_out",
                "attendance_id": attendance.attendance_id,
                "work_hours": attendance.work_hours,
                "overtime_hours": attendance.overtime_hours,
                "attendance": attendance.model_dump()
            }

        elif action == "attendance_get":
            employee_id = params.get("employee_id")
            start_date = params.get("start_date")
            end_date = params.get("end_date")

            if not all([employee_id, start_date, end_date]):
                raise ValueError("employee_id, start_date, and end_date are required")

            # Convert date strings
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date).date()
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date).date()

            records = await module.get_attendance(employee_id, start_date, end_date)

            return {
                "action": "attendance_get",
                "employee_id": employee_id,
                "count": len(records),
                "records": [rec.model_dump() for rec in records]
            }

        elif action == "attendance_regularize":
            employee_id = params.get("employee_id")
            att_date = params.get("date")
            reason = params.get("reason")

            if not all([employee_id, att_date, reason]):
                raise ValueError("employee_id, date, and reason are required")

            if isinstance(att_date, str):
                att_date = datetime.fromisoformat(att_date).date()

            attendance = await module.mark_regularization(employee_id, att_date, reason)

            return {
                "action": "attendance_regularize",
                "attendance_id": attendance.attendance_id,
                "attendance": attendance.model_dump()
            }

        elif action == "attendance_summary":
            employee_id = params.get("employee_id")
            month = params.get("month")
            year = params.get("year")

            if not all([employee_id, month, year]):
                raise ValueError("employee_id, month, and year are required")

            summary = await module.get_attendance_summary(employee_id, month, year)

            return {
                "action": "attendance_summary",
                "summary": summary.model_dump()
            }

        else:
            raise ValueError(f"Unknown attendance action: {action}")
