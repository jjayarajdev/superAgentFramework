# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT:** See `PRD.md` for the complete Product Requirements Document with detailed functional requirements, API specs, data models, and implementation plan.

**EXTENSIBILITY:** See `ADDING_AGENTS.md` for the plugin architecture guide - shows how to add new agents in ~60 lines of code with zero router/frontend changes.

## Project Overview

Super Agent Framework is an enterprise AI agent platform designed for high-ACV sales to CIO organizations. The platform provides agentic reasoning, RAG (Retrieval-Augmented Generation), and enterprise system integrations with stringent governance and security requirements.

**Timeline:** 4-6 weeks to working PoC
**Tech Stack:** Python (FastAPI) backend, React frontend, LangGraph for multi-agent orchestration
**Scope:** Mock demo application only - all data is synthetic, all integrations are mocked, runs locally on laptop for prospect demos

**Core Value Proposition:**
- Visual workflow builder for creating single/multi-agent workflows
- RAG-based knowledge retrieval grounded in enterprise data
- Pre-packaged connectors for enterprise systems (SFDC, Darwinbox, Outlook, Workday, SAP)
- LLMOps observability with token-level tracing and spend management
- Enterprise-grade security: PII masking, audit logging, policy enforcement

## PoC Demo Strategy

**Primary Demo Scenario: "Multi-Agent Sales Intelligence & Outreach"**

The PoC should demonstrate multi-agent collaboration that takes actions, not just retrieval:

Example workflow: "Find all deals closing this quarter above $100K and send a check-in email to the account owners"

**Agent 1 (Sales Intelligence Agent):**
- Queries SFDC for opportunities matching criteria (close date, amount)
- Retrieves account owner information from SFDC
- Uses RAG to find relevant context (previous communications, deal history)
- Passes structured data to Agent 2

**Agent 2 (Email Outreach Agent):**
- Receives deal data from Agent 1
- Generates personalized email content using LLM + context
- Sends email via Outlook connector (mock for demo)
- Logs action in audit trail

This scenario showcases:
1. **Multi-agent orchestration** - Two agents collaborating to complete a business task
2. **Read + Write operations** - Not just querying data, but taking action (sending emails)
3. **Visual workflow builder** - Drag-and-drop to connect agents
4. **RAG retrieval** - Grounded email content based on actual deal history
5. **Observability** - Track each agent's execution, token usage, and actions taken

**Secondary Demo Scenario: "Cross-System Query Intelligence"**

Simpler retrieval-only use case:
- "Which employees have interacted with Acme Corp in the last 6 months?"
- "Show me the performance reviews for all account managers working on enterprise deals"

Use this to show RAG + multi-connector retrieval without the action-taking complexity.

**Build Order for PoC:**
1. Backend API with mock connector framework (25% of effort)
2. Multi-agent orchestration engine (20%)
3. Simple RAG pipeline with vector store (20%)
4. Visual workflow builder UI with agent linking (25%)
5. Demo data seeding and metrics dashboard (10%)

**Mock Data Strategy:**
- Use realistic but synthetic datasets for SFDC (accounts, opportunities, contacts with close dates)
- Generate mock Darwinbox employee records with realistic fields
- Create sample Outlook email metadata (sender, recipient, subject, date) and email templates
- Create mock "sent emails" to show Agent 2's output in demo
- Seed vector store with synthetic company documents/policies and deal history
- All demo data should feel authentic but use fictional company names (Acme Corp, Globex, etc.)

**Demo Flow:**
1. Show visual workflow builder → Create "Sales Intelligence" agent (drag from palette)
2. Configure Agent 1: Connect to SFDC connector, set query criteria (close date, deal size)
3. Add "Email Outreach" agent → Link Agent 1's output to Agent 2's input (visual connection)
4. Configure Agent 2: Connect to Outlook connector, enable RAG for email context
5. Upload sample documents to RAG knowledge base (previous email threads, deal notes)
6. Execute workflow with natural language: "Find Q4 deals over $100K and send check-in emails"
7. Show execution timeline:
   - Agent 1 queries SFDC → Finds 5 deals
   - Agent 1 queries RAG → Gets context for each deal
   - Agent 2 receives structured data → Generates 5 personalized emails
   - Agent 2 sends emails via Outlook → Shows "Sent" confirmation
8. Display observability dashboard:
   - Execution graph showing agent handoff
   - Token usage per agent (Agent 1: 500 tokens, Agent 2: 2,500 tokens for email generation)
   - Cost estimate ($0.12 total)
   - Latency (3.2 seconds end-to-end)
   - Source citations for email content

**Tech Stack for Mock Demo:**
- Backend: FastAPI (Python) - chosen per user preference
- Frontend: React + React Flow for visual workflow builder
- Vector Store: Chroma (lightweight, local) or mock with keyword search
- LLM: OpenAI GPT-4 API or canned responses (for offline demo)
- Storage: In-memory or SQLite (simple, no PostgreSQL needed)
- Agent Framework: LangGraph for multi-agent orchestration
- Local Setup: Simple npm/python commands or Docker Compose

