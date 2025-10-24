#!/usr/bin/env python3
"""
Agent Generator CLI - Create new agents with zero boilerplate!

Usage:
    python scripts/create_agent.py

Or with arguments:
    python scripts/create_agent.py --name "Stripe" --type "payment" --category "action"
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))


AGENT_TEMPLATE = '''"""
{description}
"""
from typing import Dict, Any, Optional
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)


class {class_name}Config(AgentConfigSchema):
    """Configuration schema for {name}."""

    connector: str = Field(
        default="{agent_id}",
        description="Connector to use ({agent_id})"
    )
    {config_fields}


@register_agent
class {class_name}(BaseAgent):
    """
    {name}.

    {description}
    """

    agent_type = "{agent_id}"
    name = "{name}"
    description = "{description}"
    icon = "{icon}"
    category = AgentCategory.{category_upper}
    supported_connectors = ["{agent_id}"]
    config_schema = {class_name}Config

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute {name} action."""
        self.log(f"Executing {name}...")

        # TODO: Implement your agent logic here
        # Example:
        # result = await self._call_api(input_data)
        # process_data = self._process_result(result)

        # For now, return mock data
        mock_result = {{
            "message": "{name} executed successfully",
            "data": {{}},
            "timestamp": "{timestamp}"
        }}

        self.log(f"{name} completed")

        return AgentExecutionResult(
            success=True,
            output=mock_result,
            tokens_used=100,  # Update with actual tokens if using LLM
            cost=0.004
        )

    # Add helper methods here
    # def _call_api(self, data):
    #     """Call external API."""
    #     pass
    #
    # def _process_result(self, result):
    #     """Process API result."""
    #     pass
'''

TEST_TEMPLATE = '''"""
Tests for {name}.
"""
import pytest
from agents.{filename} import {class_name}


@pytest.mark.asyncio
async def test_{agent_id}_execute():
    """Test {name} execution."""
    agent = {class_name}(
        id="test_{agent_id}",
        name="Test {name}",
        config={{}}
    )

    result = await agent.execute(
        input_data={{"test": "data"}},
        context={{}}
    )

    assert result.success is True
    assert result.output is not None
    assert "message" in result.output


@pytest.mark.asyncio
async def test_{agent_id}_error_handling():
    """Test {name} error handling."""
    agent = {class_name}(
        id="test_{agent_id}",
        name="Test {name}",
        config={{}}
    )

    # Test with invalid input
    result = await agent.execute(
        input_data=None,
        context={{}}
    )

    # Should handle gracefully
    assert result is not None
