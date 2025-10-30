# Product Requirements Document: Super Agent Framework - MVP/PoC

**Version:** 1.0
**Date:** October 24, 2025
**Timeline:** 4-6 weeks
**Status:** Draft

---

## Executive Summary

Super Agent Framework is an enterprise AI agent platform that enables non-technical users to build multi-agent workflows through a visual drag-and-drop interface. The platform orchestrates autonomous agents that can query enterprise systems (Salesforce, HR platforms, email), retrieve knowledge from RAG-powered knowledge bases, and take actions (send emails, update records) - all while providing full observability into token usage, costs, and execution timelines.

**Key Differentiators:**
1. **Multi-agent orchestration** - Not just a single chatbot, but coordinated agents working together
2. **Visual workflow builder** - Business users create complex automations without code
3. **Cost transparency** - Per-agent token tracking and cost estimation (critical for CFO/CIO approval)
4. **Enterprise connectors** - Pre-built integrations with SFDC, Outlook, HR systems
5. **RAG grounding** - Responses cite actual sources, preventing hallucinations

**PoC Goal:** Build a mock demo application that runs locally on your laptop for prospect presentations. All data is synthetic, all integrations are mocked. Focus is on visual polish and impressive execution flow, not production deployment.

---

## Problem Statement

### Current State Pain Points

**For CIOs/CTOs:**
- AI implementations have unpredictable costs (no visibility into token usage)
- Point solutions create vendor sprawl and integration nightmares
- Security and compliance concerns block AI adoption
- Need to demonstrate ROI to justify AI investments

**For Engineering Teams:**
- Building custom AI agents requires specialized ML expertise
- Integrating LLMs with enterprise systems is time-consuming
- Lack of standardized frameworks for multi-agent orchestration
- Observability and debugging of AI systems is difficult

**For Business Users:**
- Dependent on engineering teams to build AI workflows
- Can't iterate quickly on business logic
- No visibility into why AI made specific decisions
- Can't trace AI responses back to source data

### Desired State

A platform where business users can visually design multi-agent workflows in minutes, engineering teams can trust the security and observability, and CIOs can see exactly where AI costs are going - all while agents autonomously execute complex cross-system tasks with full audit trails.

---

## Goals & Success Metrics

### PoC Success Criteria

**Must Demonstrate:**
1. Visual workflow creation (drag 2 agents, connect them) in < 2 minutes
2. Multi-agent execution: Agent 1 queries SFDC → Agent 2 sends personalized emails via Outlook
3. RAG integration: Email content cites specific deal history from knowledge base
4. Observability dashboard: Shows execution timeline, per-agent token usage, cost estimate ($0.XX), latency
5. Professional UI: Looks production-ready, not a prototype
6. Quick setup: Single command to start demo (`npm run demo` or `docker-compose up`)

**Demo Success Factors:**
- Workflow creation feels intuitive and fast
- Multi-agent execution is visually impressive (animated timeline)
- Mock data looks realistic (not obviously fake)
- Observability dashboard shows meaningful metrics
- Demo runs smoothly without crashes or glitches

### Out of Scope for Mock Demo

- **Any real integrations** - All connectors are mocked with synthetic data
- **Authentication/authorization** - Single hardcoded demo user
- **Deployment infrastructure** - No cloud hosting, CI/CD, or production concerns
- **Data persistence across restarts** - Optionally use in-memory storage or SQLite
- **Security controls** - No PII masking, audit logs can be basic
- **Error handling** - Happy path focus, basic error messages are fine
- **Scalability** - Built for single-user demo on laptop
- **Multi-tenancy** - One demo environment

---

## User Personas

### Persona 1: Sarah - CIO at Enterprise SaaS Company
**Goals:**
- Demonstrate AI ROI to board of directors
- Control AI costs and prevent budget overruns
- Ensure compliance and security for regulated data
- Reduce dependency on point solutions

**Pain Points:**
- Current AI tools have no cost visibility
- Engineering team is overwhelmed with AI integration requests
- CISO blocks AI projects due to data security concerns

**PoC Value:** "I can show my CFO exactly what each AI workflow costs before deploying it. The audit trail satisfies my CISO. And business teams can build workflows themselves."

