# 🚀 Super Agent Framework - Quick Start Guide

## One-Command Startup

We've created convenient startup scripts to launch both backend and frontend with a single command!

---

## 📋 Quick Start (First Time)

```bash
# Navigate to project directory
cd /Users/jjayaraj/workspaces/studios/superAgent

# Make scripts executable
chmod +x start.sh stop.sh

# Start everything
./start.sh
```

That's it! The script will:
1. ✅ Set up Python virtual environment (if needed)
2. ✅ Install Python dependencies
3. ✅ Initialize SQLite database with demo data
4. ✅ Start backend server (port 8000)
5. ✅ Create React app (if doesn't exist)
6. ✅ Install frontend dependencies
7. ✅ Start frontend server (port 3000)
8. ✅ Open your browser automatically

---

## 🎯 Usage

### Start Both Services
```bash
./start.sh
```

### Stop Both Services
```bash
./stop.sh
```

### View Logs
```bash
# Backend logs
tail -f backend/backend.log

# Frontend logs
tail -f frontend.log

# Or both together (start.sh does this automatically)
```

---

## 🌐 Access Points

Once started, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web application |
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation (Swagger UI) |
| **Health Check** | http://localhost:8000/health | Backend health status |

---

## 👤 Demo Users

Login with these credentials:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| 👑 **Admin** | admin@acme.com | admin123 | Full access (all operations) |
| 💻 **Developer** | dev@acme.com | dev123 | Create/edit workflows, agents |
| ⚙️ **Operator** | ops@acme.com | ops123 | Execute workflows, view results |

---

## 📂 Project Structure

```
superAgent/
├── start.sh              # 🚀 Start script (use this!)
├── stop.sh               # 🛑 Stop script
├── backend/
│   ├── main.py           # FastAPI application
│   ├── .env              # Backend configuration
│   ├── super_agent.db    # SQLite database
│   ├── backend.log       # Backend logs
│   └── scripts/
│       └── init_db.py    # Database initialization
├── frontend/             # React application
│   ├── src/
│   │   ├── App.js
│   │   └── components/
│   │       └── auth/     # Authentication components
│   └── .env              # Frontend configuration
├── frontend_auth_components/  # Auth component templates
└── frontend.log          # Frontend logs
```

---

## 🔧 What the Start Script Does

### Backend Setup:
1. Checks for Python installation
2. Creates/activates virtual environment
3. Installs dependencies from `requirements.txt`
4. Initializes database (if needed) with demo data
5. Creates `.env` from `.env.example` (if needed)
6. Kills any process on port 8000
7. Starts backend server
8. Waits for health check to pass

### Frontend Setup:
1. Checks for Node.js installation
2. Creates React app (if doesn't exist)
3. Installs `react-router-dom`
4. Copies authentication components
5. Creates `.env` with API URL
6. Generates `App.js` with routes
7. Installs npm dependencies
8. Kills any process on port 3000
9. Starts frontend server

---

## 🐛 Troubleshooting

### Port Already in Use
The script automatically kills processes on ports 8000 and 3000. If you get errors:
```bash
# Manually kill processes
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Then restart
./start.sh
```

### Python/Node Not Found
```bash
# Install Python 3.8+
brew install python3  # macOS
# or use your package manager

# Install Node.js 14+
brew install node  # macOS
# or download from nodejs.org
```

### Database Issues
```bash
# Reset database
cd backend
rm super_agent.db
python scripts/init_db.py
```

### Script Permission Denied
```bash
chmod +x start.sh stop.sh
```

### Backend Fails to Start
```bash
# Check logs
cat backend/backend.log

# Common fixes:
cd backend
pip install -r requirements.txt
python scripts/init_db.py
```

### Frontend Fails to Start
```bash
# Check logs
cat frontend.log

# Common fixes:
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🔍 Manual Start (Alternative)

If you prefer to start services manually:

### Backend Only:
```bash
cd backend
source venv/bin/activate  # or .venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Frontend Only:
```bash
cd frontend
npm start
```

---

## 📝 Environment Configuration

### Backend `.env`:
```bash
DATABASE_URL=sqlite:///./super_agent.db
ENABLE_AUTH=true
ENABLE_MULTI_TENANCY=true
ENABLE_AUDIT_LOGGING=true
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend `.env`:
```bash
REACT_APP_API_URL=http://localhost:8000
```

---

## 🎨 Customization

### Change Ports

**Backend:**
Edit `start.sh` and change:
```bash
nohup uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
Edit `start.sh` and change:
```bash
PORT=3000 nohup npm start
```

Don't forget to update `REACT_APP_API_URL` in frontend `.env` if you change backend port!

---

## 📊 Monitoring

### Check if Services are Running:
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000

# Both
ps aux | grep -E "uvicorn|react-scripts"
```

### View Real-Time Logs:
```bash
# Backend logs (with colors)
tail -f backend/backend.log

# Frontend logs
tail -f frontend.log

# Both together
tail -f backend/backend.log frontend.log
```

---

## 🚀 Production Deployment

For production, do NOT use these scripts. Instead:

### Backend:
```bash
# Use gunicorn or production ASGI server
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend:
```bash
# Build production bundle
cd frontend
npm run build

# Serve with nginx or similar
```

---

## 📚 Additional Resources

- **API Documentation:** http://localhost:8000/docs (when running)
- **Testing Results:** See `TESTING_RESULTS.md`
- **Execution Testing:** See `EXECUTION_TESTING_RESULTS.md`
- **Integration Guide:** See `INTEGRATION_COMPLETE.md`

---

## ✨ Tips

1. **Always use the startup script** - It handles all setup automatically
2. **Check logs if something fails** - Logs contain detailed error messages
3. **Use demo users for testing** - They have different permission levels
4. **Reset database anytime** - Just delete `super_agent.db` and restart
5. **Keep scripts up to date** - Pull latest changes before running

---

## 🆘 Need Help?

If you encounter issues:

1. Check the logs: `backend/backend.log` and `frontend.log`
2. Try stopping and restarting: `./stop.sh && ./start.sh`
3. Reset database: `rm backend/super_agent.db` and restart
4. Check if ports are free: `lsof -ti:8000 && lsof -ti:3000`
5. Verify installations: `python3 --version && node --version`

---

**Happy Coding! 🎉**
