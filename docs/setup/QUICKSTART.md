# 🚀 Quick Start Guide - SQLite Edition

## Get Started in 2 Minutes! ⚡

**No database server required!** The Super Agent Framework now uses SQLite by default - a simple file-based database that requires zero configuration.

---

## Prerequisites

Only **Python 3.10+** is required. That's it!

```bash
python --version  # Should be 3.10 or higher
```

---

## Installation (3 Simple Steps)

### 1️⃣ Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- FastAPI & SQLAlchemy (already includes SQLite support!)
- Authentication libraries (JWT, bcrypt)
- All agent dependencies

**No PostgreSQL installation needed!** 🎉

### 2️⃣ Initialize Database

```bash
python scripts/init_db.py
```

**Output:**
```
🗄️  Using SQLite database (file-based, no server required)
🔧 Initializing Super Agent Framework database...

✅ Database tables created successfully
🌱 Seeding demo data...
  ✅ Created organization: Acme Corporation (org_demo)
  ✅ Created 3 teams
  ✅ Created 4 users

📝 Demo User Credentials:
  - admin@acme.com / admin123 (Admin)
  - dev@acme.com / dev123 (Developer)
  - ops@acme.com / ops123 (Operator)
  - sales@acme.com / sales123 (Sales Developer)

  ✅ Created 2 workflows
  ✅ Created 2 executions

✅ Demo data seeded successfully!
```

This creates a file called `super_agent.db` containing all your data.

### 3️⃣ Start the Backend

```bash
uvicorn main:app --reload
```

**Output:**
```
============================================================
🚀 Starting Super Agent Framework...
============================================================
  📋 Environment: development
  🔐 Auth Enabled: True
  🏢 Multi-tenancy: True
  📊 Audit Logging: True

  🗄️  Initializing SQLite database...
  ✅ Database initialized

============================================================
✅ Super Agent Framework ready!
============================================================
  📖 API Docs: http://localhost:8000/docs
  🔍 Health: http://localhost:8000/health

  👤 Demo Users:
     - admin@acme.com / admin123 (Admin)
     - dev@acme.com / dev123 (Developer)
     - ops@acme.com / ops123 (Operator)
============================================================
```

**Done!** Your API is running at http://localhost:8000 🎉

---

## Test It Out

### 1. Open API Docs

Visit **http://localhost:8000/docs** in your browser

You'll see the Swagger UI with all available endpoints.

### 2. Test Authentication

#### Register a New User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "mypassword123",
    "full_name": "Test User",
    "organization_name": "Test Company"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user_abc123",
    "email": "test@example.com",
    "username": "testuser",
    "role": "admin",
    "permissions": ["workflows.create", "workflows.execute", ...]
  }
}
```

#### Login with Demo User

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@acme.com&password=admin123"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user_admin",
    "email": "admin@acme.com",
    "username": "admin",
    "full_name": "Admin User",
    "role": "admin"
  }
}
```

#### Get Your Profile

```bash
# Replace <TOKEN> with the access_token from login
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "id": "user_admin",
  "email": "admin@acme.com",
  "username": "admin",
  "full_name": "Admin User",
  "role": "admin",
  "org_id": "org_demo",
  "team_id": "team_eng",
  "permissions": [
    "workflows.create",
    "workflows.read",
    "workflows.update",
    ...
  ]
}
```

### 3. List Agents

```bash
curl http://localhost:8000/api/v1/agents/types
```

**Response:** List of all available agents (Sales Intelligence, Email Outreach, Slack, etc.)

---

## Database File

### Location

The database is stored in a single file:
```
backend/super_agent.db
```

### Size

- Initial: ~188 KB
- Grows as you add workflows, executions, etc.
- No maintenance required!

### Backup

Just copy the file:
```bash
cp super_agent.db super_agent_backup.db
```

### Reset

Delete the file and re-initialize:
```bash
rm super_agent.db
python scripts/init_db.py
```

---

## Features Included

✅ **Multi-Tenancy** - Organizations, teams, users
✅ **Authentication** - JWT tokens with login/register
✅ **Authorization** - Role-based access control (Admin, Developer, Operator, Viewer)
✅ **Audit Logging** - All actions tracked for security
✅ **Persistent Storage** - All data saved to SQLite file
✅ **Data Isolation** - Organizations can't see each other's data
✅ **Demo Data** - Pre-loaded workflows and users for testing

---

## Demo Users & Organizations

### Organization: Acme Corporation

**Teams:**
- Sales Team
- Engineering Team
- Operations Team

**Users:**

| Email | Password | Role | Team | Permissions |
|-------|----------|------|------|-------------|
| admin@acme.com | admin123 | Admin | Engineering | Full access |
| dev@acme.com | dev123 | Developer | Engineering | Create/edit workflows & agents |
| ops@acme.com | ops123 | Operator | Operations | Execute workflows only |
| sales@acme.com | sales123 | Developer | Sales | Create/edit workflows |

### Pre-loaded Workflows

