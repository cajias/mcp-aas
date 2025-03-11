"""
S3 storage service for MCP tools.
"""

import json
import boto3
from typing import List, Dict, Any, Optional

from ..models import MCPTool
from ..utils.logging import get_logger
from ..utils.config import get_config

logger = get_logger(__name__)
config = get_config()


class S3Storage:
    """
    S3 storage service for MCP tools.
    """
    
    def __init__(self, bucket_name: Optional[str] = None, key: Optional[str] = None):
        """
        Initialize the S3 storage service.
        
        Args:
            bucket_name: S3 bucket name. If None, uses the value from config.
            key: S3 object key. If None, uses the value from config.
        """
        self.bucket_name = bucket_name or config['aws']['s3']['bucket_name']
        self.key = key or config['aws']['s3']['tool_catalog_key']
        self.s3_client = boto3.client('s3')
    
    async def save_tools(self, tools: List[MCPTool]) -> bool:
        """
        Save tools to S3.
        
        Args:
            tools: List of tools to save.
            
        Returns:
            True if successful, False otherwise.
        """
        try:
            # Convert tools to JSON
            tools_json = [tool.dict() for tool in tools]
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=self.key,
                Body=json.dumps(tools_json, indent=2),
                ContentType='application/json'
            )
            
            logger.info(f"Saved {len(tools)} tools to S3 bucket: {self.bucket_name}/{self.key}")
            return True
        except Exception as e:
            logger.error(f"Error saving tools to S3: {str(e)}")
            return False
    
    async def load_tools(self) -> List[MCPTool]:
        """
        Load tools from S3.
        
        Returns:
            List of tools loaded from S3.
        """
        try:
            # Check if object exists
            try:
                self.s3_client.head_object(
                    Bucket=self.bucket_name,
                    Key=self.key
                )
            except Exception:
                logger.warning(f"No tool catalog found in S3 bucket: {self.bucket_name}/{self.key}")
                return []
            
            # Get object from S3
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=self.key
            )
            
            # Parse JSON
            data = json.loads(response['Body'].read().decode('utf-8'))
            
            # Convert to MCPTool objects
            tools = [MCPTool(**item) for item in data]
            
            logger.info(f"Loaded {len(tools)} tools from S3 bucket: {self.bucket_name}/{self.key}")
            return tools
        except Exception as e:
            logger.error(f"Error loading tools from S3: {str(e)}")
            return []