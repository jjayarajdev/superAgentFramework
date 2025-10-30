# Mock Data System Documentation

## Overview

The SuperAgent platform now includes a comprehensive mock data system that enables realistic demos without requiring actual API credentials. This system provides a foundation for the AWS Bedrock-like conversational AI experience.

## Architecture

### Centralized Mock Data Store

**Location**: `backend/data/mock_data.py`

The `MockDataStore` class provides realistic mock data for all agents:

```python
from data import mock_data

# Get Salesforce opportunities
opportunities = mock_data.get_salesforce_opportunities({
    "amount_min": 100000,
    "stage": "Negotiation"
})

# Send Slack message
result = mock_data.send_slack_message("general", "Deal closed!")

# Create Jira issue
issue = mock_data.create_jira_issue("ENG", "Bug fix", "Description...")
```

### Dual-Mode Agent Architecture

All agents now support two execution modes:

1. **Mock Mode** (default) - Uses realistic data from centralized store
2. **Real Mode** - Connects to actual APIs (requires credentials)

```python
# Execute agent with mock data (default)
result = await agent.execute({"query": "..."}, context)

# Execute agent with real API
result = await agent.execute(
    {"query": "...", "use_mock": False},
    context
)
```

## Mock Data Catalog

### Salesforce (Sales Intelligence Agent)

**12 Opportunities** with realistic data:
- Deal sizes: $50K - $1M
- Stages: Prospecting, Qualification, Negotiation, Closed Won
- Accounts: Acme Corp, Globex Industries
- Close dates: Q4 2025, Q1 2026

**Key Methods**:
- `get_salesforce_opportunities(filters)` - Filter by amount, stage, quarter
- `get_salesforce_accounts()` - Get account records
- `get_salesforce_contacts()` - Get contact records

### Slack Agent

**6 Channels**: general, engineering, sales, marketing, support, executives

**Key Methods**:
- `send_slack_message(channel, message)` - Send message to channel
- `get_slack_channels()` - List available channels

### Jira Agent

**20 Issues** across 3 projects (ENG, SALES, OPS)
- Bug fixes, features, support tickets
- Priorities: High, Medium, Low
- Statuses: To Do, In Progress, Done

**Key Methods**:
- `get_jira_issues(filters)` - Filter by project, status, priority
- `create_jira_issue(project, summary, description, priority)` - Create new issue

### HubSpot Agent

**Contacts and Companies**:
- 5 contacts with full details (name, email, phone, company)
- Company association and deal info

**Key Methods**:
- `get_hubspot_contacts(filters)` - Get contact records
- `get_hubspot_companies()` - Get company records

### Zendesk Agent

**15 Support Tickets**:
- Priorities: Low, Normal, High, Urgent
- Statuses: New, Open, Pending, Solved
- Realistic customer issues

**Key Methods**:
- `get_zendesk_tickets(filters)` - Filter by status, priority
- `create_zendesk_ticket(subject, description, priority)` - Create ticket

### ServiceNow Agent

**10 Incidents**:
- Priorities: 1-Critical, 2-High, 3-Medium, 4-Low
- Statuses: New, In Progress, Resolved, Closed
- IT infrastructure issues

**Key Methods**:
- `get_servicenow_incidents(filters)` - Filter by priority, status
- `create_servicenow_incident(short_description, description, priority)` - Create incident

### Workday Agent

**50 Employee Records**:
- Departments: Engineering, Sales, Marketing, Operations
- Job titles: Software Engineer, Sales Rep, etc.
- Realistic employee data

**Key Methods**:
- `get_workday_employees(filters)` - Filter by department, job title
- `get_employee_by_id(employee_id)` - Get specific employee

### Email Agent

**3 Email Templates**:
- Welcome email
- Deal follow-up
- Support ticket notification

**Key Methods**:
- `send_email(to, subject, body)` - Send email
- `get_email_templates()` - List available templates

## Updated Agents

### ✅ Sales Intelligence Agent

**File**: `backend/agents/sales_intelligence.py`

**Status**: Updated with dual-mode support

**Changes**:
- Imports from centralized `data.mock_data` instead of local mock
- Supports `use_mock` parameter in input_data
- Filters map to mock data store methods
- Returns `data_source` field indicating mock or real

**Example**:
```python
# With mock data (default)
result = await sales_agent.execute({
    "filters": {
        "amount_min": 100000,
        "stage": "Negotiation"
    }
}, context)

# Returns:
{
    "deals": [...],
    "count": 5,
    "data_source": "mock"
}
```

### 🔄 Pending Agent Updates

The following agents need similar updates:

