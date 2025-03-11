import re
import requests
from typing import List, Dict, Any
import os
from urllib.parse import urlparse

from .base import BaseCrawler
from ..models import MCPTool, Source
from ..utils.logging import get_logger
from ..utils.helpers import extract_github_repo_info

logger = get_logger(__name__)


class GitHubAwesomeListCrawler(BaseCrawler):
    """Crawler for GitHub Awesome Lists"""
    
    def discover_tools(self) -> List[MCPTool]:
        """
        Discover MCP tools from a GitHub awesome list.
        
        Returns:
            A list of MCPTool objects.
            
        Raises:
            ValueError: If the URL is not a valid GitHub repository.
        """
        # Extract repo info from URL
        repo_info = extract_github_repo_info(self.source.url)
        
        if not repo_info:
            raise ValueError(f"Invalid GitHub repository URL: {self.source.url}")
        
        owner, repo = repo_info['owner'], repo_info['repo']
        
        # Fetch README content
        readme_content = self._fetch_readme(owner, repo)
        
        # Extract tools from README
        tools = self._extract_tools_from_readme(readme_content)
        
        logger.info(f"Extracted {len(tools)} tools from {self.source.url}")
        return tools
    
    def _fetch_readme(self, owner: str, repo: str) -> str:
        """
        Fetch the README.md content from a GitHub repository.
        
        Args:
            owner: Repository owner.
            repo: Repository name.
            
        Returns:
            README content as a string.
            
        Raises:
            ValueError: If the README cannot be fetched.
        """
        # Add GitHub token if available
        headers = {
            "User-Agent": self.user_agent,
        }
        
        github_token = os.environ.get("GITHUB_TOKEN")
        if github_token:
            headers["Authorization"] = f"token {github_token}"
        
        # Try main branch first
        main_url = f"https://raw.githubusercontent.com/{owner}/{repo}/main/README.md"
        
        try:
            response = requests.get(main_url, headers=headers, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.RequestException:
            # Try master branch as fallback
            master_url = f"https://raw.githubusercontent.com/{owner}/{repo}/master/README.md"
            
            try:
                response = requests.get(master_url, headers=headers, timeout=30)
                response.raise_for_status()
                return response.text
            except requests.RequestException as e:
                raise ValueError(f"Failed to fetch README from GitHub repo: {e}")
    
    def _extract_tools_from_readme(self, content: str) -> List[MCPTool]:
        """
        Extract MCP tools from README markdown content.
        
        Args:
            content: README markdown content.
            
        Returns:
            A list of MCPTool objects.
        """
        tools = []
        
        # Pattern 1: Markdown links in lists (most common format)
        # Example: "- [Tool Name](https://tool-url.com) - Tool description"
        list_pattern = r'^\s*[-*+]\s*\[([^\]]+)\]\(([^)]+)\)(.*?)$'
        
        for line in content.split('\n'):
            match = re.match(list_pattern, line)
            if match:
                name = match.group(1).strip()
                url = match.group(2).strip()
                description = match.group(3).strip()
                
                # If description starts with a dash or other separators, remove it
                description = re.sub(r'^[:-]\s*', '', description)
                
                if name and url and self.is_mcp_tool(name, description):
                    tools.append(MCPTool(
                        name=name,
                        description=description or name,
                        url=url,
                        source_url=self.source.url,
                        metadata={
                            "tags": self.extract_tags(name, description)
                        }
                    ))
        
        # Pattern 2: Tables (used in some awesome lists)
        table_pattern = r'^\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]+)'
        
        for line in content.split('\n'):
            match = re.match(table_pattern, line)
            if match:
                name = match.group(1).strip()
                url = match.group(2).strip()
                description = match.group(3).strip()
                
                if name and url and self.is_mcp_tool(name, description):
                    tools.append(MCPTool(
                        name=name,
                        description=description,
                        url=url,
                        source_url=self.source.url,
                        metadata={
                            "tags": self.extract_tags(name, description)
                        }
                    ))
        
        return tools