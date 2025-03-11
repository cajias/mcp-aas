"""
S3 storage services for MCP tools and sources.
"""

import json
import csv
import boto3
import io
from typing import List, Dict, Any, Optional, Union

from ..models import MCPTool, Source, SourceType
from ..utils.logging import get_logger
from ..utils.config import get_config
from ..utils.helpers import is_github_repo, extract_domain

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


class S3SourceStorage:
    """
    S3 storage service for source lists.
    """
    
    def __init__(self, bucket_name: Optional[str] = None, key: Optional[str] = None):
        """
        Initialize the S3 source storage service.
        
        Args:
            bucket_name: S3 bucket name. If None, uses the value from config.
            key: S3 object key. If None, uses the value from config.
        """
        self.bucket_name = bucket_name or config['aws']['s3']['bucket_name']
        self.key = key or config['aws']['s3']['source_list_key']
        self.s3_client = boto3.client('s3')
    
    async def load_sources(self) -> List[Source]:
        """
        Load sources from S3 CSV file.
        
        Returns:
            List of Source objects loaded from S3.
        """
        try:
            # Check if object exists
            try:
                self.s3_client.head_object(
                    Bucket=self.bucket_name,
                    Key=self.key
                )
            except Exception:
                logger.warning(f"No source list found in S3 bucket: {self.bucket_name}/{self.key}")
                return []
            
            # Get object from S3
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=self.key
            )
            
            # Parse CSV
            content = response['Body'].read().decode('utf-8')
            csv_file = io.StringIO(content)
            reader = csv.DictReader(csv_file)
            
            sources = []
            for row in reader:
                url = row.get('url', '').strip()
                if not url:
                    continue
                
                name = row.get('name', '').strip()
                source_type_str = row.get('type', '').strip().lower()
                
                # Determine source type
                if source_type_str:
                    try:
                        source_type = SourceType(source_type_str)
                    except ValueError:
                        # Default to GITHUB_AWESOME_LIST if we can't parse the type
                        source_type = SourceType.GITHUB_AWESOME_LIST if is_github_repo(url) else SourceType.WEBSITE
                else:
                    # Auto-detect source type
                    if is_github_repo(url):
                        # Check if it looks like an awesome list (has "awesome" in the URL)
                        if 'awesome' in url.lower():
                            source_type = SourceType.GITHUB_AWESOME_LIST
                        else:
                            source_type = SourceType.GITHUB_REPOSITORY
                    else:
                        source_type = SourceType.WEBSITE
                
                # Generate name if not provided
                if not name:
                    domain = extract_domain(url)
                    name = f"MCP Tools ({domain})"
                
                # Create source
                source = Source(
                    url=url,
                    name=name,
                    type=source_type,
                    has_known_crawler=source_type in [SourceType.GITHUB_AWESOME_LIST, SourceType.GITHUB_REPOSITORY],
                )
                
                sources.append(source)
            
            logger.info(f"Loaded {len(sources)} sources from S3 bucket: {self.bucket_name}/{self.key}")
            return sources
        except Exception as e:
            logger.error(f"Error loading sources from S3: {str(e)}")
            return []