### Persona 2: Mike - Engineering Lead
**Goals:**
- Build AI systems quickly without becoming an ML expert
- Have full observability and debugging capabilities
- Use standard APIs and avoid vendor lock-in
- Maintain system reliability and performance

**Pain Points:**
- Integrating LLMs with Salesforce/email is custom, brittle code
- Can't debug why LLM made a specific decision
- No framework for multi-agent orchestration

**PoC Value:** "The API is clean, the observability is built-in, and I can trace every agent decision. I can build this in weeks instead of months."

### Persona 3: Jessica - Sales Operations Manager
**Goals:**
- Automate repetitive tasks (deal check-ins, data entry)
- Get insights from data locked in multiple systems
- Iterate quickly on business processes

**Pain Points:**
- Dependent on engineering for every automation
- Can't combine data from Salesforce + email + HR systems
- Writing SQL or Python is not her skillset

**PoC Value:** "I built this workflow myself by dragging boxes. No engineering ticket needed. I can see exactly what each agent is doing."

---

## User Stories

### Epic 1: Visual Workflow Creation

**US-1.1:** As Jessica, I want to drag a "Sales Intelligence Agent" from a palette onto a canvas, so I can start building a workflow without writing code.
**Acceptance Criteria:**
- Agent palette shows available agent types with icons and descriptions
- Drag-and-drop adds agent node to canvas
- Agent node shows name, type, and configuration status

**US-1.2:** As Jessica, I want to connect the output of Agent 1 to the input of Agent 2 by drawing a line, so I can define the execution flow.
**Acceptance Criteria:**
- Click and drag from Agent 1 output port creates edge
- Edge connects to Agent 2 input port
- Visual indicator shows data flow direction (arrow)

**US-1.3:** As Jessica, I want to configure an agent by clicking it and filling a form, so I can specify which Salesforce fields to query.
**Acceptance Criteria:**
- Click agent opens configuration panel
- Form shows connector dropdown, query parameters, output schema
- Changes save automatically

**US-1.4:** As Jessica, I want to save my workflow and give it a name, so I can run it later.
**Acceptance Criteria:**
- "Save Workflow" button in toolbar
- Modal prompts for workflow name and description
- Workflow appears in "My Workflows" list

### Epic 2: Multi-Agent Execution

**US-2.1:** As Jessica, I want to execute my workflow with a natural language input, so I don't have to learn a query language.
**Acceptance Criteria:**
- "Execute" button on workflow detail page
- Text input accepts natural language (e.g., "Find Q4 deals over $100K and send check-in emails")
- Execution starts and shows progress indicator

**US-2.2:** As Mike, I want to see the execution timeline showing when each agent ran, so I can debug issues.
**Acceptance Criteria:**
- Timeline view shows Agent 1 start/end time, Agent 2 start/end time
- Visual indicator shows handoff point between agents
- Click on agent in timeline shows detailed logs

**US-2.3:** As Sarah, I want to see the total token usage and cost estimate for the execution, so I can budget AI spend.
**Acceptance Criteria:**
- Observability panel shows total tokens (e.g., 3,000)
- Cost estimate in USD (e.g., $0.12)
- Breakdown by agent (Agent 1: 500 tokens, Agent 2: 2,500 tokens)

**US-2.4:** As Jessica, I want to see the emails that Agent 2 generated and "sent", so I can verify the content before using this in production.
**Acceptance Criteria:**
- Execution results show list of generated emails
- Each email shows: recipient, subject, body
- Citations show which RAG sources were used (e.g., "Deal history from vector store")

### Epic 3: Connector Configuration

**US-3.1:** As Mike, I want to see a list of available connectors (SFDC, Outlook, Darwinbox, Generic REST), so I know what systems I can integrate.
**Acceptance Criteria:**
- Connectors page lists all available connectors
- Each connector shows: name, description, supported operations (read/write)
- "Mock" badge indicates demo data vs. real integration

**US-3.2:** As Jessica, I want to configure the SFDC connector by selecting object types and fields, so Agent 1 knows what to query.
**Acceptance Criteria:**
- SFDC connector config shows dropdown of objects (Opportunity, Account, Contact)
- Field selector shows available fields for selected object
- Query builder allows simple filters (e.g., CloseDate >= Q4, Amount > 100000)

### Epic 4: RAG Knowledge Base