1. **Sales Outreach Pipeline**
   - Find Q4 deals over $100K
   - Send personalized follow-up emails
   - 25 executions (23 successful)

2. **HR Employee Lookup**
   - Search employees by department
   - Post results to Slack
   - 15 executions (all successful)

---

## Configuration

### Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

**Default settings** (in `.env`):
```env
# Database (SQLite - no changes needed!)
DATABASE_URL=sqlite:///./super_agent.db

# Auth enabled by default
ENABLE_AUTH=true
ENABLE_MULTI_TENANCY=true
ENABLE_AUDIT_LOGGING=true

# Token expiration
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Disable Authentication (for testing)

Edit `.env`:
```env
ENABLE_AUTH=false
ENABLE_MULTI_TENANCY=false
```

Now all endpoints work without tokens (great for quick testing).

---

## Start Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm start
```

Frontend will run at **http://localhost:3000**

---

## Troubleshooting

### Issue: "No such file or directory: super_agent.db"

**Solution:** Run the initialization script:
```bash
python scripts/init_db.py
```

### Issue: "Token has expired"

**Solution:** Login again to get a new token. Tokens expire after 30 minutes by default.

### Issue: "Permission denied"

**Solution:** Make sure you're logged in as a user with the right role:
- **Admin** - Can do everything
- **Developer** - Can create/edit workflows and agents
- **Operator** - Can only execute workflows
- **Viewer** - Read-only access

### Issue: Database is locked

**Solution:** Make sure only one backend instance is running. SQLite doesn't support multiple concurrent writers well.

For high-concurrency production use, switch to PostgreSQL:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/super_agent_prod
```

---

## Database Inspection

### Using SQLite CLI

```bash
# Open database
sqlite3 super_agent.db

# List tables
.tables

# View users
SELECT email, username, role FROM users;

# View organizations
SELECT name, billing_plan, max_workflows FROM organizations;

# View workflows
SELECT id, name, team_id FROM workflows;

# Exit
.quit
```

### Using DB Browser for SQLite

1. Download from https://sqlitebrowser.org/
2. Open `super_agent.db`
3. Browse tables, run queries, etc.

---

## Upgrading to PostgreSQL (Optional)

For production deployments with high concurrency, you can upgrade to PostgreSQL:

### 1. Install PostgreSQL

```bash
# Mac
brew install postgresql
brew services start postgresql

# Linux
sudo apt install postgresql
sudo systemctl start postgresql
```

### 2. Create Database

```bash
createdb super_agent_prod
```

### 3. Update Configuration

Edit `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/super_agent_prod
```

### 4. Install PostgreSQL Driver

Uncomment in `requirements.txt`:
```
psycopg2-binary==2.9.9
```

Then:
```bash
pip install psycopg2-binary
```

### 5. Migrate Data

```bash
# Initialize PostgreSQL database
python scripts/init_db.py

# Your SQLite data remains in super_agent.db
# You can migrate manually or start fresh
```

---

## Next Steps

### 1. Explore the API

Visit **http://localhost:8000/docs** to see all available endpoints:
- `/api/v1/auth/*` - Authentication
- `/api/v1/workflows/*` - Workflow management
- `/api/v1/executions/*` - Execute workflows
- `/api/v1/agents/*` - Agent management
- `/api/v1/examples/*` - Example workflows

### 2. Create Your First Workflow

Use the frontend Workflow Builder or API to create a custom workflow.

### 3. Test Example Workflows

```bash
# List available examples
curl http://localhost:8000/api/v1/examples/

# Run all examples
curl -X POST http://localhost:8000/api/v1/examples/run-all
```

### 4. Integrate with Your App

Use the JWT token in your app's Authorization header:
```javascript
const token = localStorage.getItem('access_token');

fetch('http://localhost:8000/api/v1/workflows/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Summary

**What You Get Out of the Box:**

✅ **Zero Configuration** - SQLite works instantly
✅ **Secure Authentication** - JWT tokens with bcrypt password hashing
✅ **Multi-Tenancy** - Multiple organizations in one database
✅ **RBAC** - 4 roles with fine-grained permissions
✅ **Audit Logging** - Track all security events
✅ **Demo Data** - Ready-to-use workflows and users
✅ **REST API** - Complete API with Swagger docs
✅ **Persistent Storage** - All data saved automatically

**Time to Get Started:**
- Setup: **2 minutes** ⚡
- First API call: **30 seconds** 🚀
- Deploy to production: **5 minutes** (just copy the .db file!)

**Perfect For:**
- ✅ Development and testing
- ✅ Small deployments (< 100 concurrent users)
- ✅ Demos and prototypes
- ✅ Edge deployments
- ✅ Embedded applications

**Upgrade to PostgreSQL when you need:**
- High concurrency (100+ simultaneous users)
- Database replication
- Advanced database features
- Enterprise scalability

---

**🎉 You're all set! Start building multi-agent workflows now!**

For questions or issues, check the full documentation in `PHASE1_IMPLEMENTATION.md`.