## Product Roadmap Context

The development follows a three-release strategy (see highlevel-prd.txt):

**Release 1 (MVP):**
- Visual workflow builder with drag-and-drop agent linking
- **Basic multi-agent orchestration** (sequential handoff, agent-to-agent data passing)
- Basic RAG with vector store
- Initial connectors (SFDC/Darwinbox/Outlook with read + write capabilities)
- SaaS + VPC deployment (Docker Compose)
- Execution logs and basic observability (token tracking, cost estimation)

**Release 2 (GA):**
- Dual-protocol API wrapper (REST/SOAP) for legacy systems (Workday, SAP)
- Full LLMOps suite with OpenTelemetry export
- PII detection/masking layer
- LLM evaluation frameworks (offline/online evals)
- Air-gapped deployment via Helm charts
- SSO integration (SAML/LDAP)

**Release 3 (Scale):**
- **Advanced multi-agent orchestration** (dynamic task decomposition, autonomous agent spawning, complex conversation trees)
- Immutable audit logging with decision lineage
- Policy Enforcement Point (PEP/PDP) for fine-grained agent authorization
- SOC 2 Type II / ISO 27001 compliance certification
- Non-human identity management for agent credentials

## Architecture Principles

**Security-First Design:**
- All data ingestion must support PII detection and masking
- Implement immutable audit trails for agent decisions and tool calls
- Policy enforcement must prevent tool chain privilege escalation
- Support air-gapped deployments for regulated industries (Finance, Healthcare, Government)

**Integration Architecture:**
- Build connectors with dual-protocol support (REST + SOAP) for legacy enterprise systems
- Design API wrappers to maintain transactional integrity across ERPs
- Initial integrations: SFDC, Darwinbox, Outlook (read-only MVP), Workday, SAP (GA)
- Support S3, Google Drive, SharePoint for unstructured data ingestion

**Observability & Cost Management:**
- Implement token-level tracing for all LLM operations
- Export telemetry via OpenTelemetry for enterprise monitoring tools (Datadog, etc.)
- Enforce spend caps to make AI costs predictable for CIOs
- Track workflow executions and API response metrics

**Mock Demo Deployment:**
- Single command to start locally: `npm run demo` or `docker-compose up`
- All connectors are mocked (no real SFDC/Outlook integration)
- In-memory or SQLite storage (optional)
- No authentication required (hardcoded demo user)

## Key Technical Components

**Agentic Core:**
- Visual workflow builder (low-code drag-and-drop interface)
- **Basic multi-agent orchestration (MVP):**
  - Sequential execution (Agent 1 → Agent 2 → Agent 3)
  - Explicit agent-to-agent data passing via structured outputs
  - Simple handoff patterns (one agent completes, next begins)
  - Pre-defined agent types (SalesIntelligence, EmailOutreach, DataRetrieval, etc.)
- **Advanced multi-agent orchestration (Release 3):**
  - Dynamic task decomposition (LLM decides which agents to spawn)
  - Autonomous agent spawning based on runtime conditions
  - Complex conversation trees with conditional branching
  - Parallel execution with result aggregation
  - Agent-to-agent negotiation and collaborative reasoning
- Agent state management and execution context

**RAG Engine:**
- Vector store for enterprise knowledge base
- Document upload and ingestion pipelines
- Grounded retrieval to prevent hallucinations
- LLM evaluation frameworks for answer quality scoring

**LLMOps:**
- Model lifecycle management
- Fine-tuning integration
- Offline and live evaluations
- Drift detection and model performance monitoring

**Security & Governance:**
- PII masking layer for inputs and outputs
- Policy Decision Point (PDP) and Policy Enforcement Point (PEP)
- Immutable audit logs with decision lineage
- Non-human identity management for agent credentials

## Development Priorities

**Phase Sequencing:**
Focus development in phases aligned with the roadmap to maximize early ROI and executive buy-in while systematically addressing CISO requirements.

**Quality Standards:**
- Model accuracy and hallucination reduction are critical (enterprise context)
- Transactional integrity must be maintained across ERP integrations
- Security controls are non-negotiable for CIO/CISO approval
- Cost predictability is essential for enterprise adoption

## Development Commands

*This section will be populated as the codebase is built. Expected commands:*

```bash
# Setup
npm install  # or: pip install -r requirements.txt

# Development
npm run dev  # Start backend + frontend in development mode

# Demo data
npm run seed:demo  # Populate mock SFDC/Darwinbox/Outlook data

# Testing
npm test  # Run unit tests
npm run test:e2e  # Run end-to-end demo flow

# Build & Deploy
npm run build  # Production build
docker-compose up  # Local deployment with all services
```

