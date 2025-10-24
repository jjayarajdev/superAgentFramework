# Agent Catalog

Complete list of available agents in the Super Agent Framework.

## Current Agents (8 Total)

### Data Retrieval Agents

#### 1. Sales Intelligence Agent
**Type:** `sales_intelligence`
**Icon:** chart-line
**Connector:** SFDC

**Description:** Query Salesforce for opportunities, accounts, and contacts.

**Configuration:**
- `object_type`: Opportunity | Account | Contact
- `amount_threshold`: Minimum deal amount ($)
- `close_date_filter`: Q1 | Q2 | Q3 | Q4 | All
- `stage_filter`: Filter by sales stage

**Use Cases:**
- Find high-value deals closing this quarter
- Identify stalled opportunities
- Generate sales pipeline reports

---

#### 2. Workday Agent
**Type:** `workday`
**Icon:** users
**Connector:** Workday (mock: Darwinbox)

**Description:** Query Workday HR system for employee data and performance reviews.

**Configuration:**
- `query_type`: employees | departments | performance_reviews
- `department_filter`: Engineering | Sales | Marketing | All
- `performance_rating`: Outstanding | Exceeds Expectations | Meets Expectations | All

**Use Cases:**
- Find top performers for account assignments
- Query employee data for workforce analytics
- Retrieve performance review data

---

#### 3. SAP ERP Agent
**Type:** `sap`
**Icon:** building
**Connector:** SAP

**Description:** Query SAP for financial, procurement, and operational data.

**Configuration:**
- `module`: finance | procurement | sales_distribution | materials_management | human_capital
- `query_type`: open_purchase_orders | vendor_invoices | inventory_levels | sales_orders | general_ledger
- `date_range`: today | last_7_days | last_30_days | last_quarter | last_year
- `company_code`: SAP company code filter

**Use Cases:**
- Retrieve open purchase orders
- Query vendor invoices for payment processing
- Check inventory levels across warehouses
- Generate financial reports

---

#### 4. ServiceNow Agent
**Type:** `servicenow`
**Icon:** ticket
**Connector:** ServiceNow

**Description:** Query ServiceNow for IT tickets, incidents, and change requests.

**Configuration:**
- `table`: incident | change_request | problem | catalog_task | knowledge_base
- `priority`: Critical | High | Medium | Low | All
- `state`: Open | In Progress | Resolved | Closed | All
- `assigned_to`: Filter by assigned user

**Use Cases:**
- Monitor critical incidents
- Track change requests
- Analyze ticket resolution times
- Query knowledge base articles

---

#### 5. Jira Agent
**Type:** `jira`
**Icon:** trello
**Connector:** Jira

**Description:** Query Jira for issues, bugs, stories, and project data.

**Configuration:**
- `project_key`: Jira project key (e.g., PROJ, ENG)
- `issue_type`: All | Bug | Story | Task | Epic | Sub-task
- `status`: All | To Do | In Progress | In Review | Done | Blocked
- `assignee`: Filter by assignee email
- `sprint`: current | next | backlog | all

**Use Cases:**
- Track sprint progress
- Find blocked issues
- Generate burndown reports
- Query bug backlog

---

#### 6. HubSpot Agent
**Type:** `hubspot`
**Icon:** target
**Connector:** HubSpot

**Description:** Query HubSpot for marketing and CRM data.

**Configuration:**
- `object_type`: contacts | companies | deals | tickets | marketing_emails
- `lifecycle_stage`: Lead | MQL | SQL | Opportunity | Customer | All
- `deal_stage`: Qualified | Presentation | Negotiation | Closed Won | Closed Lost | All
- `date_range`: today | last_7_days | last_30_days | last_quarter | all_time

**Use Cases:**
- Find qualified leads
- Track email campaign performance
- Query deal pipeline
- Analyze customer lifecycle

---

#### 7. Zendesk Agent
**Type:** `zendesk`
**Icon:** headphones
**Connector:** Zendesk

**Description:** Query Zendesk for customer support tickets and satisfaction data.

**Configuration:**
- `query_type`: tickets | users | organizations | satisfaction_ratings
- `ticket_status`: new | open | pending | solved | closed | all
- `priority`: urgent | high | normal | low | All
- `assigned_to`: Filter by agent email or ID
- `tags`: Filter by tags (comma-separated)

**Use Cases:**
- Monitor open support tickets
- Track customer satisfaction
- Identify urgent issues
- Analyze ticket resolution metrics

---

### Communication & Action Agents

#### 8. Slack Agent
**Type:** `slack`
**Icon:** message-square
**Connector:** Slack

**Description:** Send messages and notifications to Slack channels.

