#!/bin/bash

echo "🧪 Testing Super Agent Framework Setup..."
echo ""

# Check if backend is running
echo "1. Testing backend API..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   ✅ Backend is running at http://localhost:8000"
else
    echo "   ❌ Backend is not running. Start it with: cd backend && python main.py"
    exit 1
fi

# Check connectors endpoint
echo ""
echo "2. Testing connectors endpoint..."
CONNECTORS=$(curl -s http://localhost:8000/api/v1/connectors)
if echo "$CONNECTORS" | grep -q "sfdc"; then
    echo "   ✅ Connectors endpoint working"
    echo "   Found: $(echo "$CONNECTORS" | grep -o '"name":"[^"]*"' | wc -l) connectors"
else
    echo "   ❌ Connectors endpoint failed"
fi

# Check agent types
echo ""
echo "3. Testing agent types endpoint..."
AGENTS=$(curl -s http://localhost:8000/api/v1/agents/types)
if echo "$AGENTS" | grep -q "sales_intelligence"; then
    echo "   ✅ Agent types endpoint working"
    echo "   Found: $(echo "$AGENTS" | grep -o '"id":"[^"]*"' | wc -l) agent types"
else
    echo "   ❌ Agent types endpoint failed"
fi

# Check frontend
echo ""
echo "4. Testing frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running at http://localhost:3000"
else
    echo "   ⚠️  Frontend is not running. Start it with: cd frontend && npm start"
fi

echo ""
echo "✨ Setup test complete!"
echo ""
echo "Next steps:"
echo "  - Open http://localhost:8000/docs for API documentation"
echo "  - Open http://localhost:3000 for the frontend"
echo "  - See SETUP.md for detailed instructions"
