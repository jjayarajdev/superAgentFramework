"""
Create 5 sample workflows with logical business use cases.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database.session import SessionLocal
from database.models import WorkflowDB, User
from datetime import datetime
import uuid

def create_sample_workflows():
    """Create 5 logical workflow examples."""
    db = SessionLocal()

    try:
        # Get the first user (admin) to assign workflows
        admin_user = db.query(User).filter(User.email == "admin@acme.com").first()

        if not admin_user:
            print("❌ Admin user not found. Please run init_db.py first.")
            return

        workflows = [
            {
                "id": f"wf_{uuid.uuid4().hex[:8]}",
                "name": "Lead Qualification & Enrichment",
                "description": "Automatically qualify incoming leads, enrich with company data from Clearbit, score them, and sync qualified leads to Salesforce with personalized notes.",
                "category": "Sales",
                "tags": ["sales", "automation", "crm"],
                "icon": "🎯",
                "agents": [
                    {
                        "id": "agent_1",
                        "type": "webhook_trigger",
                        "name": "New Lead Webhook",
                        "position": {"x": 100, "y": 100},
                        "config": {"webhook_url": "/webhooks/new-lead"}
                    },
                    {
                        "id": "agent_2",
                        "type": "clearbit_enrichment",
                        "name": "Enrich Company Data",
                        "position": {"x": 300, "y": 100},
                        "config": {"api_key": "${CLEARBIT_API_KEY}"}
                    },
                    {
                        "id": "agent_3",
                        "type": "lead_scorer",
                        "name": "Score Lead",
                        "position": {"x": 500, "y": 100},
                        "config": {
                            "criteria": {
                                "company_size": 10,
                                "industry": 15,
                                "budget": 20
                            }
                        }
                    },
                    {
                        "id": "agent_4",
                        "type": "salesforce",
                        "name": "Create Salesforce Lead",
                        "position": {"x": 700, "y": 100},
                        "config": {"instance_url": "${SALESFORCE_URL}"}
                    },
                    {
                        "id": "agent_5",
                        "type": "slack",
                        "name": "Notify Sales Team",
                        "position": {"x": 900, "y": 100},
                        "config": {"channel": "#sales-leads"}
                    }
                ],
                "edges": [
                    {"source": "agent_1", "target": "agent_2"},
                    {"source": "agent_2", "target": "agent_3"},
                    {"source": "agent_3", "target": "agent_4"},
                    {"source": "agent_4", "target": "agent_5"}
                ]
            },
            {
                "id": f"wf_{uuid.uuid4().hex[:8]}",
                "name": "Employee Onboarding Automation",
                "description": "Complete onboarding workflow that provisions accounts across multiple systems (Slack, Gmail, Jira), creates HR records in Darwinbox, and sends welcome materials.",
                "category": "HR",
                "tags": ["hr", "onboarding", "automation"],
                "icon": "👋",
                "agents": [
                    {
                        "id": "agent_1",
                        "type": "darwinbox_hr",
                        "name": "Create HR Record",
                        "position": {"x": 100, "y": 100},
                        "config": {"action": "create_employee"}
                    },
                    {
                        "id": "agent_2",
                        "type": "slack",
                        "name": "Create Slack Account",
                        "position": {"x": 300, "y": 50},
                        "config": {"action": "create_user"}
                    },
                    {
                        "id": "agent_3",
                        "type": "google_workspace",
                        "name": "Create Gmail Account",
                        "position": {"x": 300, "y": 150},
                        "config": {"action": "create_user"}
                    },
                    {
                        "id": "agent_4",
                        "type": "jira",
                        "name": "Create Jira Account",
                        "position": {"x": 500, "y": 100},
                        "config": {"action": "create_user"}
                    },
                    {
                        "id": "agent_5",
                        "type": "sendgrid",
                        "name": "Send Welcome Email",
                        "position": {"x": 700, "y": 100},
                        "config": {"template": "welcome_onboarding"}
                    }
                ],
                "edges": [
                    {"source": "agent_1", "target": "agent_2"},
                    {"source": "agent_1", "target": "agent_3"},
                    {"source": "agent_2", "target": "agent_4"},
                    {"source": "agent_3", "target": "agent_4"},
                    {"source": "agent_4", "target": "agent_5"}
                ]
            },
            {
                "id": f"wf_{uuid.uuid4().hex[:8]}",
                "name": "Customer Support Ticket Triage",
                "description": "Automatically categorize and route incoming support tickets, analyze sentiment, check knowledge base for solutions, and escalate urgent issues to appropriate teams.",
                "category": "Support",
                "tags": ["support", "automation", "ai"],
                "icon": "🎧",
                "agents": [
                    {
                        "id": "agent_1",
                        "type": "zendesk_trigger",
                        "name": "New Ticket Received",
                        "position": {"x": 100, "y": 100},
                        "config": {"webhook": True}
                    },
                    {
                        "id": "agent_2",
                        "type": "ai_classifier",
                        "name": "Categorize Ticket",
                        "position": {"x": 300, "y": 100},
                        "config": {
                            "model": "gpt-4",
                            "categories": ["billing", "technical", "feature_request", "bug"]
                        }
                    },
                    {
                        "id": "agent_3",
                        "type": "sentiment_analyzer",
                        "name": "Analyze Sentiment",
                        "position": {"x": 500, "y": 100},
                        "config": {"threshold": 0.3}
                    },
                    {
                        "id": "agent_4",
                        "type": "rag_search",
                        "name": "Search Knowledge Base",
                        "position": {"x": 700, "y": 100},
                        "config": {"collection": "support_docs"}
                    },
                    {
                        "id": "agent_5",
                        "type": "zendesk_update",
                        "name": "Update & Route Ticket",
                        "position": {"x": 900, "y": 100},
                        "config": {"auto_assign": True}
                    }
                ],
                "edges": [
                    {"source": "agent_1", "target": "agent_2"},
                    {"source": "agent_2", "target": "agent_3"},
                    {"source": "agent_3", "target": "agent_4"},
                    {"source": "agent_4", "target": "agent_5"}
                ]
            },
            {
                "id": f"wf_{uuid.uuid4().hex[:8]}",
                "name": "Monthly Sales Report Generation",
                "description": "Pull sales data from Salesforce, analyze performance metrics, generate visualizations, create executive summary with AI, and distribute report to stakeholders via email and Slack.",
                "category": "Analytics",
                "tags": ["reporting", "sales", "analytics"],
                "icon": "📊",
                "agents": [
                    {
                        "id": "agent_1",
                        "type": "scheduler_trigger",
                        "name": "Monthly Trigger",
                        "position": {"x": 100, "y": 100},
                        "config": {"cron": "0 0 1 * *"}
                    },
                    {
                        "id": "agent_2",
                        "type": "salesforce",
                        "name": "Fetch Sales Data",
                        "position": {"x": 300, "y": 100},
                        "config": {"query": "SELECT * FROM Opportunity WHERE CloseDate >= LAST_MONTH"}
                    },
                    {
                        "id": "agent_3",
                        "type": "data_analyzer",
                        "name": "Analyze Metrics",
                        "position": {"x": 500, "y": 100},
                        "config": {"metrics": ["revenue", "win_rate", "pipeline"]}
                    },
                    {
                        "id": "agent_4",
                        "type": "ai_summarizer",
                        "name": "Generate Summary",
                        "position": {"x": 700, "y": 100},
                        "config": {"model": "gpt-4", "style": "executive"}
                    },
                    {
                        "id": "agent_5",
                        "type": "sendgrid",
                        "name": "Email Report",
                        "position": {"x": 900, "y": 50},
                        "config": {"to": ["executives@acme.com"]}
                    },
                    {
                        "id": "agent_6",
                        "type": "slack",
                        "name": "Post to Slack",
                        "position": {"x": 900, "y": 150},
                        "config": {"channel": "#sales-updates"}
                    }
                ],
                "edges": [
                    {"source": "agent_1", "target": "agent_2"},
                    {"source": "agent_2", "target": "agent_3"},
                    {"source": "agent_3", "target": "agent_4"},
                    {"source": "agent_4", "target": "agent_5"},
                    {"source": "agent_4", "target": "agent_6"}
                ]
            },
            {
                "id": f"wf_{uuid.uuid4().hex[:8]}",
                "name": "Invoice Processing & Payment",
                "description": "Extract data from invoice PDFs using OCR, validate against purchase orders, detect anomalies, route for approval, and trigger payment via accounting system.",
                "category": "Finance",
                "tags": ["finance", "automation", "ocr"],
                "icon": "💰",
                "agents": [
                    {
                        "id": "agent_1",
                        "type": "email_trigger",
                        "name": "Invoice Email Received",
                        "position": {"x": 100, "y": 100},
                        "config": {"folder": "invoices"}
                    },
                    {
                        "id": "agent_2",
                        "type": "ocr_extractor",
                        "name": "Extract Invoice Data",
                        "position": {"x": 300, "y": 100},
                        "config": {"service": "aws_textract"}
                    },
                    {
                        "id": "agent_3",
                        "type": "po_validator",
                        "name": "Validate Against PO",
                        "position": {"x": 500, "y": 100},
                        "config": {"tolerance": 0.05}
                    },
                    {
                        "id": "agent_4",
                        "type": "anomaly_detector",
                        "name": "Detect Anomalies",
                        "position": {"x": 700, "y": 100},
                        "config": {"ml_model": "fraud_detection_v2"}
                    },
                    {
                        "id": "agent_5",
                        "type": "approval_router",
                        "name": "Route for Approval",
                        "position": {"x": 900, "y": 100},
                        "config": {"approval_threshold": 10000}
                    },
                    {
                        "id": "agent_6",
                        "type": "quickbooks",
                        "name": "Process Payment",
                        "position": {"x": 1100, "y": 100},
                        "config": {"auto_pay": True}
                    }
                ],
                "edges": [
                    {"source": "agent_1", "target": "agent_2"},
                    {"source": "agent_2", "target": "agent_3"},
                    {"source": "agent_3", "target": "agent_4"},
                    {"source": "agent_4", "target": "agent_5"},
                    {"source": "agent_5", "target": "agent_6"}
                ]
            }
        ]

        # Insert workflows
        created_count = 0
        for wf_data in workflows:
            # Check if workflow already exists
            existing = db.query(WorkflowDB).filter(WorkflowDB.name == wf_data["name"]).first()
            if existing:
                print(f"⏭️  Skipping '{wf_data['name']}' - already exists")
                continue

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
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            db.add(workflow)
            created_count += 1
            print(f"✅ Created workflow: {wf_data['name']} ({wf_data['id']})")

        db.commit()
        print(f"\n🎉 Successfully created {created_count} sample workflows!")

        # Display summary
        print("\n" + "="*80)
        print("WORKFLOW SUMMARY")
        print("="*80)

        all_workflows = db.query(WorkflowDB).filter(
            WorkflowDB.org_id == admin_user.org_id
        ).order_by(WorkflowDB.created_at.desc()).all()

        for wf in all_workflows:
            print(f"\n{wf.icon or '📋'} {wf.name}")
            print(f"   ID: {wf.id}")
            print(f"   Category: {wf.category or 'N/A'}")
            print(f"   Agents: {len(wf.agents)}")
            print(f"   Description: {wf.description[:100]}...")
            print(f"   Created: {wf.created_at}")

        print("\n" + "="*80)
        print(f"Total workflows in database: {len(all_workflows)}")
        print("="*80)

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Creating sample workflows...\n")
    create_sample_workflows()
