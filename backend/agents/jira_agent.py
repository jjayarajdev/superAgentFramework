"""
Jira Agent - Query and manage Jira issues and projects.
"""
from typing import Dict, Any, Optional
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)
from data import mock_data


class JiraAgentConfig(AgentConfigSchema):
    """Configuration schema for Jira Agent."""

    connector: str = Field(
        default="jira",
        description="Connector to use (jira)"
    )
    project_key: Optional[str] = Field(
        default=None,
        description="Jira project key (e.g., PROJ, ENG, SALES)",
        json_schema_extra={"placeholder": "PROJ"}
    )
    issue_type: Optional[str] = Field(
        default="All",
        description="Filter by issue type",
        json_schema_extra={
            "enum": ["All", "Bug", "Story", "Task", "Epic", "Sub-task"]
        }
    )
    status: Optional[str] = Field(
        default="All",
        description="Filter by status",
        json_schema_extra={
            "enum": ["All", "To Do", "In Progress", "In Review", "Done", "Blocked"]
        }
    )
    assignee: Optional[str] = Field(
        default=None,
        description="Filter by assignee email or username"
    )
    sprint: Optional[str] = Field(
        default="current",
        description="Filter by sprint",
        json_schema_extra={
            "enum": ["current", "next", "backlog", "all"]
        }
    )


@register_agent
class JiraAgent(BaseAgent):
    """
    Jira Agent.

    Query Jira for issues, bugs, stories, and project data.
    Supports filtering by project, status, assignee, sprint.
    """

    agent_type = "jira"
    name = "Jira Agent"
    description = "Query and manage Jira issues, bugs, stories, and project data"
    icon = "trello"
    category = AgentCategory.DATA_RETRIEVAL
    supported_connectors = ["jira"]
    config_schema = JiraAgentConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """
        Execute Jira query.

        Supports dual-mode execution:
        - Mock mode (default): Uses centralized mock data store
        - Real mode: Connects to actual Jira API (requires credentials)
        """
        use_mock = input_data.get('use_mock', True) if isinstance(input_data, dict) else True

        self.log(f"Querying Jira for issues... (mode: {'mock' if use_mock else 'real'})")

        # Build filters from config
        filters = {}

        if self.config.project_key:
            filters["project"] = self.config.project_key

        if self.config.issue_type and self.config.issue_type != "All":
            filters["type"] = self.config.issue_type

        if self.config.status and self.config.status != "All":
            filters["status"] = self.config.status

        if self.config.assignee:
            filters["assignee"] = self.config.assignee

        if use_mock:
            # Use centralized mock data store
            issues = mock_data.get_jira_issues(filters)
            self.log(f"Found {len(issues)} Jira issues (mock data)")
        else:
            # Real Jira API (requires credentials)
            # TODO: Implement real Jira integration
            raise NotImplementedError("Real Jira API integration not yet implemented")

        # Calculate summary stats
        total_story_points = sum(issue.get("story_points", 0) for issue in issues)

        return AgentExecutionResult(
            success=True,
            output={
                "issues": issues,
                "count": len(issues),
                "total_story_points": total_story_points,
                "project_key": self.config.project_key,
                "data_source": "mock" if use_mock else "real"
            },
            tokens_used=450,
            cost=0.016
        )
