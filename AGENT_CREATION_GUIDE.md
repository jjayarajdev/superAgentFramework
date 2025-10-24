# Agent Creation Guide - Zero to Hero 🚀

## Overview

The Super Agent Framework now supports **three ways** to create new agents:

1. **🛠️ Visual Agent Builder** - No coding required!
2. **⌨️ CLI Generator** - Command-line tool
3. **💻 Manual Coding** - Full control

**Time to create a new agent:**
- Visual Builder: **~2 minutes** ⚡
- CLI Generator: **~30 seconds** 🏃
- Manual Coding: **~15 minutes** 🐌

---

## Method 1: Visual Agent Builder (Recommended for Beginners)

### Access
Navigate to: **http://localhost:3000/agent-builder**

Or click **"🛠️ Agent Builder"** in the top navigation.

### Step-by-Step Process

#### Step 1: Basic Information
Fill in:
- **Agent Name**: e.g., "Stripe Payment Agent"
- **Agent ID**: Auto-generated (e.g., "stripe")
- **Description**: What does your agent do?
- **Category**: Choose from Data Retrieval, Action, Communication, Analysis, Automation
- **Icon** (optional): Lucide icon name (e.g., "zap", "database", "mail")

#### Step 2: Choose Template
Select a pre-built template or start from scratch:

- **Custom Agent**: Blank slate
- **REST API Agent**: Query REST APIs
- **Webhook Agent**: Send data to webhooks
- **Database Query**: Execute SQL
- **File Processor**: Process CSV/JSON/Excel
- **LLM Processor**: Use AI for analysis

#### Step 3: Configuration Fields
Define what parameters your agent needs:

Example for Stripe:
```
Field: api_key
Type: Text
Description: Stripe API secret key
Required: Yes

Field: currency
Type: Dropdown
Description: Payment currency
Default: USD
Required: No
```

#### Step 4: Review & Generate
- Preview generated Python code
- Download code (optional)
- Click **"🚀 Generate Agent"**
- **Restart backend** to use your new agent

### Features
- ✅ No coding required
- ✅ Real-time code preview
- ✅ Field validation
- ✅ Auto-generates tests
- ✅ Beautiful UI with step-by-step wizard

---

## Method 2: CLI Generator (Recommended for Developers)

### Quick Start

```bash
cd backend
python3 scripts/create_agent.py
```

### Interactive Mode

The script will prompt you for:
1. Agent Name
2. Agent ID
3. Category (1-5)
4. Description
5. Icon

Example session:
```
🤖 Super Agent Framework - Agent Generator
==================================================

Agent Name (e.g., 'Stripe Agent'): Stripe Payment Agent
Agent ID [stripe_payment_agent]: stripe
Categories:
1. DATA_RETRIEVAL - Query and fetch data
2. ACTION - Perform actions (create, update, delete)
3. COMMUNICATION - Send messages, notifications
4. ANALYSIS - Analyze and process data
5. AUTOMATION - Automated workflows

Select category [1-5]: 2
Description: Process payments and manage subscriptions via Stripe API
Icon (lucide-react name) [zap]: credit-card

==================================================
Creating agent...

✅ Created agent: /path/to/agents/stripe_agent.py
✅ Created tests: /path/to/tests/test_stripe_agent.py
✅ Updated agents/__init__.py

🎉 Agent 'Stripe Payment Agent' created successfully!

Next steps:
1. Edit agents/stripe_agent.py to implement your logic
2. Run tests: pytest tests/test_stripe_agent.py
3. Restart backend: uvicorn main:app --reload
4. Agent will be available as 'stripe' in the UI
```

### Command-Line Arguments

For automation/scripts:

```bash
python3 scripts/create_agent.py \
  --name "Stripe Payment Agent" \
  --id "stripe" \
  --category "action" \
  --description "Process payments via Stripe" \
  --icon "credit-card"
```

### Available Templates

List all templates:
```bash
python3 scripts/agent_templates.py
```

Output:
```
📦 Available Agent Templates

rest_api             - REST API Agent
                       Query REST APIs and return structured data
                       Category: data_retrieval

webhook              - Webhook Agent
                       Send data to webhook endpoints
                       Category: action

database             - Database Query Agent
                       Execute SQL queries and return results
                       Category: data_retrieval

file_processor       - File Processor Agent
                       Process files (CSV, JSON, Excel) and extract data
                       Category: data_retrieval

llm_processor        - LLM Processor Agent
                       Use LLM to analyze, summarize, or transform data
                       Category: analysis
```

---

## Method 3: Manual Coding (Full Control)

### File Structure

Create three files:

1. **Agent Implementation**: `backend/agents/{name}_agent.py`
2. **Tests**: `backend/tests/test_{name}_agent.py`
3. **Update Imports**: `backend/agents/__init__.py`

### Step 1: Create Agent File