**US-4.1:** As Jessica, I want to upload documents (PDFs, emails, deal notes) to the knowledge base, so agents can retrieve relevant context.
**Acceptance Criteria:**
- Upload button accepts PDF, TXT, DOCX files
- Upload shows progress bar
- Document list shows uploaded files with metadata (filename, upload date, size)

**US-4.2:** As Mike, I want to see which RAG sources were cited in the agent's response, so I can verify the agent didn't hallucinate.
**Acceptance Criteria:**
- Each agent output includes "Sources" section
- Citations show document name, relevant excerpt, similarity score
- Click citation opens full document

---

## Functional Requirements

### Component 1: Visual Workflow Builder (Frontend)

**FR-1.1: Drag-and-Drop Canvas**
- Technology: React + React Flow library
- Agent palette on left sidebar with 4 agent types:
  - Sales Intelligence Agent (icon: chart)
  - Email Outreach Agent (icon: envelope)
  - Data Retrieval Agent (icon: database)
  - Generic Action Agent (icon: gear)
- Canvas supports: zoom, pan, grid snap, auto-layout
- Edge routing with automatic path finding

**FR-1.2: Agent Configuration Panel**
- Slides in from right when agent is clicked
- Tabs: General, Connector, Parameters, Output
- General tab: Agent name, description
- Connector tab: Dropdown to select connector, connection test button
- Parameters tab: Dynamic form based on agent type
- Output tab: Shows expected output schema (JSON preview)

**FR-1.3: Workflow Toolbar**
- Actions: Save, Execute, Export (JSON), Share
- Workflow metadata: Name, description, created date, last run
- Execution history: List of past runs with status (success/failed)

**FR-1.4: Execution View**
- Split screen: Workflow canvas on left, execution panel on right
- Real-time updates as agents execute (highlight active agent)
- Execution panel tabs: Timeline, Logs, Metrics, Results

### Component 2: Multi-Agent Orchestrator (Backend)

**FR-2.1: Orchestration Engine**
- Technology: Python with LangGraph for agent coordination
- Execution modes: Sequential (MVP), Parallel (future)
- State management: Shared context object passed between agents
- Error handling: Agent failures don't crash entire workflow (log and continue)

**FR-2.2: Agent Types**

**Sales Intelligence Agent:**
- Inputs: Query parameters (object type, filters, date ranges)
- Operations: Query SFDC connector, retrieve RAG context
- Outputs: Structured JSON array of results
- Example output: `[{deal_id: "123", account_owner: "john@example.com", deal_value: 150000, close_date: "2025-12-15"}, ...]`

**Email Outreach Agent:**
- Inputs: Recipient list from previous agent, email template, RAG context
- Operations: Generate personalized emails using LLM, send via Outlook connector
- LLM prompt: "Given this deal data: {deal_data} and historical context: {rag_context}, write a personalized check-in email"
- Outputs: Array of sent emails with delivery status
- Example output: `[{recipient: "john@example.com", subject: "Q4 Deal Check-in: Acme Corp", body: "...", sent: true, timestamp: "2025-10-24T14:30:00Z"}, ...]`

**FR-2.3: Agent-to-Agent Data Passing**
- Output of Agent N becomes input of Agent N+1
- Schema validation: Ensure Agent 1 output matches Agent 2 expected input
- Data transformation: Optional mapping layer (e.g., rename fields)

**FR-2.4: Execution Context**
- Global variables: user_id, workflow_id, execution_id, timestamp
- Shared state: Key-value store accessible to all agents
- Metrics collection: Track start_time, end_time, tokens_used for each agent

### Component 3: Connectors (Backend)

**FR-3.1: SFDC Connector (Mock)**
- Mock data: 50 synthetic opportunities, 20 accounts, 30 contacts
- Realistic fields: Id, Name, Amount, CloseDate, StageName, OwnerId, AccountId
- Query interface: Filter by date range, amount, stage
- Response format: JSON array matching Salesforce API structure

**FR-3.2: Outlook Connector (Mock)**
- Mock operation: "Send Email" logs to database instead of actually sending
- Input schema: `{recipient: string, subject: string, body: string, cc?: string[], attachments?: []}`
- Response: `{sent: true, message_id: string, timestamp: string}`
- Stored emails viewable in UI

