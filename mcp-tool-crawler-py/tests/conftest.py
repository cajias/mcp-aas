"""Pytest configuration file."""
import os
import sys
import pytest

# Add the src directory to the path so we can import modules directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Define fixtures that can be used by tests
@pytest.fixture
def test_source_data():
    """Return test data for a Source."""
    return {
        "url": "https://github.com/awesome-mcp/awesome-list",
        "name": "Awesome MCP List",
        "type": "github_awesome_list",
        "active": True
    }

@pytest.fixture
def test_mcp_tool_data():
    """Return test data for an MCPTool."""
    return {
        "name": "Example MCP Tool",
        "url": "https://github.com/example/mcp-tool",
        "description": "An example MCP tool",
        "source_id": "source-123456",
        "tags": ["ai", "test"]
    }

@pytest.fixture
def test_crawler_strategy_data():
    """Return test data for a CrawlerStrategy."""
    return {
        "name": "Example Strategy",
        "source_type": "website",
        "code": "def extract_tools(content):\n    return []",
        "version": "1.0.0"
    }