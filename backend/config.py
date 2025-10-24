"""
Configuration management for Super Agent Framework.
Handles environment-specific settings.
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # API
    API_TITLE: str = "Super Agent Framework API"
    API_VERSION: str = "0.1.0"
    API_PREFIX: str = "/api/v1"

    # Database (SQLite by default - no server needed!)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./super_agent.db"  # Simple file-based database
    )
    DATABASE_POOL_SIZE: int = int(os.getenv("DATABASE_POOL_SIZE", "5"))  # Lower for SQLite
    DATABASE_MAX_OVERFLOW: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "10"))

    # Redis (for Celery and caching)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Authentication
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # Change in production!
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]

    # Secrets Vault (Optional - HashiCorp Vault)
    VAULT_URL: Optional[str] = os.getenv("VAULT_URL")
    VAULT_TOKEN: Optional[str] = os.getenv("VAULT_TOKEN")
    VAULT_ENABLED: bool = os.getenv("VAULT_ENABLED", "false").lower() == "true"

    # LLM Configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")

    # Monitoring
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN")
    SENTRY_ENABLED: bool = os.getenv("SENTRY_ENABLED", "false").lower() == "true"

    # Feature Flags
    ENABLE_AUTH: bool = os.getenv("ENABLE_AUTH", "true").lower() == "true"
    ENABLE_MULTI_TENANCY: bool = os.getenv("ENABLE_MULTI_TENANCY", "true").lower() == "true"
    ENABLE_AUDIT_LOGGING: bool = os.getenv("ENABLE_AUDIT_LOGGING", "true").lower() == "true"

    # Resource Limits
    MAX_WORKFLOW_EXECUTIONS_PER_HOUR: int = int(os.getenv("MAX_WORKFLOW_EXECUTIONS_PER_HOUR", "100"))
    MAX_AGENTS_PER_WORKFLOW: int = int(os.getenv("MAX_AGENTS_PER_WORKFLOW", "50"))

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()


def get_database_url_for_env(env: str) -> str:
    """Get database URL for specific environment."""
    urls = {
        "development": "sqlite:///./super_agent_dev.db",
        "test": "sqlite:///./super_agent_test.db",
        "staging": os.getenv("STAGING_DATABASE_URL", "sqlite:///./super_agent_staging.db"),
        "production": os.getenv("PRODUCTION_DATABASE_URL", "sqlite:///./super_agent_prod.db"),
    }
    return urls.get(env, urls["development"])
