"""
Base crawler class for MCP tools.
"""

import time
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

from ..models import Source, MCPTool, CrawlResult
from ..utils.logging import get_logger
from ..utils.helpers import get_timestamp

logger = get_logger(__name__)


class BaseCrawler(ABC):
    """
    Base class for all MCP tool crawlers.
    """
    
    def __init__(self, source: Source):
        """
        Initialize the crawler.
        
        Args:
            source: The source to crawl.
        """
        self.source = source
        self.user_agent = "MCP-Tool-Crawler/1.0"
    
    def execute(self) -> CrawlResult:
        """
        Execute the crawler and return the results.
        
        Returns:
            A CrawlResult object.
        """
        start_time = time.time()
        logger.info(f"Starting crawl for source: {self.source.name} ({self.source.url})")
        
        try:
            # Discover tools
            discovered_tools = self.discover_tools()
            
            # Calculate results
            duration_ms = int((time.time() - start_time) * 1000)
            
            result = CrawlResult(
                source_id=self.source.id,
                timestamp=get_timestamp(),
                success=True,
                tools_discovered=len(discovered_tools),
                new_tools=len(discovered_tools),  # Simplified - in real implementation, we'd check against existing tools
                updated_tools=0,
                duration=duration_ms
            )
            
            logger.info(f"Crawl completed for {self.source.name}: {result.new_tools} new tools, {result.updated_tools} updated")
            return result
        
        except Exception as e:
            logger.error(f"Error crawling {self.source.name}: {str(e)}")
            
            # Calculate duration even in case of error
            duration_ms = int((time.time() - start_time) * 1000)
            
            result = CrawlResult(
                source_id=self.source.id,
                timestamp=get_timestamp(),
                success=False,
                tools_discovered=0,
                new_tools=0,
                updated_tools=0,
                duration=duration_ms,
                error=str(e)
            )
            
            return result
    
    @abstractmethod
    def discover_tools(self) -> List[MCPTool]:
        """
        Discover tools from the source.
        
        Returns:
            A list of MCPTool objects.
        
        Raises:
            NotImplementedError: If the subclass does not implement this method.
        """
        raise NotImplementedError("Subclasses must implement discover_tools()")
    
    def is_mcp_tool(self, name: str, description: str) -> bool:
        """
        Determine if a tool is an MCP tool based on name/description.
        
        Args:
            name: Tool name.
            description: Tool description.
            
        Returns:
            True if the tool appears to be MCP-related, False otherwise.
        """
        # Combine name and description for keyword matching
        combined = f"{name} {description}".lower()
        
        # Keywords that suggest the tool is MCP-related
        mcp_keywords = [
            'mcp',
            'machine context protocol',
            'context window',
            'ai context',
            'llm context',
            'large language model',
            'ai assistant',
            'code assistant',
            'rag',
            'retrieval',
            'ai tool',
            'ai agent',
            'langchain',
            'claude',
            'openai',
            'gpt',
            'llama',
            'prompt engineering',
            'context engineering',
            'document embedding',
            'embedding',
            'vector database',
            'vector store',
            'semantic search'
        ]
        
        # Check if any of the keywords are present
        return any(keyword in combined for keyword in mcp_keywords)
    
    def extract_tags(self, name: str, description: str) -> List[str]:
        """
        Extract tags from name and description.
        
        Args:
            name: Tool name.
            description: Tool description.
            
        Returns:
            List of tags.
        """
        tags = set()
        
        # Common tag categories for MCP tools
        tag_categories = {
            'library': ['library', 'sdk', 'framework', 'package', 'module'],
            'cli': ['cli', 'command line', 'terminal'],
            'api': ['api', 'service', 'endpoint', 'rest'],
            'ui': ['ui', 'interface', 'dashboard', 'web app'],
            'plugin': ['plugin', 'extension', 'addon'],
            'rag': ['rag', 'retrieval', 'retrieval augmented', 'augmented generation'],
            'embedding': ['embedding', 'embeddings', 'vector', 'vectorization'],
            'indexing': ['index', 'indexing', 'indexer'],
            'search': ['search', 'semantic search', 'query'],
            'agent': ['agent', 'autonomous', 'autonomous agent'],
        }
        
        # Combine name and description for keyword matching
        combined = f"{name} {description}".lower()
        
        # Check for each tag category
        for tag, keywords in tag_categories.items():
            if any(keyword in combined for keyword in keywords):
                tags.add(tag)
        
        # Add programming language tags if detected
        languages = [
            'python', 'javascript', 'typescript', 'java', 'c#', 'ruby',
            'go', 'rust', 'php', 'swift', 'kotlin'
        ]
        
        for lang in languages:
            if lang in combined:
                tags.add(lang)
        
        return list(tags)