"""
Local file storage service for MCP tools.
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

from ..models import MCPTool
from ..utils.logging import get_logger

logger = get_logger(__name__)


class LocalStorage:
    """
    Local file storage service for MCP tools.
    """
    
    def __init__(self, file_path: Optional[str] = None):
        """
        Initialize the local storage service.
        
        Args:
            file_path: Path to the file to store tools in. If None, uses the default path.
        """
        if file_path:
            self.file_path = Path(file_path)
        else:
            self.file_path = Path(__file__).parents[3] / 'data' / 'tools.json'
        
        # Ensure data directory exists
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
    
    async def save_tools(self, tools: List[MCPTool]) -> bool:
        """
        Save tools to a local file.
        
        Args:
            tools: List of tools to save.
            
        Returns:
            True if successful, False otherwise.
        """
        try:
            # Convert tools to JSON
            tools_json = [tool.dict() for tool in tools]
            
            # Write to file
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(tools_json, f, indent=2)
            
            logger.info(f"Saved {len(tools)} tools to {self.file_path}")
            return True
        except Exception as e:
            logger.error(f"Error saving tools to local file: {str(e)}")
            return False
    
    async def load_tools(self) -> List[MCPTool]:
        """
        Load tools from a local file.
        
        Returns:
            List of tools loaded from the file.
        """
        try:
            # Check if file exists
            if not self.file_path.exists():
                logger.warning(f"No tool catalog found at {self.file_path}")
                return []
            
            # Read file
            with open(self.file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Convert to MCPTool objects
            tools = [MCPTool(**item) for item in data]
            
            logger.info(f"Loaded {len(tools)} tools from {self.file_path}")
            return tools
        except Exception as e:
            logger.error(f"Error loading tools from local file: {str(e)}")
            return []