**FR-3.3: Darwinbox/HR Connector (Mock)**
- Mock data: 100 employees with fields: employee_id, name, department, manager, performance_rating, hire_date
- Query interface: Filter by department, manager, performance rating
- Use case: Find high-performing employees for account assignments

**FR-3.4: Generic REST API Connector**
- Configuration: Base URL, auth headers, endpoint path
- Supports: GET, POST with JSON payloads
- Response parsing: Extract data from JSON response using JSONPath

**FR-3.5: Connector Registry**
- API endpoint: `GET /connectors`
- Returns: List of available connectors with schemas
- Each connector defines: input_schema, output_schema, supported_operations

### Component 4: RAG Pipeline (Backend)

**FR-4.1: Document Ingestion**
- API endpoint: `POST /documents/upload`
- Supported formats: PDF, TXT, DOCX, MD
- Processing: Extract text, chunk into 500-token segments, generate embeddings
- Technology: LangChain document loaders + OpenAI embeddings

**FR-4.2: Vector Store**
- Technology: Chroma (lightweight) or Pinecone (managed)
- Metadata: document_id, filename, upload_date, chunk_index, user_id
- Search: Semantic similarity search with top-k results (default k=5)

**FR-4.3: Retrieval API**
- API endpoint: `POST /rag/query`
- Input: `{query: string, top_k: int, filters?: object}`
- Output: `[{content: string, metadata: object, similarity_score: float}, ...]`
- Used by agents to get context before LLM generation

**FR-4.4: Citation Tracking**
- Every LLM response must include `sources` array
- Source object: `{document_id: string, filename: string, excerpt: string, similarity_score: float}`
- UI displays citations below agent output

### Component 5: Observability Dashboard (Frontend + Backend)

**FR-5.1: Execution Timeline**
- Visual timeline showing agent execution order
- Each agent bar shows: name, duration, status (running/success/failed)
- Handoff points indicated by connecting lines
- Color coding: green (success), red (failed), blue (running)

**FR-5.2: Token Tracking**
- Backend: Wrap LLM calls with token counter (using tiktoken library)
- Track per agent: prompt_tokens, completion_tokens, total_tokens
- API endpoint: `GET /executions/{id}/metrics`
- Response: `{total_tokens: 3000, total_cost: 0.12, agents: [{agent_id, name, tokens, cost, latency_ms}, ...]}`

**FR-5.3: Cost Estimation**
- Pricing model: GPT-4: $0.03/1K prompt tokens, $0.06/1K completion tokens (configurable)
- Calculate per agent: (prompt_tokens * prompt_price + completion_tokens * completion_price)
- Display in UI: Total cost, per-agent breakdown

**FR-5.4: Execution Logs**
- Structured logs: timestamp, level (INFO/WARN/ERROR), agent_id, message
- Searchable and filterable
- Export to JSON for debugging

---

## Non-Functional Requirements (Mock Demo Focus)

### Performance

**NFR-1: Demo Responsiveness**
- Workflow execution should feel fast (< 5 seconds end-to-end)
- UI interactions should be smooth (no lag when dragging agents)
- Mock LLM calls can use canned responses or OpenAI API (your choice)

**NFR-2: Visual Polish**
- Animations for agent execution (timeline progress bars)
- Smooth transitions between pages
- Professional color scheme and typography

### Data & Setup

**NFR-3: Mock Data**
- 50 synthetic SFDC opportunities with realistic fields
- 20 accounts, 30 contacts
- 10-20 sample documents for RAG demo
- Use Faker library for realistic but fake company names

**NFR-4: Quick Setup**
- Single command to start: `npm run demo` or `docker-compose up`
- Optionally: Pre-seed data on first launch
- Should work on Mac/Linux/Windows

**NFR-5: Data Reset**
- Simple way to reset demo to clean state (button in UI or CLI command)
- Useful for running multiple prospect demos

### Demo Mode

**NFR-6: Hardcoded User**
- No login screen, just loads as "Demo User"
- All workflows owned by this single user

**NFR-7: Happy Path Focus**
- Build for the success scenario (agents work correctly)
- Basic error handling is fine (toast notifications)
- Don't worry about edge cases (empty results, timeouts, etc.)

### Optional: Persistence

