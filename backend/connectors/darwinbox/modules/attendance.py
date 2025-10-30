"""
Attendance & Time Tracking module for Darwinbox API.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from ..client import DarwinboxClient
from ..models import (
    AttendanceRecord, ClockInRequest, ClockOutRequest,
    AttendanceSummary, AttendanceStatus, ShiftType
)
from data import mock_darwinbox


class AttendanceModule:
    """
    Attendance & Time Tracking operations.

    Handles:
    - Clock in/out
    - Get attendance records
    - Mark regularization
    - Get attendance summary
    """

    def __init__(self, client: DarwinboxClient, use_mock: bool = True):
        """
        Initialize Attendance module.

        Args:
            client: Darwinbox API client
            use_mock: Use mock data instead of real API
        """
        self.client = client
        self.use_mock = use_mock
        self._mock_attendance = []  # In-memory storage

    async def clock_in(self, clock_in_data: ClockInRequest) -> AttendanceRecord:
        """
        Clock in for the day.

        Args:
            clock_in_data: Clock-in details

        Returns:
            AttendanceRecord with clock-in time
        """
        if self.use_mock:
            attendance_id = f"att_{len(self._mock_attendance) + 1:06d}"
            timestamp = clock_in_data.timestamp or datetime.now()

            # Get employee name
            emp = mock_darwinbox.get_employee_by_id(clock_in_data.employee_id)
            emp_name = f"{emp['first_name']} {emp['last_name']}" if emp else "Unknown"

            record = AttendanceRecord(
                attendance_id=attendance_id,
                employee_id=clock_in_data.employee_id,
                employee_name=emp_name,
                date=timestamp.date(),
                clock_in=timestamp,
                status=AttendanceStatus.PRESENT,
                shift_type=ShiftType.DAY,
                location=clock_in_data.location
            )

            self._mock_attendance.append(record.model_dump())
            return record

        response = await self.client.post(
            "/api/v1/attendance/clock-in",
            data=clock_in_data.model_dump()
        )
        return AttendanceRecord(**response['data'])

    async def clock_out(self, clock_out_data: ClockOutRequest) -> AttendanceRecord:
        """
        Clock out for the day.

        Args:
            clock_out_data: Clock-out details

        Returns:
            Updated AttendanceRecord with clock-out time and hours
        """
        if self.use_mock:
            timestamp = clock_out_data.timestamp or datetime.now()
            today = timestamp.date()

            # Find today's attendance record
            for att in self._mock_attendance:
                if (att['employee_id'] == clock_out_data.employee_id and
                    att['date'] == today.isoformat() and
                    att['clock_out'] is None):

                    clock_in_time = datetime.fromisoformat(att['clock_in'])
                    work_hours = (timestamp - clock_in_time).total_seconds() / 3600

                    att['clock_out'] = timestamp.isoformat()
                    att['work_hours'] = round(work_hours, 2)

                    # Calculate overtime (>8 hours)
                    if work_hours > 8:
                        att['overtime_hours'] = round(work_hours - 8, 2)

                    return AttendanceRecord(**att)

            raise ValueError("No clock-in record found for today")

        response = await self.client.post(
            "/api/v1/attendance/clock-out",
            data=clock_out_data.model_dump()
        )
        return AttendanceRecord(**response['data'])

    async def get_attendance(
        self,
        employee_id: str,
        start_date: date,
        end_date: date
    ) -> List[AttendanceRecord]:
        """
        Get attendance records for date range.

        Args:
            employee_id: Employee ID
            start_date: Start date
            end_date: End date

        Returns:
            List of AttendanceRecord objects
        """
        if self.use_mock:
            records = []
            for att in self._mock_attendance:
                att_date = date.fromisoformat(att['date']) if isinstance(att['date'], str) else att['date']
                if (att['employee_id'] == employee_id and
                    start_date <= att_date <= end_date):
                    records.append(AttendanceRecord(**att))
            return records

        response = await self.client.get(
            f"/api/v1/attendance/{employee_id}",
            params={
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }
        )
        return [AttendanceRecord(**att) for att in response.get('data', [])]

    async def mark_regularization(
        self,
        employee_id: str,
        att_date: date,
        reason: str
    ) -> AttendanceRecord:
        """
        Mark attendance for regularization (missed clock-in/out).

        Args:
            employee_id: Employee ID
            att_date: Date to regularize
            reason: Reason for regularization

        Returns:
            Updated AttendanceRecord
        """
        if self.use_mock:
            # Find attendance record
            for att in self._mock_attendance:
                att_date_obj = date.fromisoformat(att['date']) if isinstance(att['date'], str) else att['date']
                if (att['employee_id'] == employee_id and
                    att_date_obj == att_date):

                    att['regularization_required'] = True
                    att['regularization_reason'] = reason
                    return AttendanceRecord(**att)

            # Create new record if not exists
            emp = mock_darwinbox.get_employee_by_id(employee_id)
            emp_name = f"{emp['first_name']} {emp['last_name']}" if emp else "Unknown"

            record = AttendanceRecord(
                attendance_id=f"att_{len(self._mock_attendance) + 1:06d}",
                employee_id=employee_id,
                employee_name=emp_name,
                date=att_date,
                status=AttendanceStatus.PRESENT,
                regularization_required=True,
                regularization_reason=reason
            )

            self._mock_attendance.append(record.model_dump())
            return record

        response = await self.client.post(
            f"/api/v1/attendance/regularization",
            data={
                "employee_id": employee_id,
                "date": att_date.isoformat(),
                "reason": reason
            }
        )
        return AttendanceRecord(**response['data'])

    async def get_attendance_summary(
        self,
        employee_id: str,
        month: int,
        year: int
    ) -> AttendanceSummary:
        """
        Get monthly attendance summary.

        Args:
            employee_id: Employee ID
            month: Month (1-12)
            year: Year

        Returns:
            AttendanceSummary object
        """
        if self.use_mock:
            # Calculate summary from mock data
            records = []
            for att in self._mock_attendance:
                att_date = date.fromisoformat(att['date']) if isinstance(att['date'], str) else att['date']
                if (att['employee_id'] == employee_id and
                    att_date.month == month and
                    att_date.year == year):
                    records.append(att)

            # Calculate statistics
            total_days = len(records)
            present_days = len([r for r in records if r['status'] == AttendanceStatus.PRESENT.value])
            absent_days = len([r for r in records if r['status'] == AttendanceStatus.ABSENT.value])
            leave_days = len([r for r in records if r['status'] == AttendanceStatus.LEAVE.value])
            half_days = len([r for r in records if r['status'] == AttendanceStatus.HALF_DAY.value])

            total_hours = sum([r.get('work_hours', 0) for r in records])
            overtime_hours = sum([r.get('overtime_hours', 0) for r in records])

            # Mock late arrivals/early exits
            late_arrivals = len([r for r in records if r.get('clock_in') and
                                datetime.fromisoformat(r['clock_in']).hour > 9])
            early_exits = len([r for r in records if r.get('clock_out') and
                              datetime.fromisoformat(r['clock_out']).hour < 18])

            return AttendanceSummary(
                employee_id=employee_id,
                month=month,
                year=year,
                total_days=total_days,
                present_days=present_days,
                absent_days=absent_days,
                leave_days=leave_days,
                half_days=half_days,
                total_hours=round(total_hours, 2),
                overtime_hours=round(overtime_hours, 2),
                late_arrivals=late_arrivals,
                early_exits=early_exits
            )

        response = await self.client.get(
            f"/api/v1/attendance/summary/{employee_id}",
            params={"month": month, "year": year}
        )
        return AttendanceSummary(**response['data'])
