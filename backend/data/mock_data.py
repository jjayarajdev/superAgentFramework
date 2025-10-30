"""
Centralized mock data for all agents.

This provides realistic mock data for demos and development.
When real API credentials are configured, agents automatically switch to real mode.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import random


class MockDataStore:
    """Central store for all mock data."""

    def __init__(self):
        self._salesforce_opportunities = self._generate_salesforce_data()
        self._salesforce_accounts = self._generate_accounts()
        self._salesforce_contacts = self._generate_contacts()
        self._slack_channels = self._generate_slack_channels()
        self._slack_messages = []
        self._jira_issues = self._generate_jira_issues()
        self._jira_projects = self._generate_jira_projects()
        self._hubspot_contacts = self._generate_hubspot_contacts()
        self._hubspot_companies = self._generate_hubspot_companies()
        self._zendesk_tickets = self._generate_zendesk_tickets()
        self._servicenow_incidents = self._generate_servicenow_incidents()
        self._workday_employees = self._generate_workday_employees()
        self._email_templates = self._generate_email_templates()
        self._sent_emails = []

    # ==================== SALESFORCE ====================

    def _generate_salesforce_data(self) -> List[Dict[str, Any]]:
        """Generate realistic Salesforce opportunities."""
        companies = [
            "Acme Corporation", "TechVentures Inc", "Global Industries",
            "Innovation Labs", "Enterprise Solutions", "FutureTech Co",
            "Digital Dynamics", "CloudScale Systems", "DataDrive Inc",
            "SmartBiz Solutions", "NextGen Enterprises", "Quantum Corp"
        ]

        stages = ["Prospecting", "Qualification", "Needs Analysis",
                 "Value Proposition", "Negotiation", "Closed Won", "Closed Lost"]

        opportunities = []
        for i, company in enumerate(companies):
            amount = random.randint(50, 1000) * 1000
            stage = random.choice(stages[:5])  # Mostly open opportunities
            close_date = datetime.now() + timedelta(days=random.randint(30, 180))

            opportunities.append({
                "Id": f"opp_{i+1:03d}",
                "Name": f"{company} - Enterprise License",
                "AccountName": company,
                "Amount": amount,
                "StageName": stage,
                "Probability": random.randint(20, 80),
                "CloseDate": close_date.strftime("%Y-%m-%d"),
                "OwnerId": f"user_{random.randint(1, 5)}",
                "OwnerName": random.choice(["Sarah Johnson", "Mike Chen", "Emma Wilson", "David Brown"]),
                "Type": random.choice(["New Business", "Existing Customer - Upgrade", "Existing Customer - Renewal"]),
                "LeadSource": random.choice(["Web", "Referral", "Partner", "Conference", "Cold Call"]),
                "Description": f"Opportunity to provide enterprise software license to {company}",
                "NextStep": "Schedule demo" if stage == "Prospecting" else "Send proposal",
                "CreatedDate": (datetime.now() - timedelta(days=random.randint(10, 90))).isoformat()
            })

        return opportunities

    def _generate_accounts(self) -> List[Dict[str, Any]]:
        """Generate Salesforce accounts."""
        return [
            {
                "Id": "acc_001",
                "Name": "Acme Corporation",
                "Industry": "Technology",
                "AnnualRevenue": 50000000,
                "NumberOfEmployees": 500,
                "BillingCity": "San Francisco",
                "BillingState": "CA",
                "Phone": "(415) 555-0100",
                "Website": "www.acmecorp.com"
            },
            {
                "Id": "acc_002",
                "Name": "TechVentures Inc",
                "Industry": "Software",
                "AnnualRevenue": 25000000,
                "NumberOfEmployees": 250,
                "BillingCity": "Austin",
                "BillingState": "TX",
                "Phone": "(512) 555-0200",
                "Website": "www.techventures.com"
            }
        ]

    def _generate_contacts(self) -> List[Dict[str, Any]]:
        """Generate Salesforce contacts."""
        return [
            {
                "Id": "con_001",
                "FirstName": "John",
                "LastName": "Smith",
                "Email": "john.smith@acmecorp.com",
                "Phone": "(415) 555-0101",
                "Title": "VP of Engineering",
                "AccountId": "acc_001",
                "AccountName": "Acme Corporation"
            },
            {
                "Id": "con_002",
                "FirstName": "Jane",
                "LastName": "Doe",
                "Email": "jane.doe@techventures.com",
                "Phone": "(512) 555-0201",
                "Title": "CTO",
                "AccountId": "acc_002",
                "AccountName": "TechVentures Inc"
            }
        ]

    def get_salesforce_opportunities(self, filters: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Get filtered Salesforce opportunities."""
        opportunities = self._salesforce_opportunities.copy()

        if not filters:
            return opportunities

        # Apply filters
        if "Amount" in filters:
            threshold = int(filters["Amount"].replace("> ", ""))
            opportunities = [opp for opp in opportunities if opp["Amount"] > threshold]

        if "StageName" in filters:
            opportunities = [opp for opp in opportunities if opp["StageName"] == filters["StageName"]]

        if "CloseDate" in filters:
            # Simple Q1-Q4 filtering
            quarter = filters["CloseDate"].replace(">= ", "")
            opportunities = [opp for opp in opportunities if quarter in opp["CloseDate"]]

        return opportunities

    # ==================== SLACK ====================

    def _generate_slack_channels(self) -> List[Dict[str, Any]]:
        """Generate Slack channels."""
        return [
            {"id": "C001", "name": "general", "topic": "Company-wide announcements", "num_members": 150},
            {"id": "C002", "name": "engineering", "topic": "Engineering team chat", "num_members": 45},
            {"id": "C003", "name": "sales", "topic": "Sales team discussions", "num_members": 30},
            {"id": "C004", "name": "marketing", "topic": "Marketing campaigns", "num_members": 20},
            {"id": "C005", "name": "support", "topic": "Customer support team", "num_members": 25},
            {"id": "C006", "name": "product", "topic": "Product discussions", "num_members": 35},
        ]

    def send_slack_message(self, channel: str, message: str, attachments: Optional[List] = None) -> Dict[str, Any]:
        """Send a mock Slack message."""
        msg = {
            "ok": True,
            "channel": channel,
            "ts": str(datetime.now().timestamp()),
            "message": {
                "text": message,
                "user": "U001",
                "ts": str(datetime.now().timestamp()),
                "attachments": attachments or []
            }
        }
        self._slack_messages.append(msg)
        return msg

    def get_slack_channels(self) -> List[Dict[str, Any]]:
        """Get all Slack channels."""
        return self._slack_channels

    # ==================== JIRA ====================

    def _generate_jira_projects(self) -> List[Dict[str, Any]]:
        """Generate Jira projects."""
        return [
            {"id": "10000", "key": "ENG", "name": "Engineering", "lead": "john.smith"},
            {"id": "10001", "key": "SUP", "name": "Support", "lead": "jane.doe"},
            {"id": "10002", "key": "PROD", "name": "Product", "lead": "mike.chen"},
        ]

    def _generate_jira_issues(self) -> List[Dict[str, Any]]:
        """Generate Jira issues."""
        issue_types = ["Bug", "Task", "Story", "Epic"]
        priorities = ["Highest", "High", "Medium", "Low"]
        statuses = ["To Do", "In Progress", "Code Review", "Done"]

        issues = []
        for i in range(1, 21):
            issues.append({
                "id": str(10000 + i),
                "key": f"ENG-{i}",
                "fields": {
                    "summary": f"Issue {i}: {random.choice(['Fix bug', 'Add feature', 'Improve performance', 'Update docs'])}",
                    "description": f"Detailed description for issue {i}",
                    "issuetype": {"name": random.choice(issue_types)},
                    "priority": {"name": random.choice(priorities)},
                    "status": {"name": random.choice(statuses)},
                    "assignee": {"displayName": random.choice(["John Smith", "Jane Doe", "Mike Chen"])},
                    "reporter": {"displayName": "Sarah Johnson"},
                    "created": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                    "updated": (datetime.now() - timedelta(days=random.randint(0, 5))).isoformat(),
                    "project": {"key": "ENG", "name": "Engineering"}
                }
            })

        return issues

    def create_jira_issue(self, project: str, summary: str, description: str, issue_type: str = "Task") -> Dict[str, Any]:
        """Create a mock Jira issue."""
        issue_id = len(self._jira_issues) + 10001
        issue_key = f"{project}-{len([i for i in self._jira_issues if i['key'].startswith(project)]) + 1}"

        issue = {
            "id": str(issue_id),
            "key": issue_key,
            "fields": {
                "summary": summary,
                "description": description,
                "issuetype": {"name": issue_type},
                "priority": {"name": "Medium"},
                "status": {"name": "To Do"},
                "assignee": None,
                "reporter": {"displayName": "System"},
                "created": datetime.now().isoformat(),
                "updated": datetime.now().isoformat(),
                "project": {"key": project, "name": "Engineering"}
            }
        }

        self._jira_issues.append(issue)
        return issue

    def get_jira_issues(self, jql: Optional[str] = None, project: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get Jira issues with optional filtering."""
        issues = self._jira_issues.copy()

        if project:
            issues = [i for i in issues if i['key'].startswith(project)]

        # Simple JQL parsing for common cases
        if jql:
            if "priority = High" in jql or "priority = Highest" in jql:
                issues = [i for i in issues if i['fields']['priority']['name'] in ['High', 'Highest']]

        return issues

    # ==================== HUBSPOT ====================

    def _generate_hubspot_contacts(self) -> List[Dict[str, Any]]:
        """Generate HubSpot contacts."""
        return [
            {
                "id": "1001",
                "properties": {
                    "firstname": "Alice",
                    "lastname": "Johnson",
                    "email": "alice.johnson@example.com",
                    "phone": "(555) 123-4567",
                    "company": "Tech Innovations",
                    "jobtitle": "Marketing Director",
                    "lifecyclestage": "lead",
                    "createdate": (datetime.now() - timedelta(days=45)).isoformat()
                }
            },
            {
                "id": "1002",
                "properties": {
                    "firstname": "Bob",
                    "lastname": "Williams",
                    "email": "bob.williams@example.com",
                    "phone": "(555) 234-5678",
                    "company": "Enterprise Corp",
                    "jobtitle": "VP Sales",
                    "lifecyclestage": "opportunity",
                    "createdate": (datetime.now() - timedelta(days=30)).isoformat()
                }
            }
        ]

    def _generate_hubspot_companies(self) -> List[Dict[str, Any]]:
        """Generate HubSpot companies."""
        return [
            {
                "id": "2001",
                "properties": {
                    "name": "Tech Innovations",
                    "domain": "techinnovations.com",
                    "industry": "Technology",
                    "annualrevenue": "5000000",
                    "numberofemployees": "100"
                }
            }
        ]

    def get_hubspot_contacts(self, filters: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Get HubSpot contacts."""
        contacts = self._hubspot_contacts.copy()

        if filters and "lifecyclestage" in filters:
            stage = filters["lifecyclestage"]
            contacts = [c for c in contacts if c['properties'].get('lifecyclestage') == stage]

        return contacts

    # ==================== ZENDESK ====================

    def _generate_zendesk_tickets(self) -> List[Dict[str, Any]]:
        """Generate Zendesk support tickets."""
        priorities = ["low", "normal", "high", "urgent"]
        statuses = ["new", "open", "pending", "solved"]

        tickets = []
        for i in range(1, 16):
            tickets.append({
                "id": 1000 + i,
                "subject": f"Support Request: {random.choice(['Login issue', 'Feature request', 'Bug report', 'Account question'])}",
                "description": f"Customer needs help with issue {i}",
                "status": random.choice(statuses),
                "priority": random.choice(priorities),
                "requester_id": 50000 + i,
                "assignee_id": 60000 + random.randint(1, 5) if random.random() > 0.3 else None,
                "created_at": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                "updated_at": (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat(),
                "tags": ["support", random.choice(["billing", "technical", "account"])],
            })

        return tickets

    def get_zendesk_tickets(self, status: Optional[str] = None, priority: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get Zendesk tickets with filtering."""
        tickets = self._zendesk_tickets.copy()

        if status:
            tickets = [t for t in tickets if t['status'] == status]

        if priority:
            tickets = [t for t in tickets if t['priority'] == priority]

        return tickets

    # ==================== SERVICENOW ====================

    def _generate_servicenow_incidents(self) -> List[Dict[str, Any]]:
        """Generate ServiceNow incidents."""
        priorities = ["1 - Critical", "2 - High", "3 - Moderate", "4 - Low"]
        states = ["New", "In Progress", "On Hold", "Resolved", "Closed"]

        incidents = []
        for i in range(1, 11):
            incidents.append({
                "sys_id": f"inc{i:05d}",
                "number": f"INC{1000 + i}",
                "short_description": f"System issue: {random.choice(['Server down', 'Network slow', 'Application error', 'Access issue'])}",
                "description": f"Detailed description of incident {i}",
                "priority": random.choice(priorities),
                "state": random.choice(states),
                "assigned_to": random.choice(["IT Support", "Network Team", "App Team"]),
                "opened_at": (datetime.now() - timedelta(days=random.randint(1, 15))).isoformat(),
                "updated_at": (datetime.now() - timedelta(hours=random.randint(1, 12))).isoformat(),
            })

        return incidents

    def get_servicenow_incidents(self, priority: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get ServiceNow incidents."""
        incidents = self._servicenow_incidents.copy()

        if priority:
            incidents = [i for i in incidents if priority in i['priority']]

        return incidents

    # ==================== WORKDAY ====================

    def _generate_workday_employees(self) -> List[Dict[str, Any]]:
        """Generate Workday employee records."""
        departments = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"]

        employees = []
        for i in range(1, 51):
            employees.append({
                "employee_id": f"EMP{i:04d}",
                "first_name": random.choice(["John", "Jane", "Mike", "Sarah", "David", "Emma"]),
                "last_name": random.choice(["Smith", "Johnson", "Williams", "Brown", "Jones", "Davis"]),
                "email": f"employee{i}@company.com",
                "department": random.choice(departments),
                "job_title": random.choice(["Manager", "Senior Engineer", "Analyst", "Director", "Specialist"]),
                "hire_date": (datetime.now() - timedelta(days=random.randint(100, 2000))).strftime("%Y-%m-%d"),
                "status": "Active",
                "manager_id": f"EMP{random.randint(1, 10):04d}",
            })

        return employees

    def get_workday_employees(self, department: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get Workday employees."""
        employees = self._workday_employees.copy()

        if department:
            employees = [e for e in employees if e['department'] == department]

        return employees

    # ==================== EMAIL ====================

    def _generate_email_templates(self) -> Dict[str, Dict[str, str]]:
        """Generate email templates."""
        return {
            "lead_follow_up": {
                "subject": "Following up on your interest",
                "body": "Hi {{name}},\n\nThank you for your interest in our products. I wanted to follow up and see if you have any questions.\n\nBest regards,\n{{sender_name}}"
            },
            "welcome_onboarding": {
                "subject": "Welcome to the team, {{name}}!",
                "body": "Hi {{name}},\n\nWelcome to our team! We're excited to have you join us as {{role}}.\n\nYour start date is {{start_date}}. Please find attached your onboarding guide.\n\nBest,\nHR Team"
            },
            "marketing_campaign": {
                "subject": "Special offer just for you!",
                "body": "Hi {{name}},\n\nWe have a special offer for {{company}}. Check out our latest products.\n\nBest regards,\nMarketing Team"
            }
        }

    def send_email(self, to: str, subject: str, body: str, template: Optional[str] = None) -> Dict[str, Any]:
        """Send a mock email."""
        email = {
            "id": f"email_{len(self._sent_emails) + 1}",
            "to": to,
            "subject": subject,
            "body": body,
            "template": template,
            "sent_at": datetime.now().isoformat(),
            "status": "sent"
        }
        self._sent_emails.append(email)
        return email

    def get_email_template(self, template_name: str) -> Optional[Dict[str, str]]:
        """Get email template."""
        return self._email_templates.get(template_name)

    def get_email_templates(self) -> Dict[str, Dict[str, str]]:
        """Get all email templates."""
        return self._email_templates


# Global mock data store instance
mock_data = MockDataStore()


# Convenience functions for backward compatibility
def get_opportunities(filters: Optional[Dict] = None) -> List[Dict[str, Any]]:
    """Get Salesforce opportunities."""
    return mock_data.get_salesforce_opportunities(filters)


def get_accounts() -> List[Dict[str, Any]]:
    """Get Salesforce accounts."""
    return mock_data._salesforce_accounts


def get_contacts() -> List[Dict[str, Any]]:
    """Get Salesforce contacts."""
    return mock_data._salesforce_contacts
