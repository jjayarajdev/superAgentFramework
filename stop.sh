#!/bin/bash

# Super Agent Framework - Stop Script
# Stops both backend and frontend servers

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "============================================================"
echo "🛑 Super Agent Framework - Stopping..."
echo "============================================================"
echo -e "${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"

# Function to kill process on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}🔪 Stopping processes on port $port...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}✅ Stopped port $port${NC}"
    else
        echo -e "${GREEN}✅ No process running on port $port${NC}"
    fi
}

# Kill backend (port 8000)
echo -e "${BLUE}📦 Stopping Backend...${NC}"
if [ -f "$BACKEND_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$BACKEND_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill -9 $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Stopped backend (PID: $BACKEND_PID)${NC}"
    fi
    rm -f "$BACKEND_DIR/backend.pid"
fi
kill_port 8000

# Kill frontend (port 3000)
echo -e "${BLUE}📦 Stopping Frontend...${NC}"
if [ -f "$SCRIPT_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$SCRIPT_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill -9 $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Stopped frontend (PID: $FRONTEND_PID)${NC}"
    fi
    rm -f "$SCRIPT_DIR/frontend.pid"
fi
kill_port 3000

# Kill any remaining node/python processes related to the project
echo -e "${BLUE}🧹 Cleaning up remaining processes...${NC}"
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true

echo ""
echo -e "${GREEN}"
echo "============================================================"
echo "✅ All services stopped successfully!"
echo "============================================================"
echo -e "${NC}"
echo ""
echo -e "${BLUE}📝 Logs preserved at:${NC}"
echo -e "  Backend:  ${YELLOW}$BACKEND_DIR/backend.log${NC}"
echo -e "  Frontend: ${YELLOW}$SCRIPT_DIR/frontend.log${NC}"
echo ""
echo -e "${GREEN}To start again, run: ${YELLOW}./start.sh${NC}"
echo ""
