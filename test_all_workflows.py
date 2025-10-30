#!/usr/bin/env python3
"""
Test All Workflows - SuperAgent Framework
Tests each workflow to ensure they execute without errors.
"""

import requests
import time
import sys

API_BASE = "http://localhost:8000/api/v1"

# Login credentials
LOGIN_DATA = {
    "username": "admin@acme.com",
    "password": "admin123"
}

def get_auth_token():
    """Get authentication token."""
    resp = requests.post(f"{API_BASE}/auth/login", data=LOGIN_DATA)
    if resp.status_code == 200:
        return resp.json()["access_token"]
    else:
        print(f"❌ Login failed: {resp.status_code}")
        print(resp.text)
        sys.exit(1)

def get_workflows(token):
    """Get all workflows."""
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{API_BASE}/workflows/", headers=headers)
    if resp.status_code == 200:
        return resp.json()
    else:
        print(f"❌ Failed to get workflows: {resp.status_code}")
        return []

def execute_workflow(workflow_id, token):
    """Execute a workflow and return the result."""
    headers = {"Authorization": f"Bearer {token}"}
    data = {"workflow_id": workflow_id, "input": "Test execution"}

    resp = requests.post(
        f"{API_BASE}/executions/",
        headers=headers,
        json=data
    )

    return resp

def check_execution_status(execution_id, token):
    """Check execution status."""
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{API_BASE}/executions/{execution_id}", headers=headers)
    if resp.status_code == 200:
        return resp.json()
    return None

def main():
    print("=" * 70)
    print("🔍 Testing All Workflows - SuperAgent Framework")
    print("=" * 70)
    print()

    # Get auth token
    print("🔑 Authenticating...")
    token = get_auth_token()
    print("✅ Authenticated successfully")
    print()

    # Get all workflows
    print("📋 Fetching workflows...")
    workflows = get_workflows(token)
    print(f"✅ Found {len(workflows)} workflow(s)")
    print()

    if not workflows:
        print("⚠️  No workflows found in database")
        return

    # Test each workflow
    results = []
    for i, workflow in enumerate(workflows, 1):
        wf_id = workflow["id"]
        wf_name = workflow["name"]
        agent_count = len(workflow.get("agents", []))
        category = workflow.get("category", "uncategorized")

        print(f"[{i}/{len(workflows)}] Testing: {wf_name}")
        print(f"    ID: {wf_id}")
        print(f"    Category: {category}")
        print(f"    Agents: {agent_count}")

        # Execute workflow
        resp = execute_workflow(wf_id, token)

        if resp.status_code == 200:
            exec_data = resp.json()
            exec_id = exec_data.get("id") or exec_data.get("execution_id")
            status = exec_data.get("status", "unknown")

            print(f"    Execution ID: {exec_id}")
            print(f"    Status: {status}")

            # Wait a bit and check final status
            time.sleep(1)
            final_status = check_execution_status(exec_id, token)

            if final_status:
                final_state = final_status.get("status", "unknown")
                error = final_status.get("error")

                # Handle both COMPLETED and completed (case insensitive)
                if str(final_state).upper() == "COMPLETED":
                    print(f"    ✅ PASSED - Completed successfully")
                    results.append((wf_name, "PASSED", None))
                elif str(final_state).upper() == "FAILED":
                    print(f"    ❌ FAILED - {error}")
                    results.append((wf_name, "FAILED", error))
                else:
                    print(f"    ⏳ {final_state}")
                    results.append((wf_name, final_state, None))
            else:
                print(f"    ⚠️  Could not get execution status")
                results.append((wf_name, "UNKNOWN", "Could not get status"))
        else:
            error_msg = resp.text[:100]
            print(f"    ❌ FAILED - HTTP {resp.status_code}")
            print(f"    Error: {error_msg}")
            results.append((wf_name, "FAILED", f"HTTP {resp.status_code}: {error_msg}"))

        print()

    # Summary
    print("=" * 70)
    print("📊 Test Summary")
    print("=" * 70)
    print()

    passed = sum(1 for _, status, _ in results if status == "PASSED")
    failed = sum(1 for _, status, _ in results if status == "FAILED")
    other = len(results) - passed - failed

    print(f"Total: {len(results)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"⏳ Other: {other}")
    print()

    if failed > 0:
        print("Failed workflows:")
        for name, status, error in results:
            if status == "FAILED":
                print(f"  • {name}")
                if error:
                    print(f"    Error: {error[:80]}")

    print()
    print("=" * 70)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