## PoC Architecture

**Component Structure:**

```
/backend          - FastAPI/Express API server
  /agents         - Agent execution engine and orchestrator
    /core         - Base agent class and execution runtime
    /orchestrator - Multi-agent coordination (sequential handoff)
    /types        - Agent definitions (SalesIntelligence, EmailOutreach, etc.)
  /connectors     - Mock SFDC, Darwinbox, Outlook connectors (read + write)
  /rag            - Vector store and retrieval logic
  /observability  - Metrics collection and tracing (token counts, costs, latency)
  /workflows      - Workflow definition storage and execution

/frontend         - React/Vue visual workflow builder
  /builder        - Drag-and-drop workflow canvas (React Flow / Vue Flow)
  /playground     - Agent testing interface with live execution view
  /dashboard      - Metrics and execution logs (timeline, token usage, costs)

/mock-data        - Synthetic datasets for demo
  /generators     - Scripts to create realistic test data
  /seeds          - Pre-generated SFDC, Darwinbox, Outlook data

/docker           - Docker Compose configuration
```

**Key APIs for PoC:**

- `POST /workflows` - Create new multi-agent workflow (defines agents and connections)
- `GET /workflows/{id}` - Retrieve workflow definition
- `POST /workflows/{id}/execute` - Run workflow with natural language input
- `GET /executions/{id}` - Get execution status and results
- `GET /executions/{id}/timeline` - Retrieve agent-by-agent execution timeline
- `GET /executions/{id}/metrics` - Retrieve observability data (tokens, cost, latency per agent)
- `GET /connectors` - List available connectors (SFDC, Darwinbox, Outlook)
- `POST /documents/upload` - Upload documents to RAG knowledge base
- `GET /agents/types` - List available agent types (SalesIntelligence, EmailOutreach, etc.)

**Data Flow (Multi-Agent Example):**
1. User creates workflow in visual builder:
   - Drag "Sales Intelligence Agent" onto canvas
   - Drag "Email Outreach Agent" onto canvas
   - Connect Agent 1 output → Agent 2 input (visual edge)
   - Configure Agent 1: SFDC connector, query criteria
   - Configure Agent 2: Outlook connector, RAG enabled
   - Save → POST /workflows
2. User submits natural language input: "Find Q4 deals over $100K and send check-in emails"
   - POST /workflows/{id}/execute
3. Orchestrator executes Agent 1:
   - Queries mock SFDC connector for opportunities
   - Retrieves deal context from RAG vector store
   - Returns structured data: `[{deal_id, account_owner, deal_value, close_date}, ...]`
   - Logs metrics: 500 tokens, 1.2s latency
4. Orchestrator passes Agent 1 output to Agent 2:
   - Agent 2 receives deal array
   - For each deal, generates personalized email using LLM + RAG context
   - Sends emails via mock Outlook connector
   - Logs metrics: 2,500 tokens, 2.0s latency
5. Response includes:
   - Execution summary: "Found 5 deals, sent 5 emails"
   - Timeline showing Agent 1 → Agent 2 handoff
   - Source citations for email content (RAG)
   - Observability: Total 3,000 tokens, $0.12 cost, 3.2s end-to-end

## Target Customers

Primary buyer: CIO organization in enterprise companies
Key stakeholders: CISO (security/compliance), CFO (cost management)
Industries: Finance, Healthcare, Government (highly regulated), plus general enterprise
Use cases: HR/Sales intelligence, procurement automation, cross-departmental workflows

## PoC Success Criteria

**Must Demonstrate:**
1. Visual workflow creation with multi-agent linking in < 2 minutes
2. Agent collaboration: One agent queries data, another takes action (sends emails)
3. Cross-system integration with read + write operations (SFDC query → Outlook send)
4. Source citations for LLM-generated content (RAG grounding)
5. Real-time observability: Execution timeline, token count per agent, cost estimate, latency
6. Professional UI that looks production-ready

**Avoid in PoC:**
- Real authentication/authorization (use demo mode)
- Complex multi-agent patterns (parallel execution, dynamic task decomposition)
- PII masking (mention it's coming in GA)
- Air-gapped deployment (show Docker Compose as "VPC-ready")
- Real email sending (mock the Outlook connector)

**Demo Talking Points:**
- "This multi-agent workflow was built in 90 seconds with drag-and-drop, no code"
- "Agent 1 queries Salesforce for deals, Agent 2 automatically generates and sends personalized emails"
- "Notice the emails cite specific deal history from our RAG knowledge base - grounded, not hallucinated"
- "Every step shows token usage and cost per agent - your CFO sees exactly where the AI spend goes"
- "The execution timeline shows you exactly what each agent did and when - full audit trail"
- *Note: This is a mock demo with synthetic data - in production, you'd connect to your real SFDC/Outlook*