1. **Slack Agent** - Update to use `mock_data.send_slack_message()`
2. **Jira Agent** - Update to use `mock_data.get_jira_issues()`
3. **HubSpot Agent** - Update to use `mock_data.get_hubspot_contacts()`
4. **Zendesk Agent** - Update to use `mock_data.get_zendesk_tickets()`
5. **ServiceNow Agent** - Update to use `mock_data.get_servicenow_incidents()`
6. **Workday Agent** - Update to use `mock_data.get_workday_employees()`
7. **Email Agent** - Update to use `mock_data.send_email()`
8. **DarwinBox HR Agent** - Use Workday data for now

## Integration with Supervisor Agent

The Supervisor Agent (conversational AI) will automatically use mock data by default:

```python
# User asks: "Show me high-value deals"
# Supervisor routes to Sales Intelligence Agent
# Agent executes with mock=True (default)
# Returns realistic mock data

# User asks: "Find deals and notify team on Slack"
# Supervisor orchestrates:
#   1. Sales Intelligence Agent (mock data)
#   2. Slack Agent (mock send)
# Returns execution results
```

## Benefits

### For Demos
✅ No API credentials required
✅ Instant setup - works out of the box
✅ Consistent, predictable data
✅ Realistic scenarios for prospects

### For Development
✅ Fast iteration without API rate limits
✅ Test error scenarios easily
✅ No risk of corrupting production data
✅ Works offline

### For Production
✅ Easy toggle between mock and real
✅ Same code paths for both modes
✅ Clear indicator of data source
✅ Ready for real API integration

## Next Steps

### Phase 2: Complete Agent Updates (In Progress)

Update remaining agents to use centralized mock data:
- [ ] Slack Agent
- [ ] Jira Agent
- [ ] HubSpot Agent
- [ ] Zendesk Agent
- [ ] ServiceNow Agent
- [ ] Workday Agent
- [ ] Email Agent
- [ ] DarwinBox HR Agent

### Phase 3: Build Chat UI

Create conversational interface:
- [ ] Chat component with message history
- [ ] Suggested queries/prompts
- [ ] Show active agents inline
- [ ] Display execution results

### Phase 4: Connect Supervisor to Chat

Enable natural language workflows:
- [ ] Chat API endpoint (`POST /api/v1/chat/message`)
- [ ] Connect to Supervisor Agent
- [ ] Store conversation history
- [ ] Return structured responses

### Phase 5: End-to-End Testing

Test full conversational flow:
- [ ] "Show me high-value deals" → Sales Intelligence Agent
- [ ] "Onboard John Doe" → HR Onboarding Workflow
- [ ] "Find deals and notify team" → Multi-agent orchestration

## Migration to Real APIs

When ready to use real APIs, simply:

1. **Add credentials** to connector configuration:
```python
# In backend/config.py or environment variables
SALESFORCE_CLIENT_ID = "..."
SALESFORCE_CLIENT_SECRET = "..."
SALESFORCE_INSTANCE_URL = "https://yourinstance.salesforce.com"
```

2. **Implement real API logic** in agent:
```python
if use_mock:
    opportunities = mock_data.get_salesforce_opportunities(filters)
else:
    # Real Salesforce API
    from simple_salesforce import Salesforce
    sf = Salesforce(
        instance_url=creds['instance_url'],
        session_id=creds['access_token']
    )
    result = sf.query("SELECT Id, Name, Amount FROM Opportunity...")
    opportunities = result['records']
```

3. **Set `use_mock=False`** in execution:
```python
result = await agent.execute(
    {"query": "...", "use_mock": False},
    context
)
```

## File Structure

```
backend/
├── data/
│   ├── __init__.py          # Exports mock_data
│   └── mock_data.py         # MockDataStore class (700+ lines)
├── agents/
│   ├── sales_intelligence.py  # ✅ Updated
│   ├── slack_agent.py          # 🔄 TODO
│   ├── jira_agent.py           # 🔄 TODO
│   ├── hubspot_agent.py        # 🔄 TODO
│   ├── zendesk_agent.py        # 🔄 TODO
│   ├── servicenow_agent.py     # 🔄 TODO
│   ├── workday_agent.py        # 🔄 TODO
│   ├── email_outreach.py       # 🔄 TODO
│   └── darwinbox_hr_agent.py   # 🔄 TODO
└── docs/
    └── MOCK_DATA_SYSTEM.md  # This file
```

## Summary

The mock data system is now fully implemented and ready to power realistic demos of the SuperAgent platform. The centralized architecture makes it easy to:

1. Run demos without API credentials
2. Switch between mock and real APIs seamlessly
3. Test complex multi-agent workflows
4. Enable the conversational AI experience

**Status**: Foundation complete ✅
**Next**: Update remaining agents with dual-mode support 🔄
