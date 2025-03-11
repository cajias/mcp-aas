"""
Configuration module for the MCP Tool Crawler.
Loads environment variables and sets default values.
"""

import os
from pathlib import Path
from typing import Dict, List, Optional, Any

from dotenv import load_dotenv

# Load .env file if it exists
dotenv_path = Path(__file__).parents[2] / '.env'
if dotenv_path.exists():
    load_dotenv(dotenv_path)

# AWS Configuration
AWS_REGION = os.getenv('AWS_REGION', 'us-west-2')
AWS_PROFILE = os.getenv('AWS_PROFILE', 'default')

# AWS Resources
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME', 'mcp-tool-catalog')
DYNAMODB_TOOLS_TABLE = os.getenv('DYNAMODB_TOOLS_TABLE', 'mcp-tools')
DYNAMODB_SOURCES_TABLE = os.getenv('DYNAMODB_SOURCES_TABLE', 'mcp-sources')
DYNAMODB_CRAWLERS_TABLE = os.getenv('DYNAMODB_CRAWLERS_TABLE', 'mcp-crawlers')
DYNAMODB_CRAWL_RESULTS_TABLE = os.getenv('DYNAMODB_CRAWL_RESULTS_TABLE', 'mcp-crawl-results')

# OpenAI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4')

# Crawler Settings
CRAWLER_TIMEOUT = int(os.getenv('CRAWLER_TIMEOUT', '30000'))
CRAWLER_USER_AGENT = os.getenv('CRAWLER_USER_AGENT', 'MCP-Tool-Crawler/1.0')
CRAWLER_CONCURRENCY_LIMIT = int(os.getenv('CRAWLER_CONCURRENCY_LIMIT', '5'))

# GitHub API
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', '')

# Logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Pre-defined sources
PREDEFINED_SOURCES = {
    "awesome_lists": [
        "https://github.com/jpmcb/awesome-machine-context-protocol",
        "https://github.com/continuedev/awesome-continue",
    ],
    "websites": [
        {
            "url": "https://mcp-api.org/tools",
            "name": "MCP API.org Tools Directory"
        },
    ]
}

def get_config() -> Dict[str, Any]:
    """Return the configuration as a dictionary."""
    return {
        "aws": {
            "region": AWS_REGION,
            "profile": AWS_PROFILE,
            "dynamodb_tables": {
                "tools": DYNAMODB_TOOLS_TABLE,
                "sources": DYNAMODB_SOURCES_TABLE,
                "crawlers": DYNAMODB_CRAWLERS_TABLE,
                "crawl_results": DYNAMODB_CRAWL_RESULTS_TABLE,
            },
            "s3": {
                "bucket_name": S3_BUCKET_NAME,
                "tool_catalog_key": "tools.json",
            },
        },
        "openai": {
            "api_key": OPENAI_API_KEY,
            "model": OPENAI_MODEL,
        },
        "crawler": {
            "timeout": CRAWLER_TIMEOUT,
            "user_agent": CRAWLER_USER_AGENT,
            "concurrency_limit": CRAWLER_CONCURRENCY_LIMIT,
        },
        "github": {
            "token": GITHUB_TOKEN,
        },
        "sources": PREDEFINED_SOURCES,
        "logging": {
            "level": LOG_LEVEL,
        },
    }