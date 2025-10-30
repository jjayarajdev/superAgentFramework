"""
Agents package - auto-loads all agents.

All agent files in this directory are automatically imported and registered.
"""
from agents.base import BaseAgent, AgentRegistry, register_agent

# Import all agents - they auto-register via @register_agent decorator
from agents.sales_intelligence import SalesIntelligenceAgent
from agents.workday_agent import WorkdayAgent
from agents.sap_agent import SAPAgent
from agents.servicenow_agent import ServiceNowAgent
from agents.slack_agent import SlackAgent
from agents.jira_agent import JiraAgent
from agents.hubspot_agent import HubSpotAgent
from agents.zendesk_agent import ZendeskAgent

# Week 2 agents
from agents.email_outreach import EmailOutreachAgent
from agents.stripe_agent import StripePaymentAgentAgent
from agents.darwinbox_agent import DarwinBoxAgent

# Darwinbox Domain Agents
from agents.darwinbox_hr_agent import DarwinboxHRAgent

# Add new agents here - they'll auto-register on import

# Export commonly used classes
__all__ = [
    'BaseAgent',
    'AgentRegistry',
    'register_agent',
    'SalesIntelligenceAgent',
    'WorkdayAgent',
    'SAPAgent',
    'ServiceNowAgent',
    'SlackAgent',
    'JiraAgent',
    'HubSpotAgent',
    'ZendeskAgent',
]
