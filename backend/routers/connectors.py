"""
Connectors API router.
"""
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()


@router.get("/")
async def list_connectors() -> Dict[str, List[Dict[str, Any]]]:
    """List available connectors."""
    connectors = [
        {
            "id": "sfdc",
            "name": "Salesforce",
            "type": "mock",
            "description": "Mock Salesforce connector for demo",
            "operations": ["read"],
            "objects": ["Account", "Contact", "Opportunity"],
            "icon": "salesforce"
        },
        {
            "id": "outlook",
            "name": "Outlook",
            "type": "mock",
            "description": "Mock Outlook/Email connector for demo",
            "operations": ["read", "write"],
            "features": ["send_email", "read_email"],
            "icon": "email"
        },
        {
            "id": "darwinbox",
            "name": "Darwinbox (HR)",
            "type": "mock",
            "description": "Mock HR system connector for demo",
            "operations": ["read"],
            "objects": ["Employee", "Department"],
            "icon": "users"
        },
        {
            "id": "rest_api",
            "name": "Generic REST API",
            "type": "generic",
            "description": "Generic REST API connector",
            "operations": ["read", "write"],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "icon": "api"
        }
    ]

    return {"connectors": connectors}


@router.get("/{connector_id}/schema")
async def get_connector_schema(connector_id: str):
    """Get connector input/output schema."""
    schemas = {
        "sfdc": {
            "input_schema": {
                "object_type": "string (Account|Contact|Opportunity)",
                "filters": "object (optional)"
            },
            "output_schema": {
                "type": "array",
                "items": "object"
            }
        },
        "outlook": {
            "input_schema": {
                "recipient": "string",
                "subject": "string",
                "body": "string",
                "cc": "array (optional)",
                "attachments": "array (optional)"
            },
            "output_schema": {
                "message_id": "string",
                "sent": "boolean",
                "timestamp": "string"
            }
        },
        "darwinbox": {
            "input_schema": {
                "filters": "object (optional)"
            },
            "output_schema": {
                "type": "array",
                "items": "object"
            }
        }
    }

    return schemas.get(connector_id, {"error": "Schema not found"})
