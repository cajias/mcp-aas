"""Test module for models."""
import pytest
from typing import Dict, Any
from src.models import Source, MCPTool, CrawlerStrategy, CrawlResult, SourceType

class TestSource:
    """Test the Source model."""
    
    def test_source_creation(self):
        """Test creating a valid Source."""
        source_data: Dict[str, Any] = {
            "url": "https://github.com/awesome-mcp/awesome-list",
            "name": "Awesome MCP List",
            "type": SourceType.GITHUB_AWESOME_LIST,
            "has_known_crawler": True
        }
        
        source = Source(**source_data)
        assert source.url == source_data["url"]
        assert source.name == source_data["name"]
        assert source.type == source_data["type"]
        assert source.has_known_crawler == source_data["has_known_crawler"]
        assert source.id is not None  # Should generate an ID

class TestMCPTool:
    """Test the MCPTool model."""
    
    def test_mcp_tool_creation(self):
        """Test creating a valid MCPTool."""
        tool_data: Dict[str, Any] = {
            "name": "Example MCP Tool",
            "url": "https://github.com/example/mcp-tool",
            "description": "An example MCP tool",
            "source_url": "https://github.com/awesome-mcp/awesome-list"
        }
        
        tool = MCPTool(**tool_data)
        assert tool.name == tool_data["name"]
        assert tool.url == tool_data["url"]
        assert tool.description == tool_data["description"]
        assert tool.source_url == tool_data["source_url"]
        assert tool.id is not None  # Should generate an ID
        assert tool.first_discovered is not None
        assert tool.last_updated is not None

class TestCrawlerStrategy:
    """Test the CrawlerStrategy model."""
    
    def test_crawler_strategy_creation(self):
        """Test creating a valid CrawlerStrategy."""
        strategy_data: Dict[str, Any] = {
            "source_id": "source-123456",
            "source_type": SourceType.WEBSITE,
            "implementation": "def extract_tools(content):\n    return []",
            "description": "Extracts tools from a website"
        }
        
        strategy = CrawlerStrategy(**strategy_data)
        assert strategy.source_id == strategy_data["source_id"]
        assert strategy.source_type == strategy_data["source_type"]
        assert strategy.implementation == strategy_data["implementation"]
        assert strategy.description == strategy_data["description"]
        assert strategy.id is not None
        assert strategy.created is not None
        assert strategy.last_modified is not None

class TestCrawlResult:
    """Test the CrawlResult model."""
    
    def test_crawl_result_creation(self):
        """Test creating a valid CrawlResult."""
        result_data: Dict[str, Any] = {
            "source_id": "source-123456",
            "success": True,
            "tools_discovered": 10,
            "new_tools": 5,
            "updated_tools": 2,
            "duration": 1500,  # milliseconds
            "error": None
        }
        
        result = CrawlResult(**result_data)
        assert result.source_id == result_data["source_id"]
        assert result.success == result_data["success"]
        assert result.tools_discovered == result_data["tools_discovered"]
        assert result.new_tools == result_data["new_tools"]
        assert result.updated_tools == result_data["updated_tools"]
        assert result.duration == result_data["duration"]
        assert result.error == result_data["error"]
        assert result.timestamp is not None  # Should generate a timestamp