**NFR-8: Storage (Optional)**
- Can use in-memory storage (data lost on restart) for simplicity
- Or SQLite for persistence between demos
- Your choice based on effort vs. value

---

## Technical Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Workflow Builder│  │  Execution   │  │  Observability│ │
│  │   (React Flow)  │  │   Dashboard  │  │   Dashboard   │ │
│  └────────┬────────┘  └──────┬───────┘  └───────┬───────┘ │
└───────────┼────────────────────┼──────────────────┼─────────┘
            │                    │                  │
            │ REST API / WebSocket                  │
            │                    │                  │
┌───────────▼────────────────────▼──────────────────▼─────────┐
│                      FastAPI Backend                        │
│  ┌──────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │  Workflow    │  │   Multi-Agent   │  │  Observability │ │
│  │    API       │  │  Orchestrator   │  │     Engine     │ │
│  └──────┬───────┘  └────────┬────────┘  └────────┬───────┘ │
│         │                   │                     │         │
│  ┌──────▼───────────────────▼─────────────────────▼──────┐ │
│  │              Execution Runtime                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐│ │
│  │  │  Agent   │  │  Agent   │  │      Agent 3        ││ │
│  │  │    1     │─▶│    2     │─▶│    (future)         ││ │
│  │  └────┬─────┘  └────┬─────┘  └──────────────────────┘│ │
│  └───────┼─────────────┼────────────────────────────────┘ │
└──────────┼─────────────┼──────────────────────────────────┘
           │             │
    ┌──────▼─────┐  ┌────▼──────────┐
    │ Connectors │  │  RAG Pipeline │
    └──────┬─────┘  └────┬──────────┘
    │      │             │           │
┌───▼──┐ ┌─▼────┐  ┌────▼──────┐ ┌──▼────────┐
│ SFDC │ │Outlook│  │  Vector   │ │    LLM    │
│(Mock)│ │(Mock) │  │   Store   │ │(OpenAI/   │
└──────┘ └───────┘  │ (Chroma)  │ │Anthropic) │
                    └───────────┘ └───────────┘
```

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- React Flow (visual workflow builder)
- TailwindCSS (styling)
- Recharts (metrics visualization)
- Axios (API client)
- Socket.IO client (real-time execution updates)

**Backend:**
- Python 3.11+
- FastAPI (REST API framework)
- LangGraph (multi-agent orchestration)
- LangChain (RAG, document loaders)
- Pydantic (data validation)
- SQLAlchemy (ORM)
- Celery + Redis (async task execution)

**Data Stores:**
- PostgreSQL (workflows, executions, audit logs)
- Chroma (vector store for RAG)
- Redis (Celery task queue, caching)

**LLM & Embeddings:**
- OpenAI GPT-4 (primary LLM for agent reasoning)
- OpenAI text-embedding-3-small (document embeddings)
- Anthropic Claude as fallback option

**Local Development:**
- Docker + Docker Compose (optional, or just npm/python commands)
- Git for version control

### Agent Extensibility Architecture

**CRITICAL FEATURE:** The platform uses a plugin architecture that allows adding new agents with **minimal code** - no router changes, no frontend modifications, no configuration files.

#### How It Works

**1. Base Agent Class**
```python
class BaseAgent(ABC):
    agent_type: str
    name: str
    description: str
    icon: str
    category: AgentCategory
    supported_connectors: List[str]
    config_schema: type[AgentConfigSchema]

    @abstractmethod
    async def execute(self, input_data, context) -> AgentExecutionResult:
        pass
```

**2. Agent Registry (Auto-Discovery)**
- Agents use `@register_agent` decorator
- Automatically discovered on import
- No manual registration needed

**3. Self-Describing Configuration**
- Each agent defines its config schema using Pydantic
- Frontend fetches schema via API
- Forms auto-generated from JSON Schema

**4. Dynamic UI**
- Agent palette populated from `GET /api/v1/agents/types`
- Configuration panel renders from schema
- No hardcoded agent lists

#### Adding a New Agent (Example: Workday)

**Step 1:** Create `backend/agents/workday_agent.py`
```python
from agents.base import BaseAgent, register_agent

class WorkdayAgentConfig(AgentConfigSchema):
    query_type: str = Field(default="employees")
    department: str = Field(default="All")