```python
# backend/agents/stripe_agent.py
"""
Stripe Payment Agent - Process payments and manage subscriptions.
"""
from typing import Dict, Any, Optional
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)


class StripeAgentConfig(AgentConfigSchema):
    """Configuration schema for Stripe Agent."""

    connector: str = Field(
        default="stripe",
        description="Connector to use (stripe)"
    )
    api_key: str = Field(
        description="Stripe API secret key"
    )
    currency: str = Field(
        default="USD",
        description="Payment currency",
        json_schema_extra={"enum": ["USD", "EUR", "GBP"]}
    )
    amount: int = Field(
        description="Payment amount in cents",
        ge=1
    )


@register_agent
class StripeAgent(BaseAgent):
    """
    Stripe Payment Agent.

    Process payments, create customers, and manage subscriptions
    using the Stripe API.
    """

    agent_type = "stripe"
    name = "Stripe Agent"
    description = "Process payments and manage subscriptions via Stripe"
    icon = "credit-card"
    category = AgentCategory.ACTION
    supported_connectors = ["stripe"]
    config_schema = StripeAgentConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute Stripe payment."""
        self.log(f"Processing ${self.config.amount/100} {self.config.currency} payment")

        # TODO: Implement Stripe API call
        # import stripe
        # stripe.api_key = self.config.api_key
        # charge = stripe.Charge.create(
        #     amount=self.config.amount,
        #     currency=self.config.currency,
        #     source=input_data.get("token"),
        #     description="Payment via Super Agent"
        # )

        # Mock response for now
        mock_result = {
            "charge_id": "ch_mock_123",
            "amount": self.config.amount,
            "currency": self.config.currency,
            "status": "succeeded"
        }

        self.log(f"Payment successful: {mock_result['charge_id']}")

        return AgentExecutionResult(
            success=True,
            output=mock_result,
            tokens_used=0,
            cost=0.0
        )
```

### Step 2: Create Test File

```python
# backend/tests/test_stripe_agent.py
"""Tests for Stripe Agent."""
import pytest
from agents.stripe_agent import StripeAgent


@pytest.mark.asyncio
async def test_stripe_payment():
    """Test Stripe payment processing."""
    agent = StripeAgent(
        id="test_stripe",
        name="Test Stripe",
        config={
            "api_key": "test_key",
            "amount": 5000,
            "currency": "USD"
        }
    )

    result = await agent.execute(
        input_data={"token": "tok_test"},
        context={}
    )

    assert result.success is True
    assert result.output["amount"] == 5000
    assert result.output["status"] == "succeeded"
```

### Step 3: Update Imports

```python
# backend/agents/__init__.py
from agents.stripe_agent import StripeAgent  # Add this line
```

### Step 4: Restart Backend

```bash
cd backend
uvicorn main:app --reload
```

---

## Agent Anatomy

### Required Components

Every agent must have:

```python
@register_agent  # 1. Decorator to register
class YourAgent(BaseAgent):  # 2. Inherit from BaseAgent

    # 3. Metadata
    agent_type = "unique_id"  # Unique identifier
    name = "Display Name"
    description = "What does it do"
    icon = "lucide-icon-name"
    category = AgentCategory.ACTION  # or DATA_RETRIEVAL, etc.
    supported_connectors = ["connector_name"]
    config_schema = YourAgentConfig

    # 4. Execute method
    async def execute(self, input_data, context) -> AgentExecutionResult:
        # Your logic here
        return AgentExecutionResult(
            success=True,
            output={"result": "data"},
            tokens_used=0,
            cost=0.0
        )
```

### Config Schema

Define configuration fields:

```python
class YourAgentConfig(AgentConfigSchema):
    """Configuration schema."""

    # Required field
    api_key: str = Field(
        description="API key for authentication"
    )

    # Optional field with default
    timeout: int = Field(
        default=30,
        description="Request timeout in seconds",
        ge=1,
        le=300
    )

    # Dropdown/enum field
    mode: str = Field(
        default="sync",
        description="Execution mode",
        json_schema_extra={"enum": ["sync", "async"]}
    )

    # Boolean field
    debug: bool = Field(
        default=False,
        description="Enable debug logging"
    )
```

### Execution Result

Always return `AgentExecutionResult`:

```python
return AgentExecutionResult(
    success=True,  # or False on error
    output={
        "key": "value",
        "data": []
    },
    tokens_used=250,  # If using LLM
    cost=0.01,  # Estimated cost
    error="Error message"  # Only if success=False
)
```

---

## Agent Categories

### DATA_RETRIEVAL
Query and fetch data from external sources.

**Examples:**
- Salesforce, HubSpot, Zendesk
- Database queries
- File processors
- API clients

**Typical Config:**
- `object_type`: What to query
- `filters`: Query filters
- `max_results`: Limit results

### ACTION
Perform actions like create, update, delete.