**Configuration:**
- `channel`: Slack channel to post to (e.g., #general, #alerts)
- `message_template`: default | alert | summary | custom
- `mention_users`: Whether to @mention users
- `include_attachments`: Include rich attachments (cards)

**Use Cases:**
- Send alerts to team channels
- Post workflow summaries
- Notify teams of completed tasks
- Share reports via Slack

---

## Agent Categories

### Data Retrieval (7 agents)
Agents that query external systems for data:
- Sales Intelligence
- Workday
- SAP
- ServiceNow
- Jira
- HubSpot
- Zendesk

### Communication (1 agent)
Agents that send messages or notifications:
- Slack

### Action (Coming in Week 2)
Agents that take actions:
- Email Outreach (send emails via Outlook)
- More to come...

### Analysis (Future)
Agents that analyze and process data:
- Sentiment Analysis
- Data Summarization
- Report Generation

---

## Multi-Agent Workflow Examples

### Example 1: Sales Outreach Automation
**Flow:** Sales Intelligence → Email Outreach (Week 2) → Slack

1. **Sales Intelligence Agent**: Find deals closing in Q4 > $100K
2. **Email Outreach Agent**: Generate personalized check-in emails
3. **Slack Agent**: Notify #sales channel of emails sent

**Value:** Automate sales follow-up process

---

### Example 2: IT Incident Response
**Flow:** ServiceNow → Jira → Slack

1. **ServiceNow Agent**: Find critical incidents
2. **Jira Agent**: Create bug tickets for engineering
3. **Slack Agent**: Alert #engineering channel

**Value:** Faster incident triage and response

---

### Example 3: Customer Success Workflow
**Flow:** Zendesk → HubSpot → Slack

1. **Zendesk Agent**: Find urgent support tickets
2. **HubSpot Agent**: Check customer lifecycle stage
3. **Slack Agent**: Alert account manager if customer at risk

**Value:** Proactive customer retention

---

### Example 4: HR + Sales Intelligence
**Flow:** Workday → Sales Intelligence → Email Outreach

1. **Workday Agent**: Find top sales performers
2. **Sales Intelligence Agent**: Get their assigned accounts
3. **Email Outreach Agent**: Send recognition emails

**Value:** Employee recognition automation

---

### Example 5: Procurement Automation
**Flow:** SAP → Slack → Jira

1. **SAP Agent**: Find purchase orders pending approval
2. **Slack Agent**: Notify procurement team
3. **Jira Agent**: Create approval tasks

**Value:** Streamlined procurement process

---

## Adding Your Own Agents

See `ADDING_AGENTS.md` for the complete guide.

**Quick steps:**
1. Create `backend/agents/your_agent.py`
2. Define config schema with Pydantic
3. Implement `execute()` method
4. Add `@register_agent` decorator
5. Import in `agents/__init__.py`

**That's it!** Your agent is now available across the platform.

---

## Agent Statistics

- **Total Agents:** 8
- **Data Retrieval:** 7
- **Communication:** 1
- **Lines of Code per Agent:** ~60-120
- **Time to Add New Agent:** ~30 minutes

---

## Future Roadmap

**Week 2:**
- Email Outreach Agent
- Generic Action Agent

**Week 3+:**
- Google Workspace Agent (Gmail, Calendar, Drive)
- Microsoft 365 Agent (Teams, OneDrive)
- Database Query Agent (PostgreSQL, MySQL)
- AWS Agent (EC2, S3, Lambda)
- Stripe Agent (Payments, Subscriptions)
- Twilio Agent (SMS, Phone)
- Data Analysis Agent (Pandas, NumPy)
- Report Generation Agent (PDF, Excel)

**Vision:** 50+ agents covering all major enterprise systems and use cases.

---

## Demo Script

**When showing to prospects:**

1. **Show the palette:**
   "We have 8 pre-built agents out of the box."

2. **Open API docs:**
   `GET /api/v1/agents/types`
   "These are dynamically discovered - no hardcoded lists."

3. **Show config schema:**
   `GET /api/v1/agents/types/slack/schema`
   "The frontend uses this to auto-generate forms."

4. **Show adding a new agent:**
   Open `ADDING_AGENTS.md`
   "Here's how you add a new one - 60 lines of code."

5. **Key message:**
   "You're not locked into our catalog. Your team can add connectors for your internal systems."

---

## Technical Details

**Base Class:** `agents.base.BaseAgent`
**Registry:** `agents.base.AgentRegistry`
**Auto-Discovery:** `@register_agent` decorator

All agents:
- ✅ Self-describing via Pydantic schemas
- ✅ Automatically registered on import
- ✅ Configuration forms auto-generated
- ✅ Appear in API dynamically
- ✅ Type-safe and validated

This is what makes the platform **truly extensible**.
