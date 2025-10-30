# SuperAgent - Enterprise Multi-Agent Orchestration Platform

A production-ready multi-agent orchestration platform with visual workflow building, real-time execution tracking, and enterprise integrations.

> **📋 Project Status:** ✅ **COMPLETE** - Full-Featured Enterprise Platform
> **🎯 Version:** 1.0.0 - Production Ready

## 🚀 Quick Start

### One-Command Startup

```bash
./start.sh
```

This will:
- Install all dependencies (backend & frontend)
- Start backend server on port 8000
- Start frontend server on port 3000
- Open the application in your browser

**Stop Services:**
```bash
./stop.sh
```

### Manual Setup

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

## 🌐 Access Points

Once started, access the application at:

- **Web Application:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

### Demo Users

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@acme.com | admin123 |
| 💻 Developer | dev@acme.com | dev123 |
| ⚙️ Operator | ops@acme.com | ops123 |

## ✨ Key Features

### 🎨 Visual Workflow Builder
- **Drag-and-drop** canvas with React Flow
- **6 node types:** Agent, Conditional, Router, API Call, Default Inputs, A2A
- **Real-time execution visualization** with animated status indicators
- **Keyboard shortcuts:** Cmd+S (save), Cmd+Z (undo), Cmd+Shift+Z (redo), Delete (remove node)
- **Zoom controls** and minimap for large workflows
- **Agent configuration** panel with dropdown selection

### 🤖 12+ Pre-Built Enterprise Agents

**Sales & CRM:**
- Salesforce Agent
- Sales Intelligence Agent
- Email Outreach Agent

**HR & People:**
- Darwinbox HR Agent
- Outlook Calendar Agent

**Project Management:**
- Jira Agent

**Communication:**
- Slack Agent

**Knowledge & AI:**
- RAG Knowledge Agent
- AI Assistant Agent
- Supervisor Agent

See [docs/guides/AGENT_CATALOG.md](docs/guides/AGENT_CATALOG.md) for complete details.

### 📊 Analytics Dashboard
- Real-time execution metrics
- Cost and token usage tracking
- Success/failure rate charts (Recharts)
- Recent executions timeline
- Agent performance analytics

### 📚 Workflow Templates
**6 Built-in Templates:**
1. Automated Sales Outreach
2. Employee Onboarding Workflow
3. Customer Support Automation
4. Document Intelligence & RAG
5. Lead Qualification Pipeline
6. Expense Report Processing

### 💬 Conversational Interface
- Chat with AI to execute workflows
- Direct workflow execution from chat
- Execution tracking in conversation
- View execution details with one click

### 🔍 Execution Management
- List all workflow executions
- View detailed execution logs
- Agent-level result inspection
- Real-time status updates
- Filter by workflow or status

### 📁 Knowledge Base (RAG)
- Upload documents for semantic search
- ChromaDB vector storage
- Document management interface
- Context-aware agent responses

### 🎭 Agent Library
- Browse all available agents
- Grid/List view toggle
- Sort by name, category, or relevance
- Search and filter capabilities
- View agent capabilities and descriptions

## 🏗️ Architecture

### Backend (FastAPI + Python)
```
/backend
  /agents           - 12+ agent implementations
  /connectors       - Enterprise system integrations
  /database         - SQLite models and schemas
  /orchestrator     - LangGraph execution engine
  /routers          - REST API endpoints
  /data             - Mock data and ChromaDB storage
  main.py           - FastAPI application entry
```

### Frontend (React + Material-UI)
```
/frontend
  /src
    /api            - API client with interceptors
    /components     - Reusable React components
      /workflow     - Workflow builder components
      /common       - Layout, Sidebar, Navigation
    /pages          - Main application pages
      Dashboard.js            - Analytics dashboard
      WorkflowBuilder.js      - Visual workflow canvas
      Templates.js            - Template library
      Workflows.js            - Workflow list
      Executions.js           - Execution history
      AgentLibrary.js         - Agent browser
      AgentManager.js         - Agent CRUD
      Chat.js                 - Conversational interface
      KnowledgeBase.js        - Document management
      Analytics.js            - Advanced analytics
    /theme          - MUI theme configuration
```

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI 0.104+
- **Database:** SQLite with SQLAlchemy ORM
- **Orchestration:** LangGraph for workflow execution
- **AI/LLM:** LangChain + OpenAI GPT-4
- **Vector Store:** ChromaDB (local)
- **Auth:** JWT tokens with bcrypt
- **RBAC:** Admin, Developer, Operator roles

### Frontend
- **Framework:** React 18
- **UI Library:** Material-UI (MUI) v5
- **State Management:** TanStack Query (React Query)
- **Workflow Canvas:** React Flow
- **Charts:** Recharts
- **HTTP Client:** Axios with interceptors
- **Routing:** React Router v6