'''


def generate_config_fields(agent_type: str) -> str:
    """Generate common config fields based on agent type."""

    if agent_type == "data_retrieval":
        return '''object_type: Optional[str] = Field(
        default=None,
        description="Object type to query"
    )
    filters: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Filters to apply"
    )
    max_results: Optional[int] = Field(
        default=100,
        description="Maximum number of results",
        ge=1,
        le=1000
    )'''

    elif agent_type == "action":
        return '''action_type: str = Field(
        description="Type of action to perform",
        json_schema_extra={"enum": ["create", "update", "delete", "send"]}
    )
    params: Dict[str, Any] = Field(
        default_factory=dict,
        description="Action parameters"
    )'''

    elif agent_type == "communication":
        return '''message_template: Optional[str] = Field(
        default="default",
        description="Message template to use"
    )
    recipients: Optional[list] = Field(
        default=None,
        description="Message recipients"
    )'''

    elif agent_type == "analysis":
        return '''analysis_type: str = Field(
        description="Type of analysis to perform",
        json_schema_extra={"enum": ["sentiment", "summarize", "extract", "classify"]}
    )
    use_llm: bool = Field(
        default=True,
        description="Whether to use LLM for analysis"
    )'''

    else:
        return '''# Add your config fields here
    param1: Optional[str] = Field(
        default=None,
        description="Example parameter"
    )'''


def get_icon_for_category(category: str) -> str:
    """Get default icon for category."""
    icons = {
        "data_retrieval": "database",
        "action": "zap",
        "communication": "message-square",
        "analysis": "brain",
        "automation": "cpu"
    }
    return icons.get(category, "box")


def create_agent(
    name: str,
    agent_id: str,
    category: str,
    description: str,
    icon: str = None,
    config_fields: str = None
):
    """Generate agent files."""

    # Prepare variables
    class_name = name.replace(" ", "") + "Agent"
    filename = agent_id + "_agent"
    category_upper = category.upper()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if icon is None:
        icon = get_icon_for_category(category)

    if config_fields is None:
        config_fields = generate_config_fields(category)

    # Generate agent file
    agent_code = AGENT_TEMPLATE.format(
        name=name,
        agent_id=agent_id,
        class_name=class_name,
        filename=filename,
        category_upper=category_upper,
        description=description,
        icon=icon,
        config_fields=config_fields,
        timestamp=timestamp
    )

    # Generate test file
    test_code = TEST_TEMPLATE.format(
        name=name,
        agent_id=agent_id,
        class_name=class_name,
        filename=filename
    )

    # Write files
    backend_dir = Path(__file__).parent.parent
    agent_path = backend_dir / "agents" / f"{filename}.py"
    test_path = backend_dir / "tests" / f"test_{filename}.py"

    # Create tests directory if it doesn't exist
    test_path.parent.mkdir(exist_ok=True)

    agent_path.write_text(agent_code)
    test_path.write_text(test_code)

    print(f"✅ Created agent: {agent_path}")
    print(f"✅ Created tests: {test_path}")

    # Update __init__.py
    update_agent_init(class_name, filename)

    print(f"\n🎉 Agent '{name}' created successfully!")
    print(f"\nNext steps:")
    print(f"1. Edit agents/{filename}.py to implement your logic")
    print(f"2. Run tests: pytest tests/test_{filename}.py")
    print(f"3. Restart backend: uvicorn main:app --reload")
    print(f"4. Agent will be available as '{agent_id}' in the UI")

    return agent_path, test_path


def update_agent_init(class_name: str, filename: str):
    """Update agents/__init__.py to import new agent."""
    backend_dir = Path(__file__).parent.parent
    init_path = backend_dir / "agents" / "__init__.py"

    # Read current content
    content = init_path.read_text()

    # Add import if not already present
    import_line = f"from agents.{filename} import {class_name}"

    if import_line not in content:
        # Find where to insert (after other agent imports)
        lines = content.split('\n')
        insert_index = None

        for i, line in enumerate(lines):
            if line.startswith("from agents.") and "Agent" in line:
                insert_index = i + 1

        if insert_index:
            lines.insert(insert_index, import_line)
            init_path.write_text('\n'.join(lines))
            print(f"✅ Updated agents/__init__.py")


def interactive_mode():
    """Interactive agent creation."""
    print("🤖 Super Agent Framework - Agent Generator")
    print("=" * 50)
    print()

    # Get agent details
    name = input("Agent Name (e.g., 'Stripe Agent'): ").strip()
    if not name:
        print("❌ Agent name is required")
        return

    # Generate default agent_id
    default_id = name.lower().replace(" agent", "").replace(" ", "_")
    agent_id = input(f"Agent ID [{default_id}]: ").strip() or default_id

    # Choose category
    print("\nCategories:")
    print("1. DATA_RETRIEVAL - Query and fetch data")
    print("2. ACTION - Perform actions (create, update, delete)")
    print("3. COMMUNICATION - Send messages, notifications")
    print("4. ANALYSIS - Analyze and process data")
    print("5. AUTOMATION - Automated workflows")

    category_choice = input("\nSelect category [1-5]: ").strip()
    categories = {
        "1": "data_retrieval",
        "2": "action",
        "3": "communication",
        "4": "analysis",
        "5": "automation"
    }
    category = categories.get(category_choice, "action")

    description = input("\nDescription: ").strip() or f"{name} for automated workflows"

    icon = input(f"Icon (lucide-react name) [{get_icon_for_category(category)}]: ").strip()
    icon = icon or None

    print("\n" + "=" * 50)
    print("Creating agent...")
    print()

    create_agent(name, agent_id, category, description, icon)


def main():
    parser = argparse.ArgumentParser(
        description="Generate new Super Agent Framework agents"
    )
    parser.add_argument("--name", help="Agent name (e.g., 'Stripe Agent')")
    parser.add_argument("--id", help="Agent ID (e.g., 'stripe')")
    parser.add_argument(
        "--category",
        choices=["data_retrieval", "action", "communication", "analysis", "automation"],
        help="Agent category"
    )
    parser.add_argument("--description", help="Agent description")
    parser.add_argument("--icon", help="Lucide icon name")

    args = parser.parse_args()

    # If all arguments provided, use them
    if args.name and args.id and args.category:
        create_agent(
            name=args.name,
            agent_id=args.id,
            category=args.category,
            description=args.description or f"{args.name} for automated workflows",
            icon=args.icon
        )
    else:
        # Otherwise, use interactive mode
        interactive_mode()


if __name__ == "__main__":
    main()
