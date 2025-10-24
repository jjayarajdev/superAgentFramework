"""
Example/template workflows for demos.
"""

EXAMPLE_WORKFLOWS = [
    {
        "id": "example_sales_outreach",
        "name": "Sales Outreach Pipeline",
        "description": "Find high-value deals and send personalized follow-up emails with RAG context",
        "category": "sales",
        "icon": "📊",
        "agents": [
            {
                "id": "sales_agent_1",
                "type": "sales_intelligence",
                "name": "Find Q4 Deals",
                "config": {
                    "connector": "sfdc",
                    "object_type": "Opportunity",
                    "amount_threshold": 100000,
                    "close_date_filter": "Q4",
                    "stage_filter": "Negotiation"
                },
                "position": {"x": 100, "y": 150}
            },
            {
                "id": "email_agent_1",
                "type": "email_outreach",
                "name": "Send Check-In Emails",
                "config": {
                    "connector": "outlook",
                    "email_template": "check_in",
                    "use_rag": True,
                    "include_greeting": True,
                    "max_emails": 10
                },
                "position": {"x": 450, "y": 150}
            }
        ],
        "edges": [
            {
                "source": "sales_agent_1",
                "target": "email_agent_1"
            }
        ],
        "sample_input": "Find Q4 deals over $100K in Negotiation stage and send personalized check-in emails"
    },
    {
        "id": "example_hr_employee_search",
        "name": "HR Employee Lookup",
        "description": "Search for employees by department or role and notify via Slack",
        "category": "hr",
        "icon": "👥",
        "agents": [
            {
                "id": "workday_agent_1",
                "type": "workday",
                "name": "Search Employees",
                "config": {
                    "connector": "darwinbox",
                    "search_type": "department",
                    "department_filter": "Engineering",
                    "max_results": 20
                },
                "position": {"x": 100, "y": 150}
            },
            {
                "id": "slack_agent_1",
                "type": "slack",
                "name": "Post to Slack",
                "config": {
                    "connector": "slack",
                    "channel": "#team-updates",
                    "message_format": "summary",
                    "include_mentions": False
                },
                "position": {"x": 450, "y": 150}
            }
        ],
        "edges": [
            {
                "source": "workday_agent_1",
                "target": "slack_agent_1"
            }
        ],
        "sample_input": "Find all employees in Engineering department and post summary to Slack"
    },
    {
        "id": "example_customer_support",
        "name": "Customer Support Ticket Analysis",
        "description": "Analyze Zendesk tickets and create Jira issues for high-priority items",
        "category": "support",
        "icon": "🎧",
        "agents": [
            {
                "id": "zendesk_agent_1",
                "type": "zendesk",
                "name": "Get High Priority Tickets",
                "config": {
                    "connector": "zendesk",
                    "priority_filter": "high",
                    "status_filter": "open",
                    "max_results": 15
                },
                "position": {"x": 100, "y": 150}
            },
            {
                "id": "jira_agent_1",
                "type": "jira",
                "name": "Create Jira Issues",
                "config": {
                    "connector": "jira",
                    "action": "create_issue",
                    "project_key": "SUP",
                    "issue_type": "Bug"
                },
                "position": {"x": 450, "y": 150}
            }
        ],
        "edges": [
            {
                "source": "zendesk_agent_1",
                "target": "jira_agent_1"
            }
        ],
        "sample_input": "Find high-priority open Zendesk tickets and create Jira bugs"
    },
    {
        "id": "example_marketing_campaign",
        "name": "Marketing Campaign Workflow",
        "description": "Find leads from HubSpot, send emails, and notify team on Slack",
        "category": "marketing",
        "icon": "📢",
        "agents": [
            {
                "id": "hubspot_agent_1",
                "type": "hubspot",
                "name": "Get Recent Leads",
                "config": {
                    "connector": "hubspot",
                    "object_type": "contacts",
                    "lead_status_filter": "new",
                    "max_results": 20
                },
                "position": {"x": 100, "y": 100}
            },
            {
                "id": "email_agent_2",
                "type": "email_outreach",
                "name": "Send Welcome Emails",
                "config": {
                    "connector": "outlook",
                    "email_template": "follow_up",
                    "use_rag": False,
                    "include_greeting": True,
                    "max_emails": 20
                },
                "position": {"x": 450, "y": 100}
            },
            {
                "id": "slack_agent_2",
                "type": "slack",
                "name": "Notify Marketing Team",
                "config": {
                    "connector": "slack",
                    "channel": "#marketing",
                    "message_format": "detailed",
                    "include_mentions": True
                },
                "position": {"x": 450, "y": 250}
            }
        ],
        "edges": [
            {
                "source": "hubspot_agent_1",
                "target": "email_agent_2"
            },
            {
                "source": "hubspot_agent_1",
                "target": "slack_agent_2"
            }
        ],
        "sample_input": "Find new leads from HubSpot, send welcome emails, and notify marketing team on Slack"
    },
    {
        "id": "example_sap_finance",
        "name": "Finance Reporting Pipeline",
        "description": "Pull SAP purchase orders and send summary email",
        "category": "finance",
        "icon": "💰",
        "agents": [
            {
                "id": "sap_agent_1",
                "type": "sap",
                "name": "Get Purchase Orders",
                "config": {
                    "connector": "sap",
                    "object_type": "purchase_order",
                    "status_filter": "approved",
                    "date_range": "this_month"
                },
                "position": {"x": 100, "y": 150}
            },
            {
                "id": "email_agent_3",
                "type": "email_outreach",
                "name": "Send Finance Report",
                "config": {
                    "connector": "outlook",
                    "email_template": "proposal",
                    "use_rag": False,
                    "include_greeting": True,
                    "max_emails": 5
                },
                "position": {"x": 450, "y": 150}
            }
        ],
        "edges": [
            {
                "source": "sap_agent_1",
                "target": "email_agent_3"
            }
        ],
        "sample_input": "Get approved purchase orders from SAP this month and send summary email"
    }
]


def get_example_workflows():
    """Get all example workflows."""
    return EXAMPLE_WORKFLOWS


def get_example_workflow(example_id):
    """Get specific example workflow by ID."""
    for workflow in EXAMPLE_WORKFLOWS:
        if workflow["id"] == example_id:
            return workflow
    return None
