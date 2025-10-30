# Adding New Agents - Developer Guide

## Overview

The Super Agent Framework uses a **plugin architecture** that makes adding new agents trivial. You only need to create a single Python file - **no changes to routers, no frontend code, no configuration files**.

## How It Works

1. **Auto-Discovery:** Agents are automatically discovered when imported
2. **Self-Describing:** Each agent declares its own configuration schema
3. **Dynamic UI:** Frontend generates forms automatically from the schema
4. **Registry Pattern:** Central registry tracks all available agents

## Adding a New Agent in 3 Steps

### Step 1: Create Agent File

Create a new file in `backend/agents/` (e.g., `my_new_agent.py`):

```python
from typing import Dict, Any
from pydantic import Field
from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)

# Step 1.1: Define Configuration Schema
class MyAgentConfig(AgentConfigSchema):
    """Configuration for My Agent."""

    api_endpoint: str = Field(
        description="API endpoint to query"
    )
    max_results: int = Field(
        default=10,
        description="Maximum results to return",
        ge=1, le=100
    )
    filter_type: str = Field(
        default="all",
        description="Filter type",
        json_schema_extra={"enum": ["all", "active", "archived"]}
    )

# Step 1.2: Implement Agent Class
@register_agent  # <-- This makes it auto-discoverable!
class MyAgent(BaseAgent):
    """My custom agent."""

    # Metadata
    agent_type = "my_agent"  # Unique ID
    name = "My Custom Agent"
    description = "Does something awesome"
    icon = "star"  # Icon name
    category = AgentCategory.DATA_RETRIEVAL
    supported_connectors = ["my_connector"]
    config_schema = MyAgentConfig

    # Execute method
    async def execute(self, input_data: Any, context: Dict[str, Any]):
        self.log(f"Running my agent with config: {self.config}")

        # Your agent logic here
        result = {"data": "something awesome"}

        return AgentExecutionResult(
            success=True,
            output=result,
            tokens_used=100,  # If using LLM
            cost=0.01
        )
```

### Step 2: Import in `agents/__init__.py`

Add one line to `backend/agents/__init__.py`:

```python
from agents.my_new_agent import MyAgent
```

### Step 3: Done!

That's it! Your agent is now:

✅ Available in `GET /api/v1/agents/types`
✅ Configuration schema at `GET /api/v1/agents/types/my_agent/schema`
✅ Automatically appears in UI agent palette
✅ Configuration form auto-generated from schema
✅ Can be used in workflows immediately

**No restart required** (if using `uvicorn --reload`)

---

## Real Example: Workday Agent

Here's the **complete** Workday agent (~60 lines):

```python
from typing import Dict, Any, Optional
from pydantic import Field
from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)
from data import mock_darwinbox

class WorkdayAgentConfig(AgentConfigSchema):
    connector: str = Field(default="workday")
    query_type: str = Field(
        default="employees",
        json_schema_extra={"enum": ["employees", "departments", "reviews"]}
    )
    department_filter: Optional[str] = Field(
        default=None,
        json_schema_extra={"enum": ["Engineering", "Sales", "All"]}
    )

@register_agent
class WorkdayAgent(BaseAgent):
    agent_type = "workday"
    name = "Workday Agent"
    description = "Query Workday HR system"
    icon = "users"
    category = AgentCategory.DATA_RETRIEVAL
    supported_connectors = ["workday"]
    config_schema = WorkdayAgentConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]):
        filters = {}
        if self.config.department_filter and self.config.department_filter != "All":
            filters["department"] = self.config.department_filter

        employees = mock_darwinbox.get_employees(filters)

        return AgentExecutionResult(
            success=True,
            output={"employees": employees, "count": len(employees)},
            tokens_used=300,
            cost=0.01
        )
```

**Result:** Workday agent is now available across the entire platform!

---

## Configuration Schema Best Practices

### Use Pydantic Field Features

```python
class MyConfig(AgentConfigSchema):
    # Required field
    api_key: str = Field(description="API key for authentication")

    # Optional with default
    timeout: int = Field(default=30, description="Request timeout in seconds")

    # Validated range
    batch_size: int = Field(default=10, ge=1, le=1000, description="Batch size")

    # Enum (dropdown in UI)
    region: str = Field(
        default="us-east-1",
        json_schema_extra={"enum": ["us-east-1", "us-west-2", "eu-west-1"]}
    )

    # Boolean (checkbox in UI)
    enable_cache: bool = Field(default=True, description="Enable caching")

    # Nested object
    advanced_settings: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Advanced configuration"
    )
```

### Frontend Form Generation

The JSON Schema from your Pydantic model is used to auto-generate forms:

- `str` → Text input
- `int` / `float` → Number input
- `bool` → Checkbox
- `enum` → Dropdown select
- `Optional` → Not required
- `Field(description=...)` → Help text/tooltip
- `Field(ge=X, le=Y)` → Validation

---

## Agent Categories

Choose the appropriate category for UI grouping:

