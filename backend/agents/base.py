"""
Base Agent class - all agents extend this.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class AgentCategory(str, Enum):
    """Agent category for UI grouping."""
    DATA_RETRIEVAL = "data_retrieval"
    ACTION = "action"
    ANALYSIS = "analysis"
    COMMUNICATION = "communication"


class AgentConfigSchema(BaseModel):
    """
    Base configuration schema for agents.
    Subclass this to define agent-specific config fields.
    """
    pass


class AgentExecutionResult(BaseModel):
    """Standard result format from agent execution."""
    success: bool
    output: Any
    sources: Optional[List[Dict[str, Any]]] = None  # RAG citations
    tokens_used: int = 0
    cost: float = 0.0
    error: Optional[str] = None


class BaseAgent(ABC):
    """
    Base class for all agents.

    To create a new agent:
    1. Subclass BaseAgent
    2. Define config_schema (Pydantic model)
    3. Implement execute() method
    4. Set metadata (name, description, icon, etc.)
    5. Agent auto-registers on import
    """

    # Agent metadata - override in subclass
    agent_type: str = "base"
    name: str = "Base Agent"
    description: str = "Base agent class"
    icon: str = "cog"
    category: AgentCategory = AgentCategory.ACTION
    supported_connectors: List[str] = []

    # Configuration schema - override in subclass
    config_schema: type[AgentConfigSchema] = AgentConfigSchema

    def __init__(self, agent_id: str, config: Dict[str, Any]):
        """Initialize agent with config."""
        self.agent_id = agent_id

        # Validate config against schema
        self.config = self.config_schema(**config)

    @abstractmethod
    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """
        Execute the agent.

        Args:
            input_data: Input from previous agent or user
            context: Shared execution context (workflow_id, execution_id, etc.)

        Returns:
            AgentExecutionResult with output, tokens, cost, etc.
        """
        pass

    @classmethod
    def get_metadata(cls) -> Dict[str, Any]:
        """Get agent metadata for API."""
        return {
            "id": cls.agent_type,
            "name": cls.name,
            "description": cls.description,
            "icon": cls.icon,
            "category": cls.category,
            "supported_connectors": cls.supported_connectors,
            "config_schema": cls.config_schema.model_json_schema() if cls.config_schema else {}
        }

    def log(self, message: str, level: str = "INFO"):
        """Log message (will be captured by orchestrator)."""
        timestamp = datetime.now().isoformat()
        print(f"[{timestamp}] [{level}] [{self.agent_id}] {message}")


# Agent Registry - auto-discovery
class AgentRegistry:
    """Registry for all available agents."""

    _agents: Dict[str, type[BaseAgent]] = {}

    @classmethod
    def register(cls, agent_class: type[BaseAgent]):
        """Register an agent class."""
        cls._agents[agent_class.agent_type] = agent_class
        print(f"  ✅ Registered agent: {agent_class.name} ({agent_class.agent_type})")
        return agent_class

    @classmethod
    def get_agent_class(cls, agent_type: str) -> type[BaseAgent]:
        """Get agent class by type."""
        if agent_type not in cls._agents:
            raise ValueError(f"Unknown agent type: {agent_type}")
        return cls._agents[agent_type]

    @classmethod
    def create_agent(cls, agent_type: str, agent_id: str, config: Dict[str, Any]) -> BaseAgent:
        """Create agent instance."""
        agent_class = cls.get_agent_class(agent_type)
        return agent_class(agent_id=agent_id, config=config)

    @classmethod
    def list_agents(cls) -> List[Dict[str, Any]]:
        """List all registered agents."""
        return [agent_class.get_metadata() for agent_class in cls._agents.values()]

    @classmethod
    def get_agent_config_schema(cls, agent_type: str) -> Dict[str, Any]:
        """Get config schema for agent type."""
        agent_class = cls.get_agent_class(agent_type)
        return agent_class.config_schema.model_json_schema()


def register_agent(agent_class: type[BaseAgent]):
    """Decorator to register agent."""
    return AgentRegistry.register(agent_class)
