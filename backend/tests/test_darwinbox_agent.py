"""
Tests for DarwinBox.
"""
import pytest
from agents.darwinbox_agent import DarwinBoxAgent


@pytest.mark.asyncio
async def test_darwinbox_execute():
    """Test DarwinBox execution."""
    agent = DarwinBoxAgent(
        id="test_darwinbox",
        name="Test DarwinBox",
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
async def test_darwinbox_error_handling():
    """Test DarwinBox error handling."""
    agent = DarwinBoxAgent(
        id="test_darwinbox",
        name="Test DarwinBox",
        config={}
    )

    # Test with invalid input
    result = await agent.execute(
        input_data=None,
        context={}
    )

    # Should handle gracefully
    assert result is not None
