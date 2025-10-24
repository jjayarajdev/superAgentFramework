"""
Database session management.
Supports both SQLite (default) and PostgreSQL (production).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool, StaticPool
from typing import Generator

from config import settings

# Configure engine based on database type
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite configuration (file-based, no server needed)
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},  # Allow multi-threading
        poolclass=StaticPool,  # Use single connection pool for SQLite
        echo=settings.DEBUG,  # Log SQL in debug mode
    )
    print("🗄️  Using SQLite database (file-based, no server required)")
else:
    # PostgreSQL/MySQL configuration (production)
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=QueuePool,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_pre_ping=True,  # Verify connections before using
        echo=settings.DEBUG,  # Log SQL in debug mode
    )
    print(f"🗄️  Using production database: {settings.DATABASE_URL.split('@')[0].split('://')[0]}")

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI routes to get database session.

    Usage:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database - create all tables.
    Run this on application startup.
    """
    from database.base import Base
    import database.models  # Import models to register them

    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
