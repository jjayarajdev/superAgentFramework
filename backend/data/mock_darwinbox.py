"""
Mock Darwinbox (HR System) data generator.
"""
from faker import Faker
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any

fake = Faker()
Faker.seed(42)

DEPARTMENTS = [
    "Engineering", "Sales", "Marketing", "Product", "Customer Success",
    "Finance", "HR", "Operations", "IT", "Legal", "Executive"
]

TITLES = {
    "Engineering": ["Software Engineer", "Senior Software Engineer", "Engineering Manager", "Tech Lead", "Staff Engineer"],
    "Sales": ["Account Executive", "Sales Development Rep", "Sales Manager", "VP of Sales", "Account Manager"],
    "Marketing": ["Marketing Manager", "Content Writer", "Digital Marketing Specialist", "CMO", "Product Marketing Manager"],
    "Product": ["Product Manager", "Senior Product Manager", "Product Owner", "VP of Product"],
    "Customer Success": ["Customer Success Manager", "Support Engineer", "VP of Customer Success"],
    "Finance": ["Financial Analyst", "Accountant", "CFO", "Finance Manager"],
    "HR": ["HR Manager", "Recruiter", "HR Business Partner", "CHRO"],
    "Operations": ["Operations Manager", "Operations Analyst", "COO"],
    "IT": ["IT Manager", "System Administrator", "IT Support Specialist", "CTO"],
    "Legal": ["Legal Counsel", "Compliance Manager", "General Counsel"],
    "Executive": ["CEO", "President", "Board Member"]
}

PERFORMANCE_RATINGS = ["Outstanding", "Exceeds Expectations", "Meets Expectations", "Needs Improvement"]

SKILLS = [
    "Python", "JavaScript", "React", "AWS", "Leadership", "Communication",
    "Sales", "Negotiation", "Data Analysis", "Project Management", "SQL",
    "Docker", "Kubernetes", "Machine Learning", "Product Strategy"
]


def generate_employees(count: int = 100) -> List[Dict[str, Any]]:
    """Generate mock employee records."""
    employees = []

    for i in range(count):
        department = random.choice(DEPARTMENTS)
        title = random.choice(TITLES.get(department, ["Employee"]))
        hire_date = fake.date_between(start_date="-10y", end_date="-1m")

        employee = {
            "employee_id": f"emp_{i+1:04d}",
            "first_name": fake.first_name(),
            "last_name": fake.last_name(),
            "email": fake.email(),
            "phone": fake.phone_number(),
            "department": department,
            "title": title,
            "manager_id": f"emp_{random.randint(1, max(1, i)):04d}" if i > 0 else None,
            "manager_name": fake.name() if i > 0 else None,
            "hire_date": hire_date.isoformat(),
            "employment_status": random.choice(["Active", "Active", "Active", "Active", "On Leave"]),  # Mostly active
            "location": f"{fake.city()}, {fake.state()}",
            "salary": random.randint(50000, 250000),
            "performance_rating": random.choice(PERFORMANCE_RATINGS),
            "last_review_date": (datetime.now() - timedelta(days=random.randint(30, 180))).date().isoformat(),
            "skills": random.sample(SKILLS, k=random.randint(3, 7)),
            "years_of_experience": random.randint(1, 20),
            "education": random.choice(["Bachelor's", "Master's", "MBA", "PhD"]),
        }
        employees.append(employee)

    return employees


# In-memory storage
_employees = []


def seed_darwinbox_data():
    """Seed mock Darwinbox data."""
    global _employees
    _employees = generate_employees(100)
    print(f"  👥 Generated {len(_employees)} employee records")


def get_employees(filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """Get employees with optional filters."""
    employees = _employees

    if filters:
        if "department" in filters:
            employees = [e for e in employees if e["department"] == filters["department"]]

        if "performance_rating" in filters:
            employees = [e for e in employees if e["performance_rating"] == filters["performance_rating"]]

        if "manager_id" in filters:
            employees = [e for e in employees if e["manager_id"] == filters["manager_id"]]

    return employees


def get_employee_by_id(employee_id: str) -> Dict[str, Any]:
    """Get employee by ID."""
    for emp in _employees:
        if emp["employee_id"] == employee_id:
            return emp
    return None
