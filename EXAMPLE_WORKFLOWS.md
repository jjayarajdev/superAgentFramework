# 📚 Example Workflows - Demo Ready!

**Status:** ✅ 5 pre-built example workflows ready for demos

---

## Overview

We've added 5 production-ready example workflows that showcase different use cases. Perfect for demos and getting started quickly!

### Access Examples

**In the UI:**
1. Navigate to Workflow Builder: http://localhost:3000/builder
2. Click **"📚 Load Example"** button in the top header
3. Browse the example gallery
4. Click an example to see details
5. Click **"⚡ Load This Example"** to instantly load it

**Via API:**
```bash
# List all examples
curl http://localhost:8000/api/v1/examples/

# Get specific example
curl http://localhost:8000/api/v1/examples/example_sales_outreach

# Instantiate as real workflow
curl -X POST http://localhost:8000/api/v1/examples/example_sales_outreach/instantiate
```

---

## The 5 Example Workflows

### 1. 📊 Sales Outreach Pipeline
**Category:** Sales
**Agents:** Sales Intelligence → Email Outreach

**What it does:**
- Finds high-value Q4 deals over $100K in Negotiation stage
- Sends personalized check-in emails with RAG context
- Limits to 10 emails max

**Sample Input:**
```
Find Q4 deals over $100K in Negotiation stage and send personalized check-in emails
```

**Configuration:**
- Sales Intelligence: SFDC connector, amount threshold $100K, Q4 filter
- Email Outreach: Check-in template, RAG enabled, max 10 emails

**Use Case:** Sales teams staying on top of high-value pipeline deals

---

### 2. 👥 HR Employee Lookup
**Category:** HR
**Agents:** Workday → Slack

**What it does:**
- Searches for employees in Engineering department
- Posts summary to #team-updates Slack channel
- Returns up to 20 employees

**Sample Input:**
```
Find all employees in Engineering department and post summary to Slack
```

**Configuration:**
- Workday: Darwinbox connector, department filter, 20 max results
- Slack: #team-updates channel, summary format

**Use Case:** HR reporting and team visibility

---

### 3. 🎧 Customer Support Ticket Analysis
**Category:** Support
**Agents:** Zendesk → Jira

**What it does:**
- Gets high-priority open tickets from Zendesk
- Creates Jira bug tickets for each
- Syncs support issues to engineering

**Sample Input:**
```
Find high-priority open Zendesk tickets and create Jira bugs
```

**Configuration:**
- Zendesk: High priority filter, open status, 15 max results
- Jira: SUP project, Bug issue type

**Use Case:** Automated escalation from support to engineering

---

### 4. 📢 Marketing Campaign Workflow
**Category:** Marketing
**Agents:** HubSpot → Email Outreach + Slack (parallel)

**What it does:**
- Finds new leads from HubSpot
- Sends welcome emails to each lead
- Notifies marketing team on Slack
- Demonstrates parallel agent execution (1 → 2 agents)

**Sample Input:**
```
Find new leads from HubSpot, send welcome emails, and notify marketing team on Slack
```

**Configuration:**
- HubSpot: Contacts object, new lead status, 20 max
- Email Outreach: Follow-up template, 20 max emails
- Slack: #marketing channel, detailed format, with mentions

**Use Case:** Automated lead nurturing and team notification

---

### 5. 💰 Finance Reporting Pipeline
**Category:** Finance
**Agents:** SAP → Email Outreach

**What it does:**
- Pulls approved purchase orders from SAP for current month
- Sends finance summary email to stakeholders

**Sample Input:**
```
Get approved purchase orders from SAP this month and send summary email
```

**Configuration:**
- SAP: Purchase order object, approved status, this month
- Email Outreach: Proposal template, 5 max emails

**Use Case:** Automated financial reporting

---

## How It Works

### Backend

