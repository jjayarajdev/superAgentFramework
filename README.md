# Super Agent Framework - Demo Application

A mock demo application showcasing multi-agent orchestration with visual workflow building.

> **📋 Project Status:** Week 1 Complete - Foundation & Mock Data
> **🚀 Next Up:** Week 2 - Multi-Agent Orchestrator

## Quick Start

**See [SETUP.md](SETUP.md) for detailed setup instructions.**

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Frontend (in separate terminal)
cd frontend
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Test your setup:** `./test_setup.sh`

## Project Structure

```
/backend          - FastAPI server
  /agents         - Agent implementation
  /connectors     - Mock SFDC, Outlook, Darwinbox connectors
  /data           - Mock data and generators
  /models         - Pydantic data models
  /routers        - API endpoints
  main.py         - Entry point

/frontend         - React application
  /src
    /components   - React components
    /pages        - Page components
    /api          - API client
    /types        - TypeScript types

/docs             - Documentation
```

## Demo Scenario

The demo showcases a 2-agent workflow:

1. **Sales Intelligence Agent** - Queries mock SFDC for deals closing in Q4 > $100K
2. **Email Outreach Agent** - Generates personalized emails using RAG context and "sends" via mock Outlook

## Features

- ✅ **8 Pre-built Agents** - SFDC, Workday, SAP, ServiceNow, Slack, Jira, HubSpot, Zendesk
- ✅ **Plugin Architecture** - Add new agents in ~60 lines of code
- ✅ Visual workflow builder (drag-and-drop agents)
- ✅ Multi-agent orchestration (sequential execution)
- ✅ Mock enterprise connectors with realistic data
- ✅ RAG knowledge base with citations
- ✅ Observability dashboard (token usage, cost, timeline)
- ✅ Self-describing agents (JSON Schema config)

## Agent Catalog

**Data Retrieval (7):**
- Sales Intelligence (SFDC)
- Workday (HR)
- SAP (ERP)
- ServiceNow (IT)
- Jira (Project Mgmt)
- HubSpot (Marketing)
- Zendesk (Support)

**Communication (1):**
- Slack (Messaging)

See [AGENT_CATALOG.md](AGENT_CATALOG.md) for complete details.

**Add your own:** See [ADDING_AGENTS.md](ADDING_AGENTS.md)

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, LangGraph, LangChain
- **Frontend:** React 18, TypeScript, React Flow, TailwindCSS
- **Vector Store:** Chroma (local)
- **LLM:** OpenAI GPT-4 (optional: can use canned responses)

## Development

See [PRD.md](PRD.md) for complete product requirements and implementation plan.
