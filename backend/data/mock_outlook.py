"""
Mock Outlook/Email connector.
"""
from datetime import datetime
from typing import List, Dict, Any
import uuid

# Email templates
EMAIL_TEMPLATES = {
    "check_in": {
        "subject_template": "Q4 Check-in: {account_name}",
        "body_template": """Hi {owner_name},

I wanted to check in on the {account_name} opportunity ({deal_value}) closing on {close_date}.

{context}

Let me know if there's anything I can do to help move this forward.

Best regards,
Demo User
"""
    },
    "follow_up": {
        "subject_template": "Following up: {account_name}",
        "body_template": """Hi {owner_name},

Just following up on our last conversation about {account_name}.

{context}

Looking forward to hearing from you.

Best,
Demo User
"""
    },
    "proposal": {
        "subject_template": "Proposal for {account_name}",
        "body_template": """Hi {owner_name},

Attached is the proposal for {account_name}.

{context}

Please let me know if you have any questions.

Best regards,
Demo User
"""
    }
}


# In-memory storage for "sent" emails
_sent_emails = []


def send_email(recipient: str, subject: str, body: str, cc: List[str] = None, attachments: List[str] = None) -> Dict[str, Any]:
    """
    Mock email sending - stores email in memory instead of actually sending.
    """
    email = {
        "message_id": str(uuid.uuid4()),
        "recipient": recipient,
        "subject": subject,
        "body": body,
        "cc": cc or [],
        "attachments": attachments or [],
        "sent": True,
        "timestamp": datetime.now().isoformat(),
        "status": "delivered"
    }

    _sent_emails.append(email)
    return email


def generate_email_from_template(
    template_name: str,
    owner_name: str,
    account_name: str,
    deal_value: str,
    close_date: str,
    context: str = ""
) -> Dict[str, str]:
    """Generate email subject and body from template."""
    template = EMAIL_TEMPLATES.get(template_name, EMAIL_TEMPLATES["check_in"])

    subject = template["subject_template"].format(
        account_name=account_name
    )

    body = template["body_template"].format(
        owner_name=owner_name,
        account_name=account_name,
        deal_value=deal_value,
        close_date=close_date,
        context=context or "I wanted to see how things are progressing."
    )

    return {"subject": subject, "body": body}


def get_sent_emails() -> List[Dict[str, Any]]:
    """Get all sent emails."""
    return _sent_emails


def clear_sent_emails():
    """Clear sent emails (for demo reset)."""
    global _sent_emails
    _sent_emails = []


def seed_outlook_data():
    """Seed mock email data (email templates already loaded)."""
    print(f"  📧 Loaded {len(EMAIL_TEMPLATES)} email templates")