**Example Definition:**
```python
{
    "id": "example_sales_outreach",
    "name": "Sales Outreach Pipeline",
    "description": "Find high-value deals and send personalized follow-up emails",
    "category": "sales",
    "icon": "📊",
    "agents": [ ... ],  # Pre-configured agents
    "edges": [ ... ],   # Connections
    "sample_input": "..." # Suggested user input
}
```

**API Endpoints:**
- `GET /api/v1/examples/` - List all examples
- `GET /api/v1/examples/{id}` - Get specific example
- `POST /api/v1/examples/{id}/instantiate` - Create workflow from example

**Instantiation:**
When you instantiate an example:
1. Backend creates a real workflow with unique ID
2. Copies all agents and their configurations
3. Returns workflow ID + sample input
4. Frontend loads it onto the canvas

### Frontend

**ExampleWorkflows Component:**
- Modal overlay with beautiful grid layout
- Click to preview details (agents, sample input)
- One-click loading
- Smooth animations

**Integration:**
- "📚 Load Example" button in Workflow Builder header
- Automatically fills canvas with nodes and edges
- Sets workflow name
- Stores workflow ID and sample input in localStorage
- Navigate to Execute page → auto-filled!

---

## Demo Script with Examples

### 5-Minute Demo Flow

**Minute 1: Show Examples**
```
"Let me show you our pre-built example workflows."

1. Click "Load Example" button
2. "We have 5 categories: Sales, HR, Support, Marketing, Finance"
3. Click on "Sales Outreach Pipeline"
4. "This finds high-value deals and sends personalized emails"
```

**Minute 2: Load Example**
```
5. Click "Load This Example"
6. "See how the workflow appears on the canvas instantly"
7. Point out: Sales Intelligence → Email Outreach connection
```

**Minute 3: Review Configuration**
```
8. Click on Sales Intelligence agent
9. "The agent is pre-configured: $100K threshold, Q4 filter"
10. Click on Email Outreach agent
11. "Check-in email template, RAG enabled for context"
```

**Minute 4: Execute**
```
12. "The workflow is already saved. Let's execute it."
13. Navigate to Execute page
14. "Notice the workflow ID and input are pre-filled!"
15. Click Execute
```

**Minute 5: Results**
```
16. Show execution results
17. Point out: 20 deals found, 10 emails sent (respects max_emails config)
18. Show timeline, metrics, output
19. "From zero to working workflow in under a minute!"
```

---

## Customizing Examples

### Adding New Examples

Edit `backend/data/example_workflows.py`:

```python
{
    "id": "example_your_workflow",
    "name": "Your Workflow Name",
    "description": "What it does",
    "category": "your_category",
    "icon": "🎯",
    "agents": [
        {
            "id": "agent_1",
            "type": "agent_type",  # Must match registered agent
            "name": "Agent Display Name",
            "config": { ... },  # Full config object
            "position": {"x": 100, "y": 150}
        }
    ],
    "edges": [
        {"source": "agent_1", "target": "agent_2"}
    ],
    "sample_input": "Natural language instruction"
}
```

**No restart needed!** The API reloads automatically with uvicorn --reload.

### Categories

Suggested categories for organizing examples:
- `sales` - Sales and CRM workflows
- `hr` - Human resources and employee management
- `support` - Customer support and ticketing
- `marketing` - Marketing campaigns and lead gen
- `finance` - Financial reporting and analysis
- `operations` - General business operations
- `it` - IT service management

---

## Benefits for Demos

### Speed
- Load a complete workflow in 1 click
- No manual dragging/dropping
- Pre-configured agents
- Ready to execute immediately

### Variety
- 5 different use cases
- Covers multiple departments
- Shows single and multi-agent patterns
- Demonstrates parallel execution (Marketing example)

### Professionalism
- Production-quality configurations
- Realistic sample inputs
- Clear naming and descriptions
- Organized by category

### Learning
- New users can explore examples
- See how workflows are structured
- Learn configuration patterns
- Copy and modify for their needs

---

## Testing Examples

### Manual Testing

