"""
Helper functions for the MCP Tool Crawler.
"""

import re
import uuid
from datetime import datetime
from typing import List, Set, Dict, Any, Optional
from urllib.parse import urlparse


def generate_id(prefix: str = '') -> str:
    """
    Generate a unique ID.
    
    Args:
        prefix: Optional prefix for the ID.
        
    Returns:
        A unique ID string.
    """
    return f"{prefix}-{uuid.uuid4()}" if prefix else str(uuid.uuid4())


def get_timestamp() -> str:
    """
    Get the current UTC timestamp in ISO format.
    
    Returns:
        Current UTC timestamp in ISO format.
    """
    return datetime.utcnow().isoformat()


def slugify(text: str) -> str:
    """
    Convert text to a URL-friendly slug.
    
    Args:
        text: Text to convert.
        
    Returns:
        URL-friendly slug.
    """
    # Convert to lowercase
    text = text.lower()
    # Replace non-word characters with hyphens
    text = re.sub(r'[^\w\s-]', '', text)
    # Replace whitespace with hyphens
    text = re.sub(r'[\s_-]+', '-', text)
    # Remove leading/trailing hyphens
    text = text.strip('-')
    return text


def is_github_repo(url: str) -> bool:
    """
    Check if a URL is a GitHub repository.
    
    Args:
        url: URL to check.
        
    Returns:
        True if the URL is a GitHub repository, False otherwise.
    """
    try:
        parsed_url = urlparse(url)
        if parsed_url.netloc != 'github.com':
            return False
        
        # Check if the path has at least owner/repo
        path_parts = parsed_url.path.strip('/').split('/')
        return len(path_parts) >= 2
    except Exception:
        return False


def extract_github_repo_info(url: str) -> Optional[Dict[str, str]]:
    """
    Extract repository information from a GitHub URL.
    
    Args:
        url: GitHub URL.
        
    Returns:
        Dictionary with owner and repo keys, or None if invalid.
    """
    try:
        parsed_url = urlparse(url)
        if parsed_url.netloc != 'github.com':
            return None
        
        path_parts = parsed_url.path.strip('/').split('/')
        if len(path_parts) < 2:
            return None
        
        return {
            'owner': path_parts[0],
            'repo': path_parts[1],
        }
    except Exception:
        return None


def extract_domain(url: str) -> str:
    """
    Extract domain from a URL.
    
    Args:
        url: URL to extract domain from.
        
    Returns:
        Domain name.
    """
    try:
        parsed_url = urlparse(url)
        return parsed_url.netloc
    except Exception:
        return ''


def deduplicate_by_key(items: List[Dict], key: str) -> List[Dict]:
    """
    Remove duplicates from a list of dictionaries based on a key.
    
    Args:
        items: List of dictionaries.
        key: Key to use for deduplication.
        
    Returns:
        Deduplicated list.
    """
    seen = set()
    result = []
    
    for item in items:
        value = item.get(key)
        if value not in seen:
            seen.add(value)
            result.append(item)
    
    return result