@register_agent
class WorkdayAgent(BaseAgent):
    agent_type = "workday"
    name = "Workday Agent"
    description = "Query Workday HR system"
    icon = "users"
    config_schema = WorkdayAgentConfig

    async def execute(self, input_data, context):
        # Query logic here
        return AgentExecutionResult(success=True, output={...})
```

**Step 2:** Import in `backend/agents/__init__.py`
```python
from agents.workday_agent import WorkdayAgent
```

**Step 3:** Done! Agent is now:
- ✅ Available in API (`/api/v1/agents/types`)
- ✅ Appears in UI palette automatically
- ✅ Configuration form auto-generated
- ✅ Ready to use in workflows

**No router changes, no frontend code, no config files!**

See `ADDING_AGENTS.md` for complete guide.

#### Benefits

**For Engineering:**
- Add new agents in ~60 lines of code
- No cross-cutting changes required
- Type-safe with Pydantic validation
- Testable in isolation

**For Business:**
- Rapid iteration on new integrations
- No engineering bottleneck for new data sources
- Can build agent catalog quickly
- Future: Visual agent builder (no-code)

**For Prospects:**
- Demonstrates platform extensibility
- Shows how they could add their own connectors
- Reduces perceived vendor lock-in

### Data Models

**Workflow Schema:**
```json
{
  "id": "uuid",
  "name": "Sales Outreach Workflow",
  "description": "Find deals and send emails",
  "created_at": "2025-10-24T12:00:00Z",
  "updated_at": "2025-10-24T12:00:00Z",
  "created_by": "demo_user",
  "agents": [
    {
      "id": "agent_1",
      "type": "sales_intelligence",
      "name": "Find High-Value Deals",
      "config": {
        "connector": "sfdc",
        "object_type": "Opportunity",
        "filters": {"CloseDate": ">= Q4", "Amount": "> 100000"}
      },
      "position": {"x": 100, "y": 100}
    },
    {
      "id": "agent_2",
      "type": "email_outreach",
      "name": "Send Check-in Emails",
      "config": {
        "connector": "outlook",
        "use_rag": true,
        "email_template": "check_in"
      },
      "position": {"x": 400, "y": 100}
    }
  ],
  "edges": [
    {
      "source": "agent_1",
      "target": "agent_2",
      "data_mapping": {"deals": "input"}
    }
  ]
}
```

**Execution Schema:**
```json
{
  "id": "uuid",
  "workflow_id": "uuid",
  "status": "completed",
  "started_at": "2025-10-24T14:30:00Z",
  "completed_at": "2025-10-24T14:30:03Z",
  "input": "Find Q4 deals over $100K and send check-in emails",
  "results": {
    "deals_found": 5,
    "emails_sent": 5
  },
  "metrics": {
    "total_tokens": 3000,
    "total_cost": 0.12,
    "total_latency_ms": 3200
  },
  "agent_executions": [
    {
      "agent_id": "agent_1",
      "started_at": "2025-10-24T14:30:00Z",
      "completed_at": "2025-10-24T14:30:01.2Z",
      "status": "success",
      "tokens_used": 500,
      "cost": 0.02,
      "output": [{...deals...}]
    },
    {
      "agent_id": "agent_2",
      "started_at": "2025-10-24T14:30:01.2Z",
      "completed_at": "2025-10-24T14:30:03Z",
      "status": "success",
      "tokens_used": 2500,
      "cost": 0.10,
      "output": [{...emails...}],
      "sources": [{...RAG citations...}]
    }
  ]
}
```

---

## API Specifications

### Workflow Management

**POST /api/v1/workflows**
- Create new workflow
- Request body: Workflow schema (see Data Models)
- Response: `{id: uuid, ...workflow_data}`

**GET /api/v1/workflows**
- List all workflows
- Query params: `?limit=10&offset=0`
- Response: `{workflows: [...], total: int}`

**GET /api/v1/workflows/{id}**
- Get workflow by ID
- Response: Workflow schema

**PUT /api/v1/workflows/{id}**
- Update workflow
- Request body: Updated workflow schema
- Response: Updated workflow

**DELETE /api/v1/workflows/{id}**
- Delete workflow
- Response: `{deleted: true}`

### Workflow Execution

**POST /api/v1/workflows/{id}/execute**
- Execute workflow
- Request body: `{input: string, params?: object}`
- Response: `{execution_id: uuid, status: "running"}`

**GET /api/v1/executions/{id}**
- Get execution status and results
- Response: Execution schema

**GET /api/v1/executions/{id}/timeline**
- Get execution timeline
- Response: `{agents: [{agent_id, name, started_at, completed_at, status}, ...]}`

**GET /api/v1/executions/{id}/metrics**
- Get execution metrics
- Response: `{total_tokens, total_cost, total_latency_ms, agents: [{agent_id, tokens, cost, latency_ms}, ...]}`

**GET /api/v1/executions/{id}/logs**
- Get execution logs
- Query params: `?level=INFO&agent_id=agent_1`
- Response: `{logs: [{timestamp, level, agent_id, message}, ...]}`

### Connectors

**GET /api/v1/connectors**
- List available connectors
- Response: `{connectors: [{id: "sfdc", name: "Salesforce", type: "mock", operations: ["read"]}, ...]}`

**GET /api/v1/connectors/{id}/schema**
- Get connector input/output schema
- Response: `{input_schema: {...}, output_schema: {...}}`

### RAG / Knowledge Base

**POST /api/v1/documents/upload**
- Upload document to knowledge base
- Request: multipart/form-data with file
- Response: `{document_id: uuid, filename: string, status: "processing"}`

**GET /api/v1/documents**
- List uploaded documents
- Response: `{documents: [{id, filename, upload_date, status}, ...]}`

**DELETE /api/v1/documents/{id}**
- Delete document
- Response: `{deleted: true}`

**POST /api/v1/rag/query**
- Query vector store
- Request body: `{query: string, top_k: int, filters?: object}`
- Response: `{results: [{content, metadata, similarity_score}, ...]}`

### Agent Types

**GET /api/v1/agents/types**
- List available agent types
- Response: `{agent_types: [{id: "sales_intelligence", name: "Sales Intelligence Agent", description: "...", icon: "chart"}, ...]}`

---

## UI/UX Specifications

### Workflow Builder Page

**Layout:**
- Top navbar: Logo, "My Workflows" link, User menu (demo_user)
- Left sidebar (250px): Agent palette with search
- Center canvas (fluid): React Flow workspace
- Right panel (300px, collapsible): Agent configuration

**Agent Palette:**
- Search bar at top
- Agent cards showing: Icon, Name, Short description
- Drag to canvas to add

**Canvas:**
- Grid background (light gray)
- Zoom controls (bottom right): +, -, Fit View
- Mini-map (bottom left) showing full workflow
- Toolbar (top): Save, Execute, Export, Share buttons

**Agent Node Design:**
- Header: Icon + Name (editable)
- Body: Connector badge, Status indicator (configured/not configured)
- Ports: 1 input (top), 1 output (bottom)
- Click to open config panel

**Configuration Panel:**
- Tabs: General, Connector, Parameters, Output
- Form fields with validation
- "Test Connection" button for connectors (shows success/error message)
- Auto-save on change (with debounce)

### Execution Dashboard Page

**Layout:**
- Top: Workflow name, Execution ID, Status badge (Running/Success/Failed)
- Center: Split view
  - Left (60%): Workflow canvas (read-only, highlights active agent)
  - Right (40%): Execution details panel

**Execution Panel Tabs:**
1. **Timeline:**
   - Horizontal timeline bar
   - Each agent shown as colored segment
   - Tooltips show duration, tokens, cost
2. **Logs:**
   - Scrollable list of log entries
   - Filter by level (INFO/WARN/ERROR) and agent
3. **Metrics:**
   - Summary cards: Total Tokens, Total Cost, Total Latency
   - Per-agent table with breakdown
   - Bar chart showing token distribution
4. **Results:**
   - JSON viewer showing final output
   - For email agent: List of sent emails with preview
   - Citations section showing RAG sources

### Home Page / Workflow List

**Layout:**
- Header: "My Workflows" title, "Create New Workflow" button
- Workflow cards in grid (3 columns)
  - Card shows: Name, Description, Last run date, Status
  - Hover actions: Edit, Execute, Delete

**Execution History:**
- Tab showing recent executions across all workflows
- Table columns: Workflow name, Execution time, Status, Duration, Cost
- Click row to view execution details

---

## Implementation Plan (4-6 Weeks)

### Week 1: Foundation & Mock Data
- Set up repo structure (monorepo or separate backend/frontend)
- Generate realistic mock data: SFDC (50 opps), Darwinbox (100 employees), Outlook (email templates)
- Backend: FastAPI scaffolding with basic REST API
- Frontend: React app scaffolding with routing
- **Deliverable:** Can start/stop app locally, mock data ready

### Week 2: Backend - Multi-Agent Orchestrator
- Build agent orchestrator with sequential execution
- Implement 2 agent types: SalesIntelligence, EmailOutreach
- Integrate mock connectors (return hardcoded or Faker data)
- Option 1: Use real OpenAI API with simple prompts
- Option 2: Use canned LLM responses for fully offline demo
- **Deliverable:** API can execute 2-agent workflow, returns mock results

### Week 3: Backend - RAG Pipeline
- Implement document upload (PDF/TXT)
- Vector store with Chroma (or just mock it with keyword search)
- RAG query endpoint that returns relevant chunks
- Add citation tracking to agent outputs
- **Deliverable:** Agents cite sources from knowledge base

### Week 4: Frontend - Visual Workflow Builder
- Implement React Flow canvas with drag-and-drop
- Agent palette with 3-4 agent types
- Agent configuration panel (forms for connectors/params)
- Save workflow to backend (or just localStorage)
- **Deliverable:** Can visually build a 2-agent workflow

### Week 5: Frontend - Execution Dashboard
- Execute workflow button triggers backend API
- Show execution timeline with animated progress
- Display metrics: token count, cost, latency per agent
- Show results: list of emails generated, citations
- **Deliverable:** End-to-end demo works with visual polish

### Week 6: Polish & Demo Prep
- UI refinements: animations, colors, icons
- Add 1-2 pre-built example workflows
- "Reset Demo" button to clear state
- README with setup instructions
- Optional: Record demo video/screenshots
- **Deliverable:** Ready to present to prospects

---

## Open Questions & Decisions Needed

1. **LLM Strategy:**
   - Option A: Use real OpenAI API (requires API key, costs ~$0.10 per demo run, more dynamic)
   - Option B: Use canned responses (fully offline, free, but less impressive)
   - **Recommendation:** Start with real API for authenticity, add canned fallback later

2. **RAG Implementation:**
   - Option A: Real vector store with Chroma (more impressive, shows actual semantic search)
   - Option B: Mock with simple keyword matching (faster to build, good enough for demo)
   - **Recommendation:** Real Chroma if Week 3 timeline allows, otherwise mock

3. **Data Persistence:**
   - Option A: In-memory only (workflows lost on restart, simpler)
   - Option B: SQLite file (persists between demos, more realistic)
   - **Recommendation:** Start in-memory, add SQLite if time permits

4. **Frontend Build Complexity:**
   - Option A: Full React Flow with configuration panels (more impressive)
   - Option B: Simplified UI with dropdowns/forms (faster to build)
   - **Recommendation:** Balanced - React Flow for visual wow, simple config forms

5. **Mock Data:**
   - Use fictional company names (Acme Corp, Globex, Initech) to avoid confusion
   - Pre-seed on first launch or have "Load Demo Data" button?
   - **Recommendation:** Auto-seed on first launch for zero-config demo

---

## Demo Success Criteria

**Must-Have for First Prospect Demo:**
- ✅ App starts with single command
- ✅ Pre-loaded with example workflow
- ✅ Can execute workflow and see results in < 30 seconds
- ✅ Visual timeline animates during execution
- ✅ Metrics show realistic token counts and costs
- ✅ UI looks professional (not obviously a prototype)

**Nice-to-Have Enhancements:**
- 📹 Screen recording of demo for async sharing
- 📋 2-3 pre-built workflows showcasing different use cases
- 🎨 Dark mode toggle
- 📊 Export workflow execution results as PDF/JSON

**Post-Demo Feedback to Gather:**
- Which features impressed prospects most?
- What objections were raised?
- Which use cases resonated?
- What would they want to see in a pilot?

---

**Document Status:** Ready for mock demo implementation
**Next Steps:** Choose LLM strategy (real API vs canned) → Begin Week 1 foundation
