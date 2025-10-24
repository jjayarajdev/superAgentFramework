"""
Mock Salesforce data generator.
"""
from faker import Faker
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any

fake = Faker()
Faker.seed(42)  # For reproducible demo data

# Fictional company names
COMPANIES = [
    "Acme Corporation", "Globex Industries", "Initech Solutions", "Umbrella Corp",
    "Stark Industries", "Wayne Enterprises", "Tyrell Corporation", "Massive Dynamic",
    "Cyberdyne Systems", "Soylent Corp", "Weyland-Yutani", "Oscorp Industries",
    "Hooli", "Pied Piper", "Aviato", "Raviga Capital", "Bachmanity",
    "Bluth Company", "Dunder Mifflin", "Sterling Cooper"
]

INDUSTRIES = [
    "Technology", "Financial Services", "Healthcare", "Manufacturing",
    "Retail", "Telecommunications", "Energy", "Media & Entertainment"
]

STAGES = [
    "Prospecting", "Qualification", "Needs Analysis", "Value Proposition",
    "Decision Makers", "Proposal/Price Quote", "Negotiation",
    "Closed Won", "Closed Lost"
]


def generate_accounts(count: int = 20) -> List[Dict[str, Any]]:
    """Generate mock Salesforce accounts."""
    accounts = []
    for i in range(count):
        account = {
            "Id": f"acc_{i+1:03d}",
            "Name": COMPANIES[i % len(COMPANIES)],
            "Industry": random.choice(INDUSTRIES),
            "AnnualRevenue": random.randint(1_000_000, 500_000_000),
            "NumberOfEmployees": random.choice([50, 100, 250, 500, 1000, 2500, 5000, 10000]),
            "BillingCity": fake.city(),
            "BillingState": fake.state(),
            "BillingCountry": "United States",
            "Phone": fake.phone_number(),
            "Website": f"www.{COMPANIES[i % len(COMPANIES)].lower().replace(' ', '')}.com",
            "Type": random.choice(["Customer", "Prospect", "Partner"]),
            "Rating": random.choice(["Hot", "Warm", "Cold"]),
            "OwnerId": f"user_{random.randint(1, 10):03d}",
            "CreatedDate": (datetime.now() - timedelta(days=random.randint(30, 730))).isoformat()
        }
        accounts.append(account)
    return accounts


def generate_contacts(count: int = 30, accounts: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Generate mock Salesforce contacts."""
    if accounts is None:
        accounts = generate_accounts(20)

    contacts = []
    for i in range(count):
        account = random.choice(accounts)
        contact = {
            "Id": f"con_{i+1:03d}",
            "FirstName": fake.first_name(),
            "LastName": fake.last_name(),
            "Email": fake.email(),
            "Phone": fake.phone_number(),
            "Title": random.choice([
                "CEO", "CTO", "CIO", "VP of Sales", "VP of Engineering",
                "Director of Operations", "Head of IT", "Product Manager",
                "Senior Engineer", "Sales Manager", "Account Executive"
            ]),
            "AccountId": account["Id"],
            "Account": {"Name": account["Name"]},
            "Department": random.choice(["Sales", "Engineering", "IT", "Operations", "Executive"]),
            "CreatedDate": (datetime.now() - timedelta(days=random.randint(30, 730))).isoformat()
        }
        contacts.append(contact)
    return contacts


def generate_opportunities(count: int = 50, accounts: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Generate mock Salesforce opportunities."""
    if accounts is None:
        accounts = generate_accounts(20)

    opportunities = []

    # Current date
    now = datetime.now()
    q4_start = datetime(now.year, 10, 1)
    q4_end = datetime(now.year, 12, 31)

    for i in range(count):
        account = random.choice(accounts)

        # Generate close date - more opportunities in Q4 for demo
        if i < 30:  # 60% in Q4
            close_date = fake.date_between(start_date=q4_start, end_date=q4_end)
        else:
            close_date = fake.date_between(start_date=now, end_date=now + timedelta(days=180))

        # Generate amount - more high-value deals for demo
        if i < 20:  # 40% > $100K
            amount = random.randint(100_000, 500_000)
        else:
            amount = random.randint(10_000, 99_000)

        # Stage distribution
        if close_date < now.date():
            stage = random.choice(["Closed Won", "Closed Lost"])
        else:
            stage = random.choice(STAGES[:-2])  # Exclude closed stages

        opportunity = {
            "Id": f"opp_{i+1:03d}",
            "Name": f"{account['Name']} - {random.choice(['Platform', 'Enterprise', 'Pro', 'Premium'])} Deal",
            "AccountId": account["Id"],
            "Account": {"Name": account["Name"], "Industry": account["Industry"]},
            "Amount": amount,
            "CloseDate": close_date.isoformat(),
            "StageName": stage,
            "Probability": random.randint(10, 90),
            "Type": random.choice(["New Business", "Existing Customer - Upgrade", "Existing Customer - Renewal"]),
            "LeadSource": random.choice(["Web", "Partner", "Referral", "Trade Show", "Cold Call"]),
            "OwnerId": f"user_{random.randint(1, 10):03d}",
            "OwnerName": fake.name(),
            "OwnerEmail": fake.email(),
            "Description": f"Opportunity for {account['Name']} in the {account['Industry']} industry. Potential deal value of ${amount:,}.",
            "NextStep": random.choice([
                "Schedule demo", "Send proposal", "Follow up with decision maker",
                "Negotiate terms", "Finalize contract", "Get executive approval"
            ]),
            "CreatedDate": (datetime.now() - timedelta(days=random.randint(10, 90))).isoformat(),
            "LastModifiedDate": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()
        }
        opportunities.append(opportunity)

    return opportunities


# In-memory storage
_accounts = []
_contacts = []
_opportunities = []


def seed_sfdc_data():
    """Seed mock SFDC data."""
    global _accounts, _contacts, _opportunities

    _accounts = generate_accounts(20)
    _contacts = generate_contacts(30, _accounts)
    _opportunities = generate_opportunities(50, _accounts)

    print(f"  📊 Generated {len(_accounts)} accounts")
    print(f"  👤 Generated {len(_contacts)} contacts")
    print(f"  💼 Generated {len(_opportunities)} opportunities")


def get_accounts() -> List[Dict[str, Any]]:
    """Get all accounts."""
    return _accounts


def get_contacts() -> List[Dict[str, Any]]:
    """Get all contacts."""
    return _contacts


def get_opportunities(filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """Get opportunities with optional filters."""
    opps = _opportunities

    if filters:
        # Simple filter implementation
        if "Amount" in filters:
            amount_filter = filters["Amount"]
            if isinstance(amount_filter, str) and ">" in amount_filter:
                threshold = int(amount_filter.split(">")[1].strip())
                opps = [o for o in opps if o["Amount"] > threshold]

        if "CloseDate" in filters:
            date_filter = filters["CloseDate"]
            if isinstance(date_filter, str) and "Q4" in date_filter:
                # Filter for Q4
                now = datetime.now()
                q4_start = datetime(now.year, 10, 1).date()
                q4_end = datetime(now.year, 12, 31).date()
                opps = [
                    o for o in opps
                    if q4_start <= datetime.fromisoformat(o["CloseDate"]).date() <= q4_end
                ]

        if "StageName" in filters:
            stage = filters["StageName"]
            opps = [o for o in opps if o["StageName"] == stage]

    return opps
