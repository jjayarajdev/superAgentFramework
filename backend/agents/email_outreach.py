"""
Email Outreach Agent - Generate and send personalized emails.
"""
from typing import Dict, Any, Optional, List
from pydantic import Field
from datetime import datetime

from agents.base import (
    BaseAgent, AgentConfigSchema, AgentExecutionResult,
    AgentCategory, register_agent
)
from data import mock_data
from rag.service import get_rag_service


class EmailOutreachConfig(AgentConfigSchema):
    """Configuration schema for Email Outreach Agent."""

    connector: str = Field(
        default="outlook",
        description="Connector to use (outlook)"
    )
    email_template: str = Field(
        default="check_in",
        description="Email template to use",
        json_schema_extra={
            "enum": ["check_in", "follow_up", "proposal"]
        }
    )
    use_rag: bool = Field(
        default=True,
        description="Use RAG to retrieve context for emails"
    )
    include_greeting: bool = Field(
        default=True,
        description="Include personalized greeting"
    )
    max_emails: Optional[int] = Field(
        default=None,
        description="Maximum number of emails to send (None = unlimited)",
        ge=1,
        le=100
    )


@register_agent
class EmailOutreachAgent(BaseAgent):
    """
    Email Outreach Agent.

    Generates and sends personalized emails based on input data.
    Can use RAG for context and email templates for structure.

    Expects input from previous agent (e.g., SalesIntelligence) with deal data.
    """

    agent_type = "email_outreach"
    name = "Email Outreach Agent"
    description = "Generate and send personalized emails with RAG-powered context"
    icon = "mail"
    category = AgentCategory.ACTION
    supported_connectors = ["outlook"]
    config_schema = EmailOutreachConfig

    async def execute(self, input_data: Any, context: Dict[str, Any]) -> AgentExecutionResult:
        """
        Execute email outreach.

        Supports dual-mode execution:
        - Mock mode (default): Uses centralized mock data store
        - Real mode: Connects to actual Email API (requires credentials)
        """
        use_mock = input_data.get('use_mock', True) if isinstance(input_data, dict) else True

        self.log(f"Starting email outreach with template: {self.config.email_template} (mode: {'mock' if use_mock else 'real'})")

        # Extract recipients from input (deals, records, contacts, employees, etc.)
        recipients = []
        if isinstance(input_data, dict):
            # Try different field names
            for field in ["deals", "records", "contacts", "employees", "leads"]:
                if field in input_data:
                    recipients = input_data[field]
                    break
            # Also check nested in output
            if not recipients and "output" in input_data and isinstance(input_data["output"], dict):
                for field in ["deals", "records", "contacts", "employees", "leads"]:
                    if field in input_data["output"]:
                        recipients = input_data["output"][field]
                        break

        if not recipients:
            self.log("No recipients found in input data", level="WARN")
            return AgentExecutionResult(
                success=False,
                output={"error": "No recipients provided in input"},
                error="No recipients found in input data"
            )

        # Limit emails if configured
        if self.config.max_emails:
            recipients = recipients[:self.config.max_emails]

        self.log(f"Generating emails for {len(recipients)} recipients...")

        # Generate and send emails
        sent_emails = []
        total_tokens = 0

        for recipient in recipients:
            # Generate email content
            email_content = self._generate_email(recipient, context)

            # Determine recipient email address (different field names for different sources)
            recipient_email = recipient.get("OwnerEmail") or recipient.get("email") or recipient.get("Email") or "contact@example.com"

            if use_mock:
                # Use centralized mock data store
                result = mock_data.send_email(
                    to=recipient_email,
                    subject=email_content["subject"],
                    body=email_content["body"]
                )
            else:
                # Real Email API (requires credentials)
                # TODO: Implement real Email integration
                raise NotImplementedError("Real Email API integration not yet implemented")

            sent_emails.append({
                "recipient_id": recipient.get("Id") or recipient.get("id"),
                "recipient_name": recipient.get("Name") or recipient.get("firstname", "") + " " + recipient.get("lastname", "") or recipient.get("name"),
                "recipient_email": result["to"],
                "subject": result["subject"],
                "body": result["body"],
                "sent_at": result["sent_at"],
                "message_id": result["message_id"]
            })

            # Mock token usage for email generation (if using LLM)
            total_tokens += 250

        self.log(f"Successfully sent {len(sent_emails)} emails")

        # Real RAG sources (if use_rag is enabled)
        sources = None
        if self.config.use_rag:
            try:
                rag_service = get_rag_service()
                # Check if there are any documents in the RAG system
                stats = rag_service.get_stats()
                if stats["total_chunks"] > 0:
                    # Query for relevant context about deals
                    query = f"information about {deal.get('Account', {}).get('Name', '')} deal"
                    rag_results = rag_service.retrieve(query=query, n_results=3)

                    if rag_results:
                        sources = [
                            {
                                "document_id": r["document_id"],
                                "filename": r["filename"],
                                "excerpt": r["excerpt"],
                                "similarity_score": r["similarity_score"]
                            }
                            for r in rag_results
                        ]
                else:
                    # Fall back to mock if no documents uploaded
                    sources = [
                        {
                            "document_id": "mock_doc",
                            "filename": "demo_notes.txt",
                            "excerpt": "No documents uploaded yet. Using default context...",
                            "similarity_score": 0.0
                        }
                    ]
            except Exception as e:
                self.log(f"RAG retrieval failed: {str(e)}, using fallback", level="WARN")
                sources = None

        return AgentExecutionResult(
            success=True,
            output={
                "emails_sent": len(sent_emails),
                "emails": sent_emails,
                "data_source": "mock" if use_mock else "real"
            },
            sources=sources,
            tokens_used=total_tokens,
            cost=total_tokens * 0.00004  # Mock cost calculation
        )

    def _generate_email(self, deal: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, str]:
        """Generate email subject and body from deal data."""
        # Get owner name
        owner_name = deal.get("OwnerName", "there")
        account_name = deal.get("Account", {}).get("Name", deal.get("Name", "your account"))
        deal_value = f"${deal.get('Amount', 0):,}"
        close_date = deal.get("CloseDate", "soon")

        # Real RAG context retrieval
        if self.config.use_rag:
            try:
                rag_service = get_rag_service()
                stats = rag_service.get_stats()

                if stats["total_chunks"] > 0:
                    # Query for relevant context
                    query = f"information about {account_name} customer interactions and preferences"
                    rag_results = rag_service.retrieve(query=query, n_results=2)

                    if rag_results and len(rag_results) > 0:
                        # Use the most relevant result
                        rag_context = f"Based on our records: {rag_results[0]['excerpt']}"
                    else:
                        rag_context = "Based on previous conversations, the customer expressed interest in our enterprise platform and requested a demo."
                else:
                    rag_context = "Based on previous conversations, the customer expressed interest in our enterprise platform and requested a demo."
            except Exception as e:
                # Fall back to default
                rag_context = "Based on previous conversations, the customer expressed interest in our enterprise platform and requested a demo."
        else:
            rag_context = "I wanted to see how things are progressing."

        # Generate email from template
        templates = mock_data.get_email_templates()
        template = next((t for t in templates if t["name"] == self.config.email_template), templates[0])

        # Simple template substitution
        subject = template["subject"].format(account_name=account_name)
        body = template["body"].format(
            owner_name=owner_name,
            account_name=account_name,
            deal_value=deal_value,
            close_date=close_date,
            context=rag_context
        )

        email_data = {
            "subject": subject,
            "body": body
        }

        # Option: Use real LLM for generation (commented out for mock demo)
        # from openai import OpenAI
        # client = OpenAI()
        # prompt = f"Write a professional email checking in on deal: {account_name} ({deal_value})"
        # response = client.chat.completions.create(
        #     model="gpt-4",
        #     messages=[{"role": "user", "content": prompt}]
        # )
        # email_data = {"subject": "...", "body": response.choices[0].message.content}

        return email_data
