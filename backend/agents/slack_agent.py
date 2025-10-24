"""
Slack Agent - Send messages and notifications to Slack channels.
"""
from typing import Dict, Any, Optional, List
from pydantic import Field
import uuid
from datetime import datetime

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)


class SlackAgentConfig(AgentConfigSchema):
    """Configuration schema for Slack Agent."""

    connector: str = Field(
        default="slack",
        description="Connector to use (slack)"
    )
    channel: str = Field(
        description="Slack channel to post to (e.g., #general, #alerts)",
        json_schema_extra={"placeholder": "#general"}
    )
    message_template: Optional[str] = Field(
        default="default",
        description="Message template to use",
        json_schema_extra={
            "enum": ["default", "alert", "summary", "custom"]
        }
    )
    mention_users: bool = Field(
        default=False,
        description="Whether to @mention users in the message"
    )
    include_attachments: bool = Field(
        default=False,
        description="Include rich attachments (cards) in message"
    )


# In-memory storage for sent Slack messages
_sent_slack_messages = []


@register_agent
class SlackAgent(BaseAgent):
    """
    Slack Agent.

    Send messages and notifications to Slack channels.
    Supports rich formatting, mentions, and attachments.
    """

    agent_type = "slack"
    name = "Slack Agent"
    description = "Send messages and notifications to Slack channels"
    icon = "message-square"
    category = AgentCategory.COMMUNICATION
    supported_connectors = ["slack"]
    config_schema = SlackAgentConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """Execute Slack message send."""
        self.log(f"Sending message to Slack channel {self.config.channel}...")

        # Generate message based on input data and template
        message = self._generate_message(input_data)

        # Mock sending to Slack
        slack_message = {
            "message_id": f"slack_{str(uuid.uuid4())[:8]}",
            "channel": self.config.channel,
            "text": message,
            "timestamp": datetime.now().isoformat(),
            "status": "sent"
        }

        # Store in mock storage
        _sent_slack_messages.append(slack_message)

        self.log(f"Message sent successfully to {self.config.channel}")

        return AgentExecutionResult(
            success=True,
            output={
                "message": slack_message,
                "channel": self.config.channel,
                "sent_at": slack_message["timestamp"]
            },
            tokens_used=200,  # If using LLM for message generation
            cost=0.008
        )

    def _generate_message(self, input_data: Any) -> str:
        """Generate Slack message from input data."""
        if self.config.message_template == "alert":
            return f"🚨 **Alert:** {input_data}"

        elif self.config.message_template == "summary":
            # If input_data is structured (e.g., from previous agent)
            if isinstance(input_data, dict):
                if "count" in input_data:
                    return f"📊 **Summary:** Found {input_data['count']} items"
                return f"📊 **Summary:** {str(input_data)}"

        # Default message
        return f"📢 **Notification:** {input_data}"


def get_sent_slack_messages() -> List[Dict[str, Any]]:
    """Get all sent Slack messages (for demo/testing)."""
    return _sent_slack_messages


def clear_slack_messages():
    """Clear sent messages (for demo reset)."""
    global _sent_slack_messages
    _sent_slack_messages = []
