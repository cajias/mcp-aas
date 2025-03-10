from enum import Enum
from typing import Dict, List, Optional, Any
from datetime import datetime
from uuid import uuid4, UUID
from pydantic import BaseModel, Field, HttpUrl, validator


class SourceType(str, Enum):
    GITHUB_AWESOME_LIST = "github_awesome_list"
    GITHUB_REPOSITORY = "github_repository"
    WEBSITE = "website"
    RSS_FEED = "rss_feed"
    MANUALLY_ADDED = "manually_added"


class Source(BaseModel):
    """Model representing a source of MCP tools"""
    id: str = Field(default_factory=lambda: f"source-{uuid4()}")
    url: str
    name: str
    type: SourceType
    # Whether we have a predefined crawler for this source
    has_known_crawler: bool
    # ID of the crawler script to use
    crawler_id: Optional[str] = None
    # Last time this source was crawled
    last_crawled: Optional[str] = None
    # Status of the last crawl
    last_crawl_status: Optional[str] = None
    # Additional metadata specific to this source
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        validate_assignment = True
    
    @validator('last_crawled', 'last_crawl_status', pre=True, always=True)
    def set_defaults(cls, v):
        return v if v is not None else None


class MCPTool(BaseModel):
    """Model representing an MCP tool"""
    id: str = Field(default_factory=lambda: f"tool-{uuid4()}")
    name: str
    description: str
    url: str
    # URL to the source where this tool was discovered
    source_url: str
    # When this tool was first discovered
    first_discovered: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    # When this tool was last updated
    last_updated: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    # Optional metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        validate_assignment = True


class CrawlerStrategy(BaseModel):
    """Model representing a crawler strategy for a specific source"""
    id: str = Field(default_factory=lambda: f"crawler-{uuid4()}")
    source_id: str
    source_type: SourceType
    # The logic to use for this crawler (Python code as string)
    implementation: str
    # The AI-generated description of what this crawler does
    description: str
    # When this crawler was created
    created: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    # When this crawler was last modified
    last_modified: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    
    class Config:
        validate_assignment = True


class CrawlResult(BaseModel):
    """Model representing the result of a crawl operation"""
    source_id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    success: bool
    tools_discovered: int
    new_tools: int
    updated_tools: int
    duration: int  # milliseconds
    error: Optional[str] = None
    
    class Config:
        validate_assignment = True