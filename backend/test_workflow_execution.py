"""
Test script to execute a workflow and verify mock data integration.
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from database.session import get_db
from database.models import WorkflowDB
from routers.executions import execute_workflow_internal


async def test_workflow_execution():
    """Test executing the Sales Lead Management workflow."""

    print("=" * 60)
    print("🧪 Testing Workflow Execution with Mock Data")
    print("=" * 60)

    # Get database session
    db = next(get_db())

    # Find the Sales Lead Management workflow
    workflow = db.query(WorkflowDB).filter(
        WorkflowDB.name == "Sales Lead Management"
    ).first()

    if not workflow:
        print("❌ Workflow not found!")
        return

    print(f"\n📋 Found workflow: {workflow.name}")
    print(f"   ID: {workflow.id}")
    print(f"   Agents: {len(workflow.agents)}")

    # Show agents in workflow
    for i, agent in enumerate(workflow.agents, 1):
        print(f"   {i}. {agent['name']} ({agent['type']})")

    print("\n🚀 Executing workflow with mock data...")

    # Prepare execution context
    context = {
        "org_id": workflow.org_id,
        "user_id": workflow.created_by,
        "execution_mode": "test"
    }

    # Execute workflow
    try:
        result = await execute_workflow_internal(
            workflow_id=workflow.id,
            input_data={},  # Empty input - agents should use mock data
            context=context
        )

        print("\n✅ Workflow execution completed!")
        print(f"   Status: {result.get('status', 'unknown')}")
        print(f"   Duration: {result.get('duration_seconds', 0):.2f}s")

        # Show agent results
        agent_results = result.get('agent_results', [])
        print(f"\n📊 Agent Results ({len(agent_results)} agents):")

        for i, agent_result in enumerate(agent_results, 1):
            agent_name = agent_result.get('agent_name', 'Unknown')
            success = agent_result.get('success', False)
            status = "✅" if success else "❌"

            print(f"\n   {status} {i}. {agent_name}")

            if success:
                output = agent_result.get('output', {})
                data_source = output.get('data_source', 'unknown')
                print(f"      Data source: {data_source}")

                # Show specific output based on agent type
                if 'count' in output:
                    print(f"      Count: {output['count']}")
                if 'deals' in output:
                    print(f"      Deals: {len(output.get('deals', []))}")
                if 'emails_sent' in output:
                    print(f"      Emails sent: {output['emails_sent']}")
                if 'message' in output:
                    print(f"      Message: {output['message']}")
            else:
                error = agent_result.get('error', 'Unknown error')
                print(f"      Error: {error}")

        # Show output
        if result.get('output'):
            print(f"\n📤 Final Output:")
            print(f"   {result['output']}")

        print("\n" + "=" * 60)
        print("🎉 Test completed successfully!")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Execution failed: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_workflow_execution())
