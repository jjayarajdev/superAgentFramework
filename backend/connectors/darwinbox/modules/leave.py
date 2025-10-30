"""
Leave Management module for Darwinbox API.
"""
from typing import List, Dict, Any
from datetime import datetime
from ..client import DarwinboxClient
from ..models import LeaveBalance, LeaveRequest, LeaveRequestCreate, LeaveApproval, LeaveType, LeaveStatus
from data import mock_darwinbox


class LeaveModule:
    """
    Leave Management operations.

    Handles:
    - Get leave balance
    - Request leave
    - Approve/reject leave
    - Cancel leave
    - Get leave calendar
    """

    def __init__(self, client: DarwinboxClient, use_mock: bool = True):
        """
        Initialize Leave module.

        Args:
            client: Darwinbox API client
            use_mock: Use mock data instead of real API
        """
        self.client = client
        self.use_mock = use_mock
        self._mock_leave_requests = []  # In-memory storage for mock
        self._mock_balances = {}  # Leave balances

    def _init_mock_balance(self, employee_id: str):
        """Initialize mock leave balance for employee."""
        if employee_id not in self._mock_balances:
            self._mock_balances[employee_id] = {
                LeaveType.PTO: {"total": 20, "used": 5, "pending": 0},
                LeaveType.SICK: {"total": 10, "used": 2, "pending": 0},
                LeaveType.CASUAL: {"total": 12, "used": 3, "pending": 0},
            }

    async def get_leave_balance(self, employee_id: str) -> List[LeaveBalance]:
        """
        Get leave balance for employee.

        Args:
            employee_id: Employee ID

        Returns:
            List of LeaveBalance objects for each leave type
        """
        if self.use_mock:
            self._init_mock_balance(employee_id)
            balances = []
            for leave_type, data in self._mock_balances[employee_id].items():
                balances.append(LeaveBalance(
                    employee_id=employee_id,
                    leave_type=leave_type,
                    total_allocated=data["total"],
                    used=data["used"],
                    pending=data["pending"],
                    available=data["total"] - data["used"] - data["pending"]
                ))
            return balances

        response = await self.client.get(f"/api/v1/leave/balance/{employee_id}")
        return [LeaveBalance(**bal) for bal in response.get('data', [])]

    async def request_leave(self, leave_data: LeaveRequestCreate) -> LeaveRequest:
        """
        Submit leave request.

        Args:
            leave_data: Leave request details

        Returns:
            LeaveRequest object with leave_id
        """
        if self.use_mock:
            leave_id = f"leave_{len(self._mock_leave_requests) + 1:04d}"
            days_count = (leave_data.end_date - leave_data.start_date).days + 1

            # Get employee name
            emp = mock_darwinbox.get_employee_by_id(leave_data.employee_id)
            emp_name = f"{emp['first_name']} {emp['last_name']}" if emp else "Unknown"

            leave_request = LeaveRequest(
                leave_id=leave_id,
                employee_id=leave_data.employee_id,
                employee_name=emp_name,
                leave_type=leave_data.leave_type,
                start_date=leave_data.start_date,
                end_date=leave_data.end_date,
                days_count=days_count,
                reason=leave_data.reason,
                status=LeaveStatus.PENDING,
                applied_date=datetime.now()
            )

            self._mock_leave_requests.append(leave_request.model_dump())

            # Update pending balance
            self._init_mock_balance(leave_data.employee_id)
            if leave_data.leave_type in self._mock_balances[leave_data.employee_id]:
                self._mock_balances[leave_data.employee_id][leave_data.leave_type]["pending"] += days_count

            return leave_request

        response = await self.client.post(
            "/api/v1/leave/request",
            data=leave_data.model_dump()
        )
        return LeaveRequest(**response['data'])

    async def approve_leave(self, approval_data: LeaveApproval) -> LeaveRequest:
        """
        Approve or reject leave request.

        Args:
            approval_data: Approval details

        Returns:
            Updated LeaveRequest
        """
        if self.use_mock:
            # Find leave request
            for leave in self._mock_leave_requests:
                if leave['leave_id'] == approval_data.leave_id:
                    leave['status'] = approval_data.status.value
                    leave['approver_id'] = approval_data.approver_id
                    leave['approved_date'] = datetime.now().isoformat()

                    # Update balances
                    employee_id = leave['employee_id']
                    leave_type = LeaveType(leave['leave_type'])
                    days_count = leave['days_count']

                    self._init_mock_balance(employee_id)

                    if approval_data.status == LeaveStatus.APPROVED:
                        # Move from pending to used
                        self._mock_balances[employee_id][leave_type]["pending"] -= days_count
                        self._mock_balances[employee_id][leave_type]["used"] += days_count
                    else:
                        # Remove from pending
                        self._mock_balances[employee_id][leave_type]["pending"] -= days_count

                    return LeaveRequest(**leave)

            raise ValueError(f"Leave request {approval_data.leave_id} not found")

        response = await self.client.post(
            f"/api/v1/leave/approve/{approval_data.leave_id}",
            data=approval_data.model_dump()
        )
        return LeaveRequest(**response['data'])

    async def cancel_leave(self, leave_id: str, employee_id: str) -> Dict[str, Any]:
        """
        Cancel leave request.

        Args:
            leave_id: Leave request ID
            employee_id: Employee ID (for verification)

        Returns:
            Confirmation response
        """
        if self.use_mock:
            for leave in self._mock_leave_requests:
                if leave['leave_id'] == leave_id and leave['employee_id'] == employee_id:
                    if leave['status'] == LeaveStatus.PENDING.value:
                        leave['status'] = LeaveStatus.CANCELLED.value

                        # Update pending balance
                        leave_type = LeaveType(leave['leave_type'])
                        days_count = leave['days_count']
                        self._init_mock_balance(employee_id)
                        self._mock_balances[employee_id][leave_type]["pending"] -= days_count

                        return {
                            "success": True,
                            "message": "Leave cancelled successfully",
                            "leave_id": leave_id
                        }
                    else:
                        raise ValueError("Can only cancel pending leave requests")

            raise ValueError(f"Leave request {leave_id} not found")

        response = await self.client.delete(f"/api/v1/leave/{leave_id}")
        return response

    async def get_leave_requests(self, employee_id: str = None) -> List[LeaveRequest]:
        """
        Get leave requests.

        Args:
            employee_id: Filter by employee (optional)

        Returns:
            List of LeaveRequest objects
        """
        if self.use_mock:
            requests = self._mock_leave_requests
            if employee_id:
                requests = [r for r in requests if r['employee_id'] == employee_id]
            return [LeaveRequest(**r) for r in requests]

        params = {"employee_id": employee_id} if employee_id else None
        response = await self.client.get("/api/v1/leave/requests", params=params)
        return [LeaveRequest(**r) for r in response.get('data', [])]
