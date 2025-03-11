"""
MCP Tool crawlers package.

This package contains crawlers for different types of sources:
- GitHub Awesome Lists
- GitHub Repositories
- Websites with AI-generated crawlers
"""

from enum import Enum
from typing import Type

from ..models import Source, SourceType
from .github_awesome_list import GitHubAwesomeListCrawler


class CrawlerTypes(Enum):
    """Enum for crawler types."""
    GITHUB_AWESOME_LIST = GitHubAwesomeListCrawler
    

def get_crawler_for_source(source: Source):
    """
    Get the appropriate crawler for a source.
    
    Args:
        source: The source to get a crawler for.
        
    Returns:
        An instance of the appropriate crawler for the source.
        
    Raises:
        ValueError: If no crawler is available for the source type.
    """
    if source.type == SourceType.GITHUB_AWESOME_LIST:
        return GitHubAwesomeListCrawler(source)
    
    # Add more crawler types here as they are implemented
        
    raise ValueError(f"No crawler available for source type: {source.type}")
