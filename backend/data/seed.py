"""
Seed demo data for the application.
"""
from data import mock_sfdc, mock_darwinbox, mock_outlook


def seed_demo_data():
    """Seed all demo data."""
    print("  🌱 Seeding demo data...")

    # Seed SFDC data
    mock_sfdc.seed_sfdc_data()

    # Seed Darwinbox data
    mock_darwinbox.seed_darwinbox_data()

    # Seed Outlook data (templates)
    mock_outlook.seed_outlook_data()

    print("  ✅ Demo data seeded successfully!")


def reset_demo_data():
    """Reset all demo data to initial state."""
    print("  🔄 Resetting demo data...")

    # Re-seed all data
    seed_demo_data()

    # Clear sent emails
    mock_outlook.clear_sent_emails()

    print("  ✅ Demo data reset complete!")
