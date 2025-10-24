"""
Jira Agent - Query and manage Jira issues and projects.
"""
from typing import Dict, Any, Optional
from pydantic import Field

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)


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
        """Execute Jira query."""
        self.log(f"Querying Jira for issues...")

        # Mock Jira issues
        mock_issues = [
            {
                "key": "ENG-1234",
                "summary": "Implement multi-agent orchestration",
                "type": "Story",
                "status": "In Progress",
                "assignee": "john@example.com",
                "priority": "High",
                "sprint": "Sprint 23",
                "created": "2025-10-15",
                "story_points": 8
            },
            {
                "key": "ENG-1235",
                "summary": "Fix memory leak in connector service",
                "type": "Bug",
                "status": "In Review",
                "assignee": "sarah@example.com",
                "priority": "Critical",
                "sprint": "Sprint 23",
                "created": "2025-10-20",
                "story_points": 5
            },
            {
                "key": "ENG-1236",
                "summary": "Add RAG pipeline for knowledge base",
                "type": "Story",
                "status": "To Do",
                "assignee": "mike@example.com",
                "priority": "Medium",
                "sprint": "Sprint 24",
                "created": "2025-10-22",
                "story_points": 13
            },
            {
                "key": "SALES-567",
                "summary": "Update pricing page with new tiers",
                "type": "Task",
                "status": "Done",
                "assignee": "lisa@example.com",
                "priority": "Medium",
                "sprint": "Sprint 23",
                "created": "2025-10-18",
                "story_points": 3
            }
        ]

        # Apply filters
        results = mock_issues

        if self.config.project_key:
            results = [r for r in results if r["key"].startswith(self.config.project_key)]

        if self.config.issue_type and self.config.issue_type != "All":
            results = [r for r in results if r["type"] == self.config.issue_type]

        if self.config.status and self.config.status != "All":
            results = [r for r in results if r["status"] == self.config.status]

        if self.config.sprint == "current":
            results = [r for r in results if r["sprint"] == "Sprint 23"]

        self.log(f"Found {len(results)} Jira issues")

        # Calculate summary stats
        total_story_points = sum(r.get("story_points", 0) for r in results)

        return AgentExecutionResult(
            success=True,
            output={
                "issues": results,
                "count": len(results),
                "total_story_points": total_story_points,
                "project_key": self.config.project_key
            },
            tokens_used=450,
            cost=0.016
        )
