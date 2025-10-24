# Setup Guide - Super Agent Framework

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file (optional)
cp .env.example .env

# Start the backend server
python main.py
```

The backend API will start at **http://localhost:8000**

API documentation available at: **http://localhost:8000/docs**

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start at **http://localhost:3000**

## Verify Installation

1. Open http://localhost:8000/docs in your browser - you should see the FastAPI documentation
2. Open http://localhost:3000 in your browser - you should see the Super Agent Framework welcome screen
3. Check that the API status shows "healthy"

## What's Included (Week 1)

### Backend
- ✅ FastAPI server with 5 API routers
- ✅ Mock data generators:
  - 50 SFDC opportunities
  - 20 accounts
  - 30 contacts
  - 100 Darwinbox employees
  - Email templates
- ✅ REST API endpoints:
  - `/api/v1/workflows` - Workflow CRUD
  - `/api/v1/executions` - Workflow execution
  - `/api/v1/connectors` - Connector list and schemas
  - `/api/v1/documents` - Document upload for RAG
  - `/api/v1/agents` - Agent types

### Frontend
- ✅ Basic React app scaffold
- ✅ API health check
- ✅ Project structure ready for Week 2-5 features

## Next Steps (Week 2)

- Implement multi-agent orchestrator
- Build SalesIntelligence and EmailOutreach agents
- Integrate mock connectors with agents
- Add token tracking and cost calculation

## Troubleshooting

**Backend won't start:**
- Check Python version: `python --version` (should be 3.11+)
- Make sure virtual environment is activated
- Try `pip install --upgrade pip` then reinstall requirements

**Frontend won't start:**
- Check Node version: `node --version` (should be 18+)
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Make sure backend is running first (proxy requires it)

**Port already in use:**
- Backend: Change port in `main.py`: `uvicorn.run(..., port=8001)`
- Frontend: Set `PORT=3001` before running `npm start`

## Testing the API

### List Connectors
```bash
curl http://localhost:8000/api/v1/connectors
```

### Get Agent Types
```bash
curl http://localhost:8000/api/v1/agents/types
```

### Create a Workflow (requires JSON payload)
See API docs at http://localhost:8000/docs for interactive testing

## Demo Data

All data is generated on backend startup using the Faker library.

To reset demo data, restart the backend server.

Mock data includes:
- Fictional company names (Acme Corp, Globex, Initech, etc.)
- Realistic opportunity amounts ($10K - $500K)
- Q4 2025 close dates for demo scenario
- Employee records with departments, titles, and performance ratings
- Email templates for check-ins, follow-ups, and proposals

## Development Tips

- Backend auto-reloads on code changes (uvicorn reload mode)
- Frontend auto-reloads on code changes (react-scripts)
- Use `/docs` endpoint for interactive API testing
- Check `PRD.md` for complete implementation plan
