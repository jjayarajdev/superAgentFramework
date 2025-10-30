"""
Super Agent Framework - Backend API
Main entry point for the FastAPI application.

🎯 ENTERPRISE EDITION - Phase 1 Complete:
  ✅ PostgreSQL persistent storage
  ✅ Multi-tenancy (Organization/Team/User)
  ✅ JWT authentication & RBAC
  ✅ Audit logging
  ✅ Data isolation middleware
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys

from config import settings
from routers import workflows, executions, connectors, documents, agents, examples, agent_generator, auth, chat
from auth.middleware import TenantMiddleware

# Conditionally import based on feature flags
if settings.ENABLE_AUTH and settings.ENABLE_MULTI_TENANCY:
    try:
        from database.session import init_db
        from data.seed import seed_demo_data as seed_legacy_demo_data
        print("✅ Using PostgreSQL database (Enterprise Edition)")
        USE_DATABASE = True
    except ImportError as e:
        print(f"⚠️  Database import failed: {e}")
        print("⚠️  Falling back to in-memory mode")
        from data.seed import seed_demo_data
        USE_DATABASE = False
else:
    from data.seed import seed_demo_data
    USE_DATABASE = False
    print("ℹ️  Running in development mode (in-memory storage)")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager - runs on startup and shutdown."""
    print("\n" + "="*60)
    print("🚀 Starting Super Agent Framework...")
    print("="*60)

    print(f"  📋 Environment: {settings.ENVIRONMENT}")
    print(f"  🔐 Auth Enabled: {settings.ENABLE_AUTH}")
    print(f"  🏢 Multi-tenancy: {settings.ENABLE_MULTI_TENANCY}")
    print(f"  📊 Audit Logging: {settings.ENABLE_AUDIT_LOGGING}")

    if USE_DATABASE:
        print("\n  🗄️  Initializing PostgreSQL database...")
        try:
            init_db()
            print("  ✅ Database initialized")

            # Seed legacy demo data (mock SFDC, etc.)
            seed_legacy_demo_data()
            print("  ✅ Legacy demo data seeded (mock APIs)")

        except Exception as e:
            print(f"  ⚠️  Database initialization failed: {e}")
            print("  ℹ️  You may need to run: python scripts/init_db.py")
    else:
        print("\n  📦 Using in-memory storage...")
        seed_demo_data()
        print("  ✅ In-memory demo data seeded")

    print("\n" + "="*60)
    print("✅ Super Agent Framework ready!")
    print("="*60)
    print(f"  📖 API Docs: http://localhost:8000/docs")
    print(f"  🔍 Health: http://localhost:8000/health")

    if USE_DATABASE and settings.ENABLE_AUTH:
        print("\n  👤 Demo Users (PostgreSQL mode):")
        print("     - admin@acme.com / admin123 (Admin)")
        print("     - dev@acme.com / dev123 (Developer)")
        print("     - ops@acme.com / ops123 (Operator)")
        print("\n  🔑 To create database: python backend/scripts/init_db.py")

    print("="*60 + "\n")

    yield

    # Shutdown
    print("\n👋 Shutting down Super Agent Framework...")


app = FastAPI(
    title="Super Agent Framework API - Enterprise Edition",
    description="""
    Multi-agent orchestration platform for enterprise AI workflows.

    🎯 Enterprise Features:
    - Multi-tenancy with organization/team structure
    - JWT authentication & role-based access control
    - PostgreSQL persistent storage
    - Audit logging for compliance
    - Tenant data isolation
    """,
    version="0.2.0-enterprise",
    lifespan=lifespan
)

# ============================================================================
# MIDDLEWARE
# ============================================================================

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tenant middleware (extracts org_id/team_id from JWT)
if settings.ENABLE_MULTI_TENANCY:
    app.add_middleware(TenantMiddleware)

# ============================================================================
# ROUTERS
# ============================================================================

# Authentication (login, register, profile)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])

# Conversational AI
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])

# Core resources
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["Workflows"])
app.include_router(executions.router, prefix="/api/v1/executions", tags=["Executions"])
app.include_router(connectors.router, prefix="/api/v1/connectors", tags=["Connectors"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["Agents"])
app.include_router(examples.router, prefix="/api/v1/examples", tags=["Examples"])
app.include_router(agent_generator.router, prefix="/api/v1/agents", tags=["Agent Generator"])


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "message": "Super Agent Framework API",
        "status": "running",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
