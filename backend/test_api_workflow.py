"""
Test workflow execution via API to verify mock data integration.
"""
import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def login():
    """Login and get access token."""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "admin@acme.com",
            "password": "admin123"
        }
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def get_workflows(token):
    """Get list of workflows."""
    response = requests.get(
        f"{BASE_URL}/workflows/",
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Get workflows failed: {response.text}")
        return []

def execute_workflow(workflow_id, token):
    """Execute a workflow."""
    response = requests.post(
        f"{BASE_URL}/executions/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "workflow_id": workflow_id,
            "input_data": {}
        }
    )
    if response.status_code in [200, 201]:
        return response.json()
    else:
        print(f"❌ Execute workflow failed: {response.text}")
        return None

def get_execution(execution_id, token):
    """Get execution details."""
    response = requests.get(
        f"{BASE_URL}/executions/{execution_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Get execution failed: {response.text}")
        return None

def main():
    print("=" * 70)
    print("🧪 Testing Workflow Execution with Mock Data (via API)")
    print("=" * 70)

    # Login
    print("\n🔐 Logging in...")
    token = login()
    if not token:
        return

    print("✅ Logged in successfully")

    # Get workflows
    print("\n📋 Fetching workflows...")
    workflows = get_workflows(token)

    if not workflows:
        print("❌ No workflows found")
        return

    print(f"✅ Found {len(workflows)} workflows:")
    for i, wf in enumerate(workflows[:5], 1):
        print(f"   {i}. {wf['name']} (ID: {wf['id']})")

    # Find Sales Lead Management workflow
    sales_wf = next((wf for wf in workflows if "Sales Lead" in wf['name']), None)

    if not sales_wf:
        print("\n⚠️  Sales Lead Management workflow not found, using first workflow")
        sales_wf = workflows[0]

    print(f"\n🎯 Testing workflow: {sales_wf['name']}")
    print(f"   ID: {sales_wf['id']}")
    print(f"   Agents: {len(sales_wf.get('agents', []))}")

    # Show agents
    for i, agent in enumerate(sales_wf.get('agents', []), 1):
        print(f"   {i}. {agent.get('name', 'Unknown')} ({agent.get('type', 'unknown')})")

    # Execute workflow
    print("\n🚀 Executing workflow...")
    execution = execute_workflow(sales_wf['id'], token)

    if not execution:
        return

    execution_id = execution.get('id')
    print(f"✅ Execution started: {execution_id}")

    # Wait for completion
    print("\n⏳ Waiting for execution to complete...")
    max_wait = 30
    waited = 0

    while waited < max_wait:
        time.sleep(2)
        waited += 2

        details = get_execution(execution_id, token)
        if not details:
            print("❌ Failed to get execution details")
            break

        status = details.get('status', 'unknown')
        print(f"   Status: {status} ({waited}s)")

        if status in ['completed', 'failed']:
            break

    # Get final results
    print("\n📊 Execution Results:")
    final_details = get_execution(execution_id, token)

    if not final_details:
        return

    print(f"   Status: {final_details.get('status')}")
    print(f"   Duration: {final_details.get('duration_seconds', 0):.2f}s")

    # Show agent results
    agent_results = final_details.get('agent_results', [])
    print(f"\n🤖 Agent Executions ({len(agent_results)} agents):")

    for i, result in enumerate(agent_results, 1):
        agent_name = result.get('agent_name', 'Unknown')
        success = result.get('success', False)
        status_icon = "✅" if success else "❌"

        print(f"\n   {status_icon} {i}. {agent_name}")

        if success:
            output = result.get('output', {})
            data_source = output.get('data_source', 'unknown')
            print(f"      📦 Data source: {data_source}")

            # Show specific outputs
            if 'count' in output:
                print(f"      📊 Count: {output['count']}")
            if 'deals' in output:
                deals = output.get('deals', [])
                print(f"      💼 Deals: {len(deals)}")
                if deals:
                    print(f"         First deal: {deals[0].get('Name', 'N/A')} - ${deals[0].get('Amount', 0):,}")
            if 'emails_sent' in output:
                print(f"      📧 Emails sent: {output['emails_sent']}")
            if 'message' in output and isinstance(output['message'], dict):
                print(f"      💬 Message ID: {output['message'].get('message_id', 'N/A')}")
        else:
            error = result.get('error', 'Unknown error')
            print(f"      ❌ Error: {error}")

    # Final output
    if final_details.get('output'):
        print(f"\n📤 Final Workflow Output:")
        print(f"   {json.dumps(final_details['output'], indent=2)[:500]}")

    print("\n" + "=" * 70)
    if final_details.get('status') == 'completed':
        print("🎉 Test PASSED - Workflow executed successfully with mock data!")
    else:
        print("⚠️  Test completed but workflow may have encountered issues")
    print("=" * 70)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
