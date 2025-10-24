#!/bin/bash

# Super Agent Framework - Startup Script
# Launches both backend and frontend servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "============================================================"
echo "🚀 Super Agent Framework - Starting..."
echo "============================================================"
echo -e "${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Function to kill process on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}⚠️  Killing existing process on port $port${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================================
# BACKEND SETUP
# ============================================================

echo -e "${BLUE}📦 Setting up Backend...${NC}"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found at: $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

# Check for Python
if ! command_exists python3 && ! command_exists python; then
    echo -e "${RED}❌ Python not found. Please install Python 3.8+${NC}"
    exit 1
fi

PYTHON_CMD="python3"
if ! command_exists python3; then
    PYTHON_CMD="python"
fi

# Check if virtual environment exists
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  No virtual environment found. Creating one...${NC}"
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Install dependencies if needed
if [ ! -f "venv/lib/python*/site-packages/fastapi/__init__.py" ] && [ ! -f ".venv/lib/python*/site-packages/fastapi/__init__.py" ]; then
    echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
    pip install -q -r requirements.txt
fi

# Initialize database if it doesn't exist
if [ ! -f "super_agent.db" ]; then
    echo -e "${YELLOW}🗄️  Initializing database...${NC}"
    $PYTHON_CMD scripts/init_db.py
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Using .env.example as template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env from .env.example${NC}"
    fi
fi

# Kill any process on port 8000
kill_port 8000

# Start backend server in background
echo -e "${GREEN}🚀 Starting Backend Server (port 8000)...${NC}"
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check backend.log for details${NC}"
    cat backend.log | tail -20
    exit 1
fi

# ============================================================
# FRONTEND SETUP
# ============================================================

echo ""
echo -e "${BLUE}📦 Setting up Frontend...${NC}"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${YELLOW}⚠️  Frontend directory not found. Creating new React app...${NC}"

    # Check for Node.js and npm
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js not found. Please install Node.js 14+ and npm${NC}"
        echo -e "${YELLOW}Backend is running at http://localhost:8000${NC}"
        echo -e "${YELLOW}API Docs: http://localhost:8000/docs${NC}"
        exit 1
    fi

    cd "$SCRIPT_DIR"
    echo -e "${YELLOW}📦 Creating React app (this may take a few minutes)...${NC}"
    npx create-react-app frontend --quiet

    cd "$FRONTEND_DIR"

    # Install dependencies
    echo -e "${YELLOW}📦 Installing react-router-dom...${NC}"
    npm install --silent react-router-dom

    # Copy auth components
    echo -e "${YELLOW}📋 Copying authentication components...${NC}"
    mkdir -p src/components/auth
    cp -r "$SCRIPT_DIR/frontend_auth_components/"* src/components/auth/

    # Create .env
    echo "REACT_APP_API_URL=http://localhost:8000" > .env

    # Create App.js
    cat > src/App.js << 'APPJS'
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import UserProfile from './components/auth/UserProfile';
import './components/auth/Login.css';
import './components/auth/UserProfile.css';

function Dashboard() {
  return (
    <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
      <UserProfile />
      <div style={{marginTop: '20px'}}>
        <h1>🎉 Welcome to Super Agent Framework!</h1>
        <div style={{background: '#f0f9ff', padding: '20px', borderRadius: '8px', marginTop: '20px'}}>
          <h2>✅ System Ready</h2>
          <p>You are successfully authenticated and connected to the backend.</p>
          <div style={{marginTop: '20px'}}>
            <strong>Quick Links:</strong>
            <ul>
              <li><a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">📖 API Documentation</a></li>
              <li><a href="http://localhost:8000/health" target="_blank" rel="noopener noreferrer">❤️ Health Check</a></li>
            </ul>
          </div>
          <div style={{marginTop: '20px', padding: '15px', background: '#fff', borderRadius: '6px'}}>
            <strong>Demo Users:</strong>
            <ul style={{margin: '10px 0'}}>
              <li>👑 Admin: admin@acme.com / admin123</li>
              <li>💻 Developer: dev@acme.com / dev123</li>
              <li>⚙️ Operator: ops@acme.com / ops123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
APPJS

    echo -e "${GREEN}✅ Frontend setup complete${NC}"
else
    cd "$FRONTEND_DIR"

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install --silent
    fi

    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo "REACT_APP_API_URL=http://localhost:8000" > .env
        echo -e "${GREEN}✅ Created frontend .env${NC}"
    fi
fi

# Kill any process on port 3000
kill_port 3000

# Start frontend server in background
echo -e "${GREEN}🚀 Starting Frontend Server (port 3000)...${NC}"
cd "$FRONTEND_DIR"
BROWSER=none PORT=3000 nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid

echo -e "${YELLOW}⏳ Waiting for frontend to start (this may take 10-30 seconds)...${NC}"
sleep 10

# ============================================================
# FINAL STATUS
# ============================================================

echo ""
echo -e "${GREEN}"
echo "============================================================"
echo "✅ Super Agent Framework is running!"
echo "============================================================"
echo -e "${NC}"
echo ""
echo -e "${BLUE}📊 Services Status:${NC}"
echo -e "  Backend:  ${GREEN}✅ Running${NC} - http://localhost:8000"
echo -e "  Frontend: ${GREEN}✅ Running${NC} - http://localhost:3000"
echo ""
echo -e "${BLUE}📖 Quick Links:${NC}"
echo -e "  🌐 Web App:       ${YELLOW}http://localhost:3000${NC}"
echo -e "  📚 API Docs:      ${YELLOW}http://localhost:8000/docs${NC}"
echo -e "  ❤️  Health Check:  ${YELLOW}http://localhost:8000/health${NC}"
echo ""
echo -e "${BLUE}👤 Demo Users:${NC}"
echo -e "  👑 Admin:      ${YELLOW}admin@acme.com${NC} / ${YELLOW}admin123${NC}"
echo -e "  💻 Developer:  ${YELLOW}dev@acme.com${NC} / ${YELLOW}dev123${NC}"
echo -e "  ⚙️  Operator:   ${YELLOW}ops@acme.com${NC} / ${YELLOW}ops123${NC}"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "  Backend:  ${YELLOW}tail -f $BACKEND_DIR/backend.log${NC}"
echo -e "  Frontend: ${YELLOW}tail -f $SCRIPT_DIR/frontend.log${NC}"
echo ""
echo -e "${BLUE}🛑 To stop all services:${NC}"
echo -e "  ${YELLOW}./stop.sh${NC}"
echo ""
echo -e "${GREEN}🎉 Opening browser in 3 seconds...${NC}"
sleep 3

# Open browser
if command_exists open; then
    open http://localhost:3000
elif command_exists xdg-open; then
    xdg-open http://localhost:3000
else
    echo -e "${YELLOW}⚠️  Please open http://localhost:3000 in your browser${NC}"
fi

echo ""
echo -e "${GREEN}Press Ctrl+C to stop watching logs, or run './stop.sh' to stop all services${NC}"
echo ""

# Tail both logs
trap 'echo ""; echo "Use ./stop.sh to stop all services"; exit 0' INT
tail -f "$BACKEND_DIR/backend.log" &
tail -f "$SCRIPT_DIR/frontend.log" &
wait
