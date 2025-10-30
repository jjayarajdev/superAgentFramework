"""
Employee Core module for Darwinbox API.
"""
from typing import List, Dict, Any, Optional
from ..client import DarwinboxClient
from ..models import Employee, EmployeeCreate, EmployeeUpdate, EmploymentStatus
from data import mock_darwinbox


class EmployeeModule:
    """
    Employee Core operations.

    Handles:
    - Get employee by ID
    - Search employees with filters
    - Create new employee
    - Update employee
    - Deactivate employee
    """

    def __init__(self, client: DarwinboxClient, use_mock: bool = True):
        """
        Initialize Employee module.

        Args:
            client: Darwinbox API client
            use_mock: Use mock data instead of real API (for testing)
        """
        self.client = client
        self.use_mock = use_mock

    async def get_employee(self, employee_id: str) -> Optional[Employee]:
        """
        Get employee by ID.

        Args:
            employee_id: Employee ID

        Returns:
            Employee object or None if not found
        """
        if self.use_mock:
            emp_data = mock_darwinbox.get_employee_by_id(employee_id)
            if emp_data:
                return Employee(**emp_data)
            return None

        response = await self.client.get(f"/api/v1/employees/{employee_id}")
        return Employee(**response['data'])

    async def search_employees(self, filters: Optional[Dict[str, Any]] = None) -> List[Employee]:
        """
        Search employees with filters.

        Args:
            filters: Search filters (department, location, status, etc.)

        Returns:
            List of Employee objects
        """
        if self.use_mock:
            emp_list = mock_darwinbox.get_employees(filters or {})
            return [Employee(**emp) for emp in emp_list]

        response = await self.client.get("/api/v1/employees", params=filters)
        return [Employee(**emp) for emp in response.get('data', [])]

    async def create_employee(self, employee_data: EmployeeCreate) -> Employee:
        """
        Create new employee.

        Args:
            employee_data: Employee creation data

        Returns:
            Created Employee object
        """
        if self.use_mock:
            # Generate mock employee ID
            employee_id = f"emp_{len(mock_darwinbox._employees) + 1:04d}"
            emp_dict = employee_data.model_dump()
            emp_dict['employee_id'] = employee_id
            emp_dict['employment_status'] = EmploymentStatus.ACTIVE
            emp_dict['manager_name'] = "TBD"
            emp_dict['salary'] = 0

            # Add to mock storage
            mock_darwinbox._employees.append(emp_dict)

            return Employee(**emp_dict)

        response = await self.client.post(
            "/api/v1/employees",
            data=employee_data.model_dump()
        )
        return Employee(**response['data'])

    async def update_employee(self, employee_id: str, employee_data: EmployeeUpdate) -> Employee:
        """
        Update employee information.

        Args:
            employee_id: Employee ID
            employee_data: Fields to update

        Returns:
            Updated Employee object
        """
        if self.use_mock:
            # Find and update employee in mock data
            for emp in mock_darwinbox._employees:
                if emp['employee_id'] == employee_id:
                    update_dict = employee_data.model_dump(exclude_unset=True)
                    emp.update(update_dict)
                    return Employee(**emp)
            raise ValueError(f"Employee {employee_id} not found")

        response = await self.client.put(
            f"/api/v1/employees/{employee_id}",
            data=employee_data.model_dump(exclude_unset=True)
        )
        return Employee(**response['data'])

    async def deactivate_employee(self, employee_id: str) -> Dict[str, Any]:
        """
        Deactivate/offboard employee.

        Args:
            employee_id: Employee ID

        Returns:
            Confirmation response
        """
        if self.use_mock:
            # Update status to inactive
            for emp in mock_darwinbox._employees:
                if emp['employee_id'] == employee_id:
                    emp['employment_status'] = EmploymentStatus.INACTIVE.value
                    return {
                        "success": True,
                        "message": f"Employee {employee_id} deactivated",
                        "employee_id": employee_id
                    }
            raise ValueError(f"Employee {employee_id} not found")

        response = await self.client.delete(f"/api/v1/employees/{employee_id}")
        return response
