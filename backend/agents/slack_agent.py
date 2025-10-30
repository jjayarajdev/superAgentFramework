"""
Slack Agent - Send messages and notifications to Slack channels.
"""
from typing import Dict, Any, Optional, List
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)
from data import mock_data


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
        """
        Execute Slack message send.

        Supports dual-mode execution:
        - Mock mode (default): Uses centralized mock data store
        - Real mode: Connects to actual Slack API (requires credentials)
        """
        use_mock = input_data.get('use_mock', True) if isinstance(input_data, dict) else True

        self.log(f"Sending message to Slack channel {self.config.channel}... (mode: {'mock' if use_mock else 'real'})")

        # Generate message based on input data and template
        message = self._generate_message(input_data)

        if use_mock:
            # Use centralized mock data store
            result = mock_data.send_slack_message(self.config.channel, message)
            self.log(f"Message sent successfully to {self.config.channel} (mock)")
        else:
            # Real Slack API (requires credentials)
            # TODO: Implement real Slack integration
            raise NotImplementedError("Real Slack API integration not yet implemented")

        return AgentExecutionResult(
            success=True,
            output={
                "message": result,
                "channel": self.config.channel,
                "sent_at": result.get("ts", result.get("timestamp", "unknown")),
                "data_source": "mock" if use_mock else "real"
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