**Test 1: Sales Outreach**
```bash
# Load example
curl -X POST http://localhost:8000/api/v1/examples/example_sales_outreach/instantiate

# Execute (use returned workflow_id)
curl -X POST http://localhost:8000/api/v1/executions/ \
  -H "Content-Type: application/json" \
  -d '{"workflow_id": "wf_xxx", "input": "Find Q4 deals..."}'

# Expected: 20 deals found, 10 emails sent (max_emails=10)
```

**Test 2: Marketing Campaign (Parallel)**
```bash
# This one has parallel execution: HubSpot → Email + Slack

curl -X POST http://localhost:8000/api/v1/examples/example_marketing_campaign/instantiate

# Execute
curl -X POST http://localhost:8000/api/v1/executions/ \
  -d '{"workflow_id": "wf_xxx", "input": "Find new leads..."}'

# Expected: Both Email and Slack agents execute
```

### UI Testing

1. **Load and Inspect:**
   - Load each example
   - Verify nodes appear in correct positions
   - Verify connections are correct
   - Check config panel shows configurations

2. **Execute:**
   - Execute each example
   - Verify results match expectations
   - Check metrics are calculated
   - Verify sample input works

3. **Modify:**
   - Load an example
   - Change a config value
   - Save as new workflow
   - Execute and verify changes apply

---

## Future Enhancements

### Planned for Week 6

1. **Workflow Gallery**
   - Browse examples without loading
   - Thumbnail previews
   - Filter by category
   - Search examples

2. **User-Created Examples**
   - Save your own workflows as templates
   - Share with team
   - Community examples

3. **Example Metadata**
   - Difficulty level (beginner/intermediate/advanced)
   - Estimated execution time
   - Required connectors
   - Tags for better filtering

4. **Tutorial Mode**
   - Step-by-step walkthrough of each example
   - Annotations on canvas
   - Guided execution

---

## API Reference

### List Examples
```
GET /api/v1/examples/
```

**Response:**
```json
{
  "examples": [
    {
      "id": "example_sales_outreach",
      "name": "Sales Outreach Pipeline",
      "description": "...",
      "category": "sales",
      "icon": "📊",
      "agents": [...],
      "edges": [...],
      "sample_input": "..."
    }
  ]
}
```

### Get Example
```
GET /api/v1/examples/{example_id}
```

**Response:** Single example object

### Instantiate Example
```
POST /api/v1/examples/{example_id}/instantiate
```

**Response:**
```json
{
  "workflow_id": "wf_abc123",
  "workflow": { ... },
  "sample_input": "...",
  "message": "Created workflow from example: Sales Outreach Pipeline"
}
```

---

## Files

**Backend:**
- `backend/data/example_workflows.py` - Example definitions
- `backend/routers/examples.py` - API endpoints
- `backend/main.py` - Router registration

**Frontend:**
- `frontend/src/components/ExampleWorkflows.js` - Modal component
- `frontend/src/components/ExampleWorkflows.css` - Styling
- `frontend/src/pages/WorkflowBuilder.js` - Integration
- `frontend/src/pages/ExecutionDashboard.js` - Auto-fill sample input

---

## Quick Start

### For Prospects/Demos

1. Open http://localhost:3000/builder
2. Click "📚 Load Example"
3. Select "Sales Outreach Pipeline"
4. Click "⚡ Load This Example"
5. Navigate to http://localhost:3000/execute
6. Click "▶️ Execute Workflow"
7. Watch it work!

### For Developers

Adding a new example:
```python
# 1. Add to backend/data/example_workflows.py
EXAMPLE_WORKFLOWS.append({
    "id": "example_my_workflow",
    "name": "My Workflow",
    # ... rest of config
})

# 2. Test via API
curl http://localhost:8000/api/v1/examples/

# 3. Load in UI
# Click "Load Example" button → see your new example!
```

---

**🎉 Example workflows are ready for your demos!**

Zero setup required - just click "Load Example" and start exploring the platform!
