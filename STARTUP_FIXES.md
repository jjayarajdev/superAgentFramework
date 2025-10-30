# Start Script Fixes - SuperAgent Framework

## Issues Fixed in `start.sh`

### ✅ **1. Fixed Frontend Log Path (Line 244)**
**Problem:** Frontend logs were being written to wrong path `../storage/logs/frontend.log`
**Fix:** Changed to `$SCRIPT_DIR/storage/logs/frontend.log` for absolute path

### ✅ **2. Added Proper Frontend Health Check**
**Problem:** Script only waited 10 seconds without verifying frontend actually started
**Fix:** Added 60-second health check loop that polls `http://localhost:3000` and shows progress

**New behavior:**
- Checks every second if frontend is responsive
- Shows progress message every 5 seconds
- Shows error message with log tail if frontend fails to start
- Provides helpful recovery instructions

### ✅ **3. Created Required Directories**
**Problem:** `storage/logs/` and `.runtime/` directories didn't exist, causing file write errors
**Fix:** Added `mkdir -p` commands to create:
- `backend/storage/logs/`
- `storage/logs/` (root level)
- `.runtime/` (for PID files)

### ✅ **4. Fixed PID File Paths**
**Problem:** Backend PID was saved to `../.runtime/backend.pid` (relative path)
**Fix:** Changed to `$SCRIPT_DIR/.runtime/backend.pid` and `$SCRIPT_DIR/.runtime/frontend.pid`

### ✅ **5. Increased Node.js Memory Limit**
**Problem:** React dev server crashes due to memory pressure
**Fix:** Added `NODE_OPTIONS="--max-old-space-size=4096"` (4GB limit) before starting frontend

## Testing the Fixes

```bash
# Stop all services first
./stop.sh

# Start with fixed script
./start.sh
```

**Expected output:**
- ✅ Backend starts within 3 seconds
- ✅ Frontend compiles within 60 seconds
- ✅ Both health checks pass
- ✅ No log file errors
- ✅ Browser opens automatically

## Preventing "ERR_CONNECTION_REFUSED" Errors

### Root Causes Addressed:

1. **Frontend Silent Failures** - Now detected with health check
2. **Log Directory Missing** - Created automatically
3. **Memory Crashes** - Increased Node memory limit
4. **No Error Visibility** - Shows logs on failure

### Best Practices Going Forward:

**Always use `./stop.sh` before `./start.sh`:**
```bash
./stop.sh && ./start.sh
```

**Check logs if issues persist:**
```bash
# Backend logs
tail -f backend/storage/logs/backend.log

# Frontend logs
tail -f storage/logs/frontend.log
```

**Manual recovery if needed:**
```bash
# Kill all processes
./stop.sh

# Start backend only
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# In another terminal, start frontend
cd frontend && NODE_OPTIONS="--max-old-space-size=4096" npm start
```

## System Requirements

**Minimum recommended:**
- RAM: 8GB (4GB for Node.js, rest for OS/other apps)
- Node.js: v14+ (v16+ recommended)
- Python: 3.8+
- Disk space: 2GB free (for node_modules + dependencies)

## Current Status

✅ **Both services are running:**
- Backend: http://localhost:8000 (healthy)
- Frontend: http://localhost:3000 (compiled successfully)
- Chat UI: http://localhost:3000/chat (ready)

**The improved start script will now:**
- Create all required directories
- Verify both services actually start
- Show clear error messages if something fails
- Prevent silent failures
- Handle memory issues better
