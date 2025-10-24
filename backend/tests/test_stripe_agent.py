"""
Tests for Stripe Payment Agent.
"""
import pytest
from agents.stripe_agent import StripePaymentAgentAgent


@pytest.mark.asyncio
async def test_stripe_execute():
    """Test Stripe Payment Agent execution."""
    agent = StripePaymentAgentAgent(
        id="test_stripe",
        name="Test Stripe Payment Agent",
        config={}
    )

    result = await agent.execute(
        input_data={"test": "data"},
        context={}
    )

    assert result.success is True
    assert result.output is not None
    assert "message" in result.output


@pytest.mark.asyncio
async def test_stripe_error_handling():
    """Test Stripe Payment Agent error handling."""
    agent = StripePaymentAgentAgent(
        id="test_stripe",
        name="Test Stripe Payment Agent",
        config={}
    )

    # Test with invalid input
    result = await agent.execute(
        input_data=None,
        context={}
    )

    # Should handle gracefully
    assert result is not None