**Examples:**
- Payment processing (Stripe)
- Create tickets (Jira)
- Send emails
- Update records

**Typical Config:**
- `action_type`: What action
- `params`: Action parameters

### COMMUNICATION
Send messages and notifications.

**Examples:**
- Slack, Teams, Discord
- Email, SMS
- Push notifications

**Typical Config:**
- `channel` or `recipient`
- `message_template`
- `mentions`

### ANALYSIS
Analyze and process data.

**Examples:**
- LLM processing
- Sentiment analysis
- Data transformation
- Summarization

**Typical Config:**
- `analysis_type`
- `model`: LLM model
- `temperature`

### AUTOMATION
Automated workflows and tasks.

**Examples:**
- Scheduled tasks
- Batch processing
- Multi-step automations

**Typical Config:**
- `schedule`
- `retry_policy`
- `error_handling`

---

## Testing Your Agent

### Run Tests

```bash
pytest tests/test_your_agent.py -v
```

### Test in UI

1. Navigate to **Workflow Builder**
2. Drag your new agent onto the canvas
3. Configure it
4. Connect to other agents
5. Save workflow
6. Navigate to **Execute**
7. Run the workflow

### Test via API

```bash
# 1. Create workflow
curl -X POST http://localhost:8000/api/v1/workflows/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workflow",
    "agents": [{
      "id": "agent_1",
      "type": "your_agent_type",
      "name": "Test Agent",
      "config": {"param": "value"},
      "position": {"x": 100, "y": 100}
    }],
    "edges": []
  }'

# 2. Execute workflow
curl -X POST http://localhost:8000/api/v1/executions/ \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "wf_xxx",
    "input": "test input"
  }'
```

---

## Best Practices

### 1. Config Validation
Use Pydantic validators:
```python
class MyConfig(AgentConfigSchema):
    email: str = Field(description="Email address")

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError("Invalid email")
        return v
```

### 2. Error Handling
```python
async def execute(self, input_data, context):
    try:
        result = await self._call_api()
        return AgentExecutionResult(success=True, output=result)
    except Exception as e:
        self.log(f"Error: {str(e)}", level="ERROR")
        return AgentExecutionResult(
            success=False,
            output={"error": str(e)},
            error=str(e)
        )
```

### 3. Logging
```python
self.log("Starting execution")
self.log(f"Processing {len(items)} items")
self.log("Error occurred", level="ERROR")
self.log("Warning: rate limit approaching", level="WARN")
```

### 4. Flexible Input
Support multiple input formats:
```python
# Handle dict or list
if isinstance(input_data, dict):
    records = input_data.get("records", [])
elif isinstance(input_data, list):
    records = input_data
else:
    records = []
```

### 5. Cost Tracking
Track tokens and costs for transparency:
```python
return AgentExecutionResult(
    success=True,
    output=result,
    tokens_used=response.usage.total_tokens,
    cost=response.usage.total_tokens * 0.00003  # GPT-4 pricing
)
```

---

## Example: Complete Real-World Agent

See `backend/agents/stripe_agent.py` for a complete example generated by the CLI tool.

Or check existing agents:
- `sales_intelligence.py` - Data retrieval pattern
- `email_outreach.py` - Action pattern with flexibility
- `slack_agent.py` - Communication pattern
- `workday_agent.py` - Integration pattern

---

## Troubleshooting

### Agent Not Showing in UI
- **Restart backend**: `uvicorn main:app --reload`
- **Check imports**: Verify `agents/__init__.py` has your import
- **Check decorator**: Ensure `@register_agent` is present

### Config Schema Not Working
- **Inherit from AgentConfigSchema**: Not BaseModel
- **Use Field()**: For all config parameters
- **Add descriptions**: Required for UI

### Execution Fails
- **Check logs**: `self.log()` statements appear in terminal
- **Validate input**: Check what upstream agent sends
- **Test standalone**: Create unit test first

### Type Errors
- **Return AgentExecutionResult**: Not dict
- **Async execute**: Must be `async def execute`
- **Type hints**: Add for input_data and context

---

## API Reference

### Generate Agent Programmatically

```bash
POST /api/v1/agents/generate
```

```json
{
  "name": "Stripe Payment Agent",
  "id": "stripe",
  "category": "action",
  "description": "Process payments via Stripe",
  "icon": "credit-card",
  "template": "custom",
  "config_fields": [
    {
      "name": "api_key",
      "type": "string",
      "description": "Stripe API key",
      "required": true
    }
  ]
}
```

### List Templates

```bash
GET /api/v1/agents/templates
```

### List Categories

```bash
GET /api/v1/agents/categories
```

---

## What's Next?

1. **Create your first agent** using the Visual Builder
2. **Test it** in a workflow
3. **Share it** with your team
4. **Iterate** based on feedback

**Time to build something amazing!** 🚀
