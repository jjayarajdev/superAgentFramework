"""
Database initialization script.
Creates tables and seeds demo data for testing.
"""
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from database.session import engine, SessionLocal, init_db
from database.models import (
    Organization, Team, User, WorkflowDB, ExecutionDB,
    BillingPlan, UserRole, WorkflowStatus
)
from auth.password import hash_password
from datetime import datetime, timedelta
import json


def seed_demo_data():
    """Seed database with demo data for testing."""
    db = SessionLocal()

    try:
        print("🌱 Seeding demo data...")

        # ============================================================================
        # 1. CREATE DEMO ORGANIZATION
        # ============================================================================
        org = Organization(
            id="org_demo",
            name="Acme Corporation",
            slug="acme-corp",
            billing_plan=BillingPlan.ENTERPRISE,
            billing_email="billing@acme.com",
            max_workflows=100,
            max_agents=200,
            max_executions_per_month=10000,
            max_teams=10,
            settings={"timezone": "America/New_York"}
        )
        db.add(org)
        db.flush()

        print(f"  ✅ Created organization: {org.name} ({org.id})")

        # ============================================================================
        # 2. CREATE DEMO TEAMS
        # ============================================================================
        teams = [
            Team(
                id="team_sales",
                org_id=org.id,
                name="Sales Team",
                description="Sales automation and intelligence"
            ),
            Team(
                id="team_eng",
                org_id=org.id,
                name="Engineering Team",
                description="Technical workflows and automation"
            ),
            Team(
                id="team_ops",
                org_id=org.id,
                name="Operations Team",
                description="Operations and support workflows"
            ),
        ]

        for team in teams:
            db.add(team)
        db.flush()

        print(f"  ✅ Created {len(teams)} teams")

        # ============================================================================
        # 3. CREATE DEMO USERS
        # ============================================================================
        users = [
            User(
                id="user_admin",
                org_id=org.id,
                team_id="team_eng",
                email="admin@acme.com",
                username="admin",
                full_name="Admin User",
                hashed_password=hash_password("admin123"),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True
            ),
            User(
                id="user_dev",
                org_id=org.id,
                team_id="team_eng",
                email="dev@acme.com",
                username="developer",
                full_name="Developer User",
                hashed_password=hash_password("dev123"),
                role=UserRole.DEVELOPER,
                is_active=True,
                is_verified=True
            ),
            User(
                id="user_operator",
                org_id=org.id,
                team_id="team_ops",
                email="ops@acme.com",
                username="operator",
                full_name="Operations User",
                hashed_password=hash_password("ops123"),
                role=UserRole.OPERATOR,
                is_active=True,
                is_verified=True
            ),
            User(
                id="user_sales",
                org_id=org.id,
                team_id="team_sales",
                email="sales@acme.com",
                username="sales",
                full_name="Sales User",
                hashed_password=hash_password("sales123"),
                role=UserRole.DEVELOPER,
                is_active=True,
                is_verified=True
            ),
        ]

        for user in users:
            db.add(user)
        db.flush()

        print(f"  ✅ Created {len(users)} users")
        print("\n📝 Demo User Credentials:")
        print("  - admin@acme.com / admin123 (Admin)")
        print("  - dev@acme.com / dev123 (Developer)")
        print("  - ops@acme.com / ops123 (Operator)")
        print("  - sales@acme.com / sales123 (Sales Developer)")

        # ============================================================================
        # 4. CREATE DEMO WORKFLOWS
        # ============================================================================
        workflows = [
            WorkflowDB(
                id="wf_demo_sales",
                org_id=org.id,
                team_id="team_sales",
                created_by="user_sales",
                name="Sales Outreach Pipeline",
                description="Find high-value deals and send personalized emails",
                agents=[
                    {
                        "id": "sales_agent_1",
                        "type": "sales_intelligence",
                        "name": "Find Q4 Deals",
                        "config": {
                            "connector": "sfdc",
                            "object_type": "Opportunity",
                            "amount_threshold": 100000,
                            "stage_filter": "Negotiation"
                        },
                        "position": {"x": 100, "y": 150}
                    },
                    {
                        "id": "email_agent_1",
                        "type": "email_outreach",
                        "name": "Send Follow-up Emails",
                        "config": {
                            "connector": "outlook",
                            "email_template": "check_in",
                            "use_rag": True
                        },
                        "position": {"x": 450, "y": 150}
                    }
                ],
                edges=[{"source": "sales_agent_1", "target": "email_agent_1"}],
                tags=["sales", "automation"],
                category="sales",
                icon="trending-up",
                is_published=True,
                environment="production",
                execution_count=25,
                success_count=23,
                failure_count=2
            ),
            WorkflowDB(
                id="wf_demo_hr",
                org_id=org.id,
                team_id="team_ops",
                created_by="user_operator",
                name="HR Employee Lookup",
                description="Find employee info and notify via Slack",
                agents=[
                    {
                        "id": "workday_agent_1",
                        "type": "workday",
                        "name": "Search Employees",
                        "config": {
                            "connector": "workday",
                            "object_type": "employees",
                            "department_filter": "Engineering"
                        },
                        "position": {"x": 100, "y": 150}
                    },
                    {
                        "id": "slack_agent_1",
                        "type": "slack",
                        "name": "Post to Slack",
                        "config": {
                            "connector": "slack",
                            "channel": "#engineering",
                            "action_type": "send"
                        },
                        "position": {"x": 450, "y": 150}
                    }
                ],
                edges=[{"source": "workday_agent_1", "target": "slack_agent_1"}],
                tags=["hr", "communication"],
                category="operations",
                icon="users",
                is_published=True,
                environment="production",
                execution_count=15,
                success_count=15,
                failure_count=0
            ),
        ]

        for workflow in workflows:
            db.add(workflow)
        db.flush()

        print(f"  ✅ Created {len(workflows)} workflows")

        # ============================================================================
        # 5. CREATE DEMO EXECUTIONS
        # ============================================================================
        executions = [
            ExecutionDB(
                id="exec_demo_1",
                workflow_id="wf_demo_sales",
                org_id=org.id,
                status=WorkflowStatus.COMPLETED,
                input_data="Find Q4 deals over $100K",
                output={"emails_sent": 15, "deals_found": 15},
                agent_results={
                    "sales_agent_1": {"deals": 15},
                    "email_agent_1": {"emails_sent": 15}
                },
                tokens_used=2500,
                cost=0.15,
                duration_seconds=12.5,
                created_at=datetime.utcnow() - timedelta(hours=2),
                started_at=datetime.utcnow() - timedelta(hours=2),
                completed_at=datetime.utcnow() - timedelta(hours=2, minutes=-1)
            ),
            ExecutionDB(
                id="exec_demo_2",
                workflow_id="wf_demo_hr",
                org_id=org.id,
                status=WorkflowStatus.COMPLETED,
                input_data="Find engineering employees",
                output={"employees_found": 25, "slack_sent": True},
                agent_results={
                    "workday_agent_1": {"employees": 25},
                    "slack_agent_1": {"message_id": "msg_123"}
                },
                tokens_used=1200,
                cost=0.08,
                duration_seconds=8.3,
                created_at=datetime.utcnow() - timedelta(hours=1),
                started_at=datetime.utcnow() - timedelta(hours=1),
                completed_at=datetime.utcnow() - timedelta(hours=1, minutes=-1)
            ),
        ]

        for execution in executions:
            db.add(execution)

        print(f"  ✅ Created {len(executions)} executions")

        # ============================================================================
        # COMMIT ALL CHANGES
        # ============================================================================
        db.commit()

        print("\n✅ Demo data seeded successfully!\n")

        print("🚀 You can now:")
        print("  1. Login with demo credentials")
        print("  2. View existing workflows")
        print("  3. Execute workflows")
        print("  4. Create new workflows")
        print("\n")

    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    """Initialize database and seed data."""
    print("🔧 Initializing Super Agent Framework database...\n")

    # Create all tables
    init_db()

    # Seed demo data
    seed_demo_data()

    print("✅ Database initialization complete!")


if __name__ == "__main__":
    main()
