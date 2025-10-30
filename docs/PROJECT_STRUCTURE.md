# SuperAgent Framework - Project Structure Guide

## 📁 Directory Organization

This document defines the standard file organization for the SuperAgent Framework project.

### **Root Level Structure**

```
superAgent/
├── README.md                    # Main project README (ONLY .md file in root)
├── .gitignore                   # Git ignore configuration
├── start.sh                     # Startup script
├── stop.sh                      # Shutdown script
├── docs/                        # All documentation
├── assets/                      # Images, screenshots, etc.
├── scripts/                     # Utility scripts
├── backend/                     # Python FastAPI backend
├── frontend/                    # React frontend
└── .runtime/                    # Runtime files (gitignored)
```

## 📝 Documentation Rules

### **ALL markdown documentation must be in `docs/` directory**

**Exception:** Only `README.md` stays in project root

### Documentation Categories:

```
docs/
├── README.md                    # Documentation index
├── setup/                       # Installation & setup guides
├── architecture/                # System design & architecture
├── guides/                      # Developer guides & tutorials
├── progress/                    # Project milestones & progress
└── testing/                     # Test results & QA documentation
```

### **When Creating New Documentation:**

1. ✅ **DO**: Place all `.md` files in appropriate `docs/` subdirectory
2. ✅ **DO**: Update `docs/README.md` index with link to new doc
3. ❌ **DON'T**: Create `.md` files in project root (except README.md)
4. ❌ **DON'T**: Create docs in backend/frontend without good reason

### **Backend-Specific Documentation**

Backend implementation docs can go in `backend/docs/`:
- Agent-specific architecture (e.g., `DARWINBOX_ARCHITECTURE.md`)
- Backend API implementation details
- Database schema documentation

## 🗄️ Runtime Data & Storage

### **All runtime data must be gitignored**

```
backend/storage/                 # ← All gitignored
├── database/                    # SQLite database files
│   └── super_agent.db
├── logs/                        # Backend log files
│   └── backend.log
├── rag/                         # RAG vector store
│   └── chroma/
└── uploads/                     # Uploaded documents

frontend/storage/                # ← All gitignored
└── logs/
    └── frontend.log

.runtime/                        # ← All gitignored
├── backend.pid
└── frontend.pid
```

### **Configuration Updates Required:**

When creating new storage paths:
1. Update `backend/config.py` with new path
2. Update `.gitignore` to exclude runtime data
3. Create directory structure in startup scripts

## 🖼️ Assets Organization

```
assets/
└── screenshots/                 # UI screenshots, demo images
    └── *.png
```

- All images/screenshots go in `assets/`
- Keep assets organized by type
- Don't commit large binary files unless necessary

## 🔧 Scripts Organization

```
scripts/
└── *.sh                        # Utility scripts
└── *.py                        # Setup/maintenance scripts
```

- Keep utility scripts separate from project code
- Document script purpose in header comments

## 📦 Backend Structure

```
backend/
├── main.py                     # FastAPI entry point
├── config.py                   # Configuration
├── requirements.txt            # Python dependencies
│
├── agents/                     # Agent implementations
├── auth/                       # Authentication & RBAC
├── database/                   # SQLAlchemy models
├── routers/                    # API endpoints
├── services/                   # Business logic
├── orchestrator/               # Workflow engine
├── rag/                        # RAG system
├── models/                     # Pydantic models
├── connectors/                 # External API connectors
├── scripts/                    # Backend utilities
├── tests/                      # Backend tests
├── data/                       # Seed data & mocks
├── docs/                       # Backend-specific docs
│
└── storage/                    # Runtime data (gitignored)
    ├── database/
    ├── logs/
    ├── rag/
    └── uploads/
```

## 🎨 Frontend Structure

```
frontend/
├── package.json
├── public/
└── src/
    ├── api/                    # API client layer
    ├── components/             # Reusable components
    ├── pages/                  # Page components
    ├── context/                # React context
    ├── hooks/                  # Custom hooks
    ├── theme/                  # MUI theme
    └── utils/                  # Utilities
```

## 🚫 .gitignore Rules

The following are automatically gitignored:

```gitignore
# Runtime data
backend/storage/
frontend/storage/
.runtime/
*.log
*.pid

# Databases
*.db
*.db-journal

# Python
__pycache__/
venv/
*.pyc

# Node
node_modules/
```

## ✅ Best Practices

### **When Adding New Features:**

1. **Code**: Place in appropriate backend/frontend directory
2. **Documentation**: Create `.md` in `docs/` subdirectory
3. **Assets**: Place screenshots in `assets/screenshots/`
4. **Tests**: Place in `backend/tests/` or `frontend/src/__tests__/`
5. **Scripts**: Place utility scripts in `scripts/`

### **When Writing Documentation:**

1. Choose correct `docs/` subdirectory
2. Use descriptive filenames (e.g., `AGENT_CREATION_GUIDE.md`)
3. Update `docs/README.md` index
4. Include table of contents for long documents
5. Use relative links to other docs

### **When Creating Runtime Files:**

1. Always use `storage/` directories
2. Never commit runtime data to git
3. Update `.gitignore` if creating new runtime paths
4. Document storage structure in `config.py`

## 🔄 Migration from Old Structure

If you find `.md` files outside `docs/`:

```bash
# Move to appropriate docs/ subdirectory
mv SOME_GUIDE.md docs/guides/

# Update docs/README.md with new link

# Commit the changes
```

## 📞 Questions?

- Check `docs/README.md` for documentation index
- Review existing structure before creating new directories
- When in doubt, follow the patterns shown above