```python
AgentCategory.DATA_RETRIEVAL  # Query/retrieve data
AgentCategory.ACTION          # Take actions (send email, update record)
AgentCategory.ANALYSIS        # Analyze/process data
AgentCategory.COMMUNICATION   # Communication-related
```

---

## Accessing Connectors

### Option 1: Mock Data (Simple)

```python
from data import mock_sfdc, mock_darwinbox, mock_outlook

async def execute(self, input_data, context):
    # Query mock SFDC
    opportunities = mock_sfdc.get_opportunities({"Amount": "> 100000"})

    # Query mock Darwinbox
    employees = mock_darwinbox.get_employees({"department": "Sales"})

    # Send mock email
    result = mock_outlook.send_email(
        recipient="user@example.com",
        subject="Hello",
        body="Message"
    )
```

### Option 2: Connector Registry (Future)

```python
async def execute(self, input_data, context):
    # Get connector instance
    connector = ConnectorRegistry.get(self.config.connector)

    # Use connector
    data = await connector.query(self.config.query_params)
```

---

## Using LLMs in Agents

### Option 1: Real OpenAI API

```python
from openai import OpenAI

async def execute(self, input_data, context):
    client = OpenAI()  # Reads OPENAI_API_KEY from env

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": "Your prompt"}]
    )

    output = response.choices[0].message.content
    tokens = response.usage.total_tokens
    cost = (tokens / 1000) * 0.03  # Rough estimate

    return AgentExecutionResult(
        success=True,
        output=output,
        tokens_used=tokens,
        cost=cost
    )
```

### Option 2: Canned Responses (Offline Demo)

```python
CANNED_RESPONSES = {
    "email": "Dear {name}, ...",
    "summary": "This is a summary..."
}

async def execute(self, input_data, context):
    output = CANNED_RESPONSES["email"].format(name="John")

    return AgentExecutionResult(
        success=True,
        output=output,
        tokens_used=250,  # Fake tokens for demo
        cost=0.01
    )
```

---

## Accessing Input from Previous Agents

```python
async def execute(self, input_data, context):
    # input_data contains output from previous agent
    if isinstance(input_data, dict) and "deals" in input_data:
        deals = input_data["deals"]

        for deal in deals:
            # Process each deal
            self.log(f"Processing deal: {deal['Name']}")

    return AgentExecutionResult(success=True, output={"processed": len(deals)})
```

---

## Logging

```python
async def execute(self, input_data, context):
    self.log("Starting execution", level="INFO")
    self.log(f"Processing {len(items)} items")
    self.log("Warning: API slow", level="WARN")
    self.log("Error occurred", level="ERROR")
```

Logs are automatically captured by the orchestrator and available via `/api/v1/executions/{id}/logs`.

---

## RAG Citations

If your agent retrieves information from a knowledge base, include citations:

```python
async def execute(self, input_data, context):
    # Query RAG/vector store
    from rag import query_vector_store  # Future Week 3

    rag_results = query_vector_store("deal history")

    output = generate_content_with_rag(rag_results)

    # Include sources
    sources = [
        {
            "document_id": r["document_id"],
            "filename": r["filename"],
            "excerpt": r["content"][:200],
            "similarity_score": r["score"]
        }
        for r in rag_results
    ]

    return AgentExecutionResult(
        success=True,
        output=output,
        sources=sources,  # <-- Citations!
        tokens_used=500,
        cost=0.02
    )
```

---

## Testing Your Agent

### Via API Docs

1. Start backend: `python main.py`
2. Open http://localhost:8000/docs
3. Check `GET /api/v1/agents/types` - your agent should appear
4. Check `GET /api/v1/agents/types/{your_agent}/schema` - see config schema

### Via Python

```python
from agents import AgentRegistry

# Create agent instance
agent = AgentRegistry.create_agent(
    agent_type="my_agent",
    agent_id="test_1",
    config={"api_endpoint": "https://api.example.com", "max_results": 5}
)

# Execute
import asyncio
result = asyncio.run(agent.execute(
    input_data=None,
    context={"workflow_id": "test", "execution_id": "test"}
))

print(result)
```

---

## Visual Agent Builder (Future)

**Stretch goal for Week 6:**

Instead of writing code, use a visual form to define agents:

1. Enter agent name, description, icon
2. Define config fields via form:
   - Field name: `api_endpoint`
   - Type: `string`
   - Required: `true`
   - Description: `API endpoint to query`
3. Write execution logic in visual blocks or Python snippet
4. Click "Generate Agent" → Creates the Python file automatically

This would make the platform **truly no-code** for adding agents!

---

## Summary

**Adding a new agent:**
1. ✅ Create single Python file (~60 lines)
2. ✅ Add one import line
3. ✅ Agent is live!

**What happens automatically:**
- ✅ Appears in API
- ✅ Appears in UI palette
- ✅ Config form generated
- ✅ Available in workflows

**No manual steps:**
- ❌ No router changes
- ❌ No frontend code
- ❌ No config files
- ❌ No database migrations

This is the **core value proposition**: Extensibility without engineering bottlenecks!