## 📖 Project Structure

```
superAgent/
├── backend/              # FastAPI backend
│   ├── agents/          # Agent implementations
│   ├── connectors/      # Enterprise integrations
│   ├── database/        # SQLite models
│   ├── orchestrator/    # LangGraph engine
│   ├── routers/         # API endpoints
│   ├── data/            # ChromaDB + mock data
│   └── main.py          # App entry point
├── frontend/            # React frontend
│   └── src/
│       ├── api/         # API client
│       ├── components/  # React components
│       ├── pages/       # Application pages
│       └── theme/       # MUI theme
├── docs/                # Documentation
├── scripts/             # Utility scripts
├── start.sh            # Startup script
├── stop.sh             # Shutdown script
└── README.md           # This file
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

### Setup & Getting Started
- [docs/setup/QUICKSTART.md](docs/setup/QUICKSTART.md) - Quick start guide
- [docs/setup/SETUP.md](docs/setup/SETUP.md) - Detailed setup instructions
- [docs/setup/STARTUP_GUIDE.md](docs/setup/STARTUP_GUIDE.md) - Startup scripts guide

### Guides
- [docs/guides/AGENT_CATALOG.md](docs/guides/AGENT_CATALOG.md) - Complete agent reference
- [docs/guides/ADDING_AGENTS.md](docs/guides/ADDING_AGENTS.md) - How to create custom agents
- [docs/guides/AGENT_CREATION_GUIDE.md](docs/guides/AGENT_CREATION_GUIDE.md) - Step-by-step agent development
- [docs/guides/EXAMPLE_WORKFLOWS.md](docs/guides/EXAMPLE_WORKFLOWS.md) - Sample workflow patterns

### Architecture
- [docs/architecture/PRD.md](docs/architecture/PRD.md) - Product requirements document
- [docs/architecture/FRONTEND_ARCHITECTURE.md](docs/architecture/FRONTEND_ARCHITECTURE.md) - Frontend design
- [docs/architecture/EXTENSIBILITY.md](docs/architecture/EXTENSIBILITY.md) - Extension patterns
- [docs/VISUAL_BUILDER_IMPLEMENTATION.md](docs/VISUAL_BUILDER_IMPLEMENTATION.md) - Workflow builder details

### Progress & Testing
- [docs/progress/PROGRESS.md](docs/progress/PROGRESS.md) - Development timeline
- [docs/testing/TEST_RESULTS.md](docs/testing/TEST_RESULTS.md) - Test coverage
- [PHASE2_PROGRESS.md](PHASE2_PROGRESS.md) - Phase 2 completion status

## 🎯 Use Cases

### Sales Automation
- Lead qualification and scoring
- Automated outreach campaigns
- CRM data enrichment
- Deal pipeline management

### HR Automation
- Employee onboarding workflows
- Leave request processing
- Performance review scheduling
- Expense report approval

### Customer Support
- Ticket routing and triage
- Knowledge base search
- Automated responses
- Escalation workflows

### Document Processing
- Document upload and indexing
- Semantic search with RAG
- Information extraction
- Summary generation

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **RBAC** with granular permissions
- **Multi-tenancy** support (org_id, team_id)
- **Audit logging** for security events
- **Input validation** with Pydantic
- **CORS** configuration
- **Environment-based** secrets management

## 🚦 Development Status

### ✅ Completed Features

#### Phase 1: Foundation (Complete)
- [x] FastAPI backend with SQLite
- [x] JWT authentication & RBAC
- [x] 12+ enterprise agents
- [x] LangGraph orchestration engine
- [x] ChromaDB RAG integration
- [x] React frontend foundation
- [x] MUI theme and components

#### Phase 2: UI Enhancement (Complete)
- [x] Visual workflow builder with React Flow
- [x] Real-time execution visualization
- [x] Analytics dashboard with charts
- [x] Workflow template library
- [x] Agent library browser
- [x] Chat interface integration
- [x] Knowledge base management
- [x] Execution history viewer

#### Phase 3: Advanced Features (Complete)
- [x] Keyboard shortcuts
- [x] Zoom controls and minimap
- [x] Grid/List view toggles
- [x] Search and filtering
- [x] Snackbar notifications
- [x] Agent configuration panel
- [x] Template-based workflow creation
- [x] Direct workflow execution from chat

## 🤝 Contributing

See [docs/guides/ADDING_AGENTS.md](docs/guides/ADDING_AGENTS.md) for how to contribute new agents.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with:
- [FastAPI](https://fastapi.tiangolo.com/)
- [LangChain](https://www.langchain.com/)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [React](https://react.dev/)
- [Material-UI](https://mui.com/)
- [React Flow](https://reactflow.dev/)
- [ChromaDB](https://www.trychroma.com/)

---

**🚀 Ready to build multi-agent workflows? Run `./start.sh` and start building!**
