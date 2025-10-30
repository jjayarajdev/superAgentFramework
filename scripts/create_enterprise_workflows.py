"""
Create 5 enterprise workflow examples using ONLY valid agent types.

Valid agent types:
- sales_intelligence
- workday
- sap
- servicenow
- slack
- jira
- hubspot
- zendesk
- email_outreach
- stripe
- darwinbox
- darwinbox_hr
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database.session import get_db
from database.models import WorkflowDB, User
from datetime import datetime
import uuid

# Enterprise workflows with VALID agent types only
workflows = [
    {
        "id": f"wf_{uuid.uuid4().hex[:8]}",
        "name": "Sales Lead Management",
        "description": "Find high-value sales opportunities, send personalized outreach emails, and notify the team on Slack",
        "category": "Sales",
        "tags": ["sales", "crm", "automation"],
        "icon": "💼",
        "agents": [
            {
                "id": "agent_1",
                "type": "sales_intelligence",
                "name": "Find High-Value Leads",
                "position": {"x": 100, "y": 150},
                "config": {
                    "connector": "salesforce",
                    "object_type": "Lead",
                    "amount_threshold": 50000,
                    "stage_filter": "Qualified"
                }
            },
            {
                "id": "agent_2",
                "type": "email_outreach",
                "name": "Send Personalized Emails",
                "position": {"x": 400, "y": 150},
                "config": {
                    "connector": "outlook",
                    "email_template": "lead_follow_up",
                    "use_rag": True
                }
            },
            {
                "id": "agent_3",
                "type": "slack",
                "name": "Notify Sales Team",
                "position": {"x": 700, "y": 150},
                "config": {
                    "connector": "slack",
                    "channel": "#sales-alerts",
                    "action_type": "send"
                }
            }
        ],
        "edges": [
            {"source": "agent_1", "target": "agent_2"},
            {"source": "agent_2", "target": "agent_3"}
        ]
    },
    {
        "id": f"wf_{uuid.uuid4().hex[:8]}",
        "name": "HR Onboarding Workflow",
        "description": "Automate new employee onboarding: create HR records, provision access, and send welcome materials",
        "category": "HR",
        "tags": ["hr", "onboarding", "automation"],
        "icon": "👋",
        "agents": [
            {
                "id": "agent_1",
                "type": "darwinbox_hr",
                "name": "Create Employee Record",
                "position": {"x": 100, "y": 150},
                "config": {
                    "action": "create_employee"
                }
            },
            {
                "id": "agent_2",
                "type": "slack",
                "name": "Create Slack Account",
                "position": {"x": 400, "y": 100},
                "config": {
                    "connector": "slack",
                    "action_type": "create_user"
                }
            },
            {
                "id": "agent_3",
                "type": "jira",
                "name": "Create Jira Account",
                "position": {"x": 400, "y": 200},
                "config": {
                    "connector": "jira",
                    "action": "create_user"
                }
            },
            {
                "id": "agent_4",
                "type": "email_outreach",
                "name": "Send Welcome Email",
                "position": {"x": 700, "y": 150},
                "config": {
                    "connector": "outlook",
                    "email_template": "welcome_onboarding",
                    "use_rag": False
                }
            }
        ],
        "edges": [
            {"source": "agent_1", "target": "agent_2"},
            {"source": "agent_1", "target": "agent_3"},
            {"source": "agent_2", "target": "agent_4"},
            {"source": "agent_3", "target": "agent_4"}
        ]
    },
    {
        "id": f"wf_{uuid.uuid4().hex[:8]}",
        "name": "Customer Support Ticket Routing",
        "description": "Automatically triage support tickets from Zendesk and create Jira issues for high-priority cases",
        "category": "Support",
        "tags": ["support", "automation", "ticketing"],
        "icon": "🎧",
        "agents": [
            {
                "id": "agent_1",
                "type": "zendesk",
                "name": "Get High Priority Tickets",
                "position": {"x": 100, "y": 150},
                "config": {
                    "connector": "zendesk",
                    "priority_filter": "high",
                    "status_filter": "open"
                }
            },
            {
                "id": "agent_2",
                "type": "jira",
                "name": "Create Jira Issues",
                "position": {"x": 400, "y": 150},
                "config": {
                    "connector": "jira",
                    "action": "create_issue",
                    "project_key": "SUP"
                }
            },
            {
                "id": "agent_3",
                "type": "slack",
                "name": "Notify Support Team",
                "position": {"x": 700, "y": 150},
                "config": {
                    "connector": "slack",
                    "channel": "#support-escalations",
                    "action_type": "send"
                }
            }
        ],
        "edges": [
            {"source": "agent_1", "target": "agent_2"},
            {"source": "agent_2", "target": "agent_3"}
        ]
    },
    {
        "id": f"wf_{uuid.uuid4().hex[:8]}",
        "name": "Marketing Campaign Workflow",
        "description": "Pull leads from HubSpot, send marketing emails, and track engagement with Slack notifications",
        "category": "Marketing",
        "tags": ["marketing", "campaigns", "automation"],
        "icon": "📢",
        "agents": [
            {
                "id": "agent_1",
                "type": "hubspot",
                "name": "Get Marketing Leads",
                "position": {"x": 100, "y": 150},
                "config": {
                    "connector": "hubspot",
                    "object_type": "contacts",
                    "lead_status_filter": "new"
                }
            },
            {
                "id": "agent_2",
                "type": "email_outreach",
                "name": "Send Campaign Emails",
                "position": {"x": 400, "y": 150},
                "config": {
                    "connector": "outlook",
                    "email_template": "marketing_campaign",
                    "use_rag": True
                }
            },
            {
                "id": "agent_3",
                "type": "slack",
                "name": "Report Campaign Results",
                "position": {"x": 700, "y": 150},
                "config": {
                    "connector": "slack",
                    "channel": "#marketing-metrics",
                    "action_type": "send"
                }
            }
        ],
        "edges": [
            {"source": "agent_1", "target": "agent_2"},
            {"source": "agent_2", "target": "agent_3"}
        ]
    },
    {
        "id": f"wf_{uuid.uuid4().hex[:8]}",
        "name": "IT Service Management",
        "description": "Monitor ServiceNow tickets, create Jira tasks for incidents, and notify IT team on Slack",
        "category": "IT Operations",
        "tags": ["it", "operations", "incident-management"],
        "icon": "🖥️",
        "agents": [
            {
                "id": "agent_1",
                "type": "servicenow",
                "name": "Get Critical Incidents",
                "position": {"x": 100, "y": 150},
                "config": {
                    "connector": "servicenow",
                    "table": "incident",
                    "priority": "1"
                }
            },
            {
                "id": "agent_2",
                "type": "jira",
                "name": "Create Jira Tasks",
                "position": {"x": 400, "y": 150},
                "config": {
                    "connector": "jira",
                    "action": "create_issue",
                    "project_key": "IT",
                    "issue_type": "Incident"
                }
            },
            {
                "id": "agent_3",
                "type": "slack",
                "name": "Alert IT Team",
                "position": {"x": 700, "y": 150},
                "config": {
                    "connector": "slack",
                    "channel": "#it-incidents",
                    "action_type": "send"
                }
            }
        ],
        "edges": [
            {"source": "agent_1", "target": "agent_2"},
            {"source": "agent_2", "target": "agent_3"}
        ]
    }
]


def main():
    """Create enterprise workflows in the database."""
    print("🚀 Creating 5 enterprise workflows...")

    # Get database session
    db = next(get_db())

    try:
        # Get admin user
        admin_user = db.query(User).filter(User.email == "admin@acme.com").first()
        if not admin_user:
            print("❌ Admin user not found!")
            return

        # Create workflows
        created = 0
        for wf_data in workflows:
            workflow = WorkflowDB(
                id=wf_data["id"],
                org_id=admin_user.org_id,
                team_id=admin_user.team_id,
                created_by=admin_user.id,
                name=wf_data["name"],
                description=wf_data["description"],
                category=wf_data.get("category"),
                tags=wf_data.get("tags", []),
                icon=wf_data.get("icon"),
                agents=wf_data["agents"],
                edges=wf_data["edges"],
                version=1,
                is_published=True,
                environment="production",
                execution_count=0,
                success_count=0,
                failure_count=0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(workflow)
            created += 1
            print(f"  ✅ Created: {wf_data['name']}")

        db.commit()
        print(f"\n✅ Successfully created {created} enterprise workflows!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
