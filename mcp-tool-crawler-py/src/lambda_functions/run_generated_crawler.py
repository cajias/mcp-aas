import json
import os
import time
import uuid
import requests
from datetime import datetime
import logging
from typing import Dict, Any, List
import importlib.util
import sys
from bs4 import BeautifulSoup

import boto3

from ..models import Source, CrawlerStrategy, MCPTool, SourceType

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
tools_table = dynamodb.Table(os.environ.get('DYNAMODB_TOOLS_TABLE', 'mcp-tools'))


def execute_crawler_safely(crawler_code: str, html: str) -> List[Dict[str, str]]:
    """
    Safely execute the generated crawler code.
    
    This function:
    1. Creates a safe execution environment
    2. Executes the crawler code
    3. Returns the extracted tools
    """
    # Security precaution: restrict imports in the executed code
    import RestrictedPython
    from RestrictedPython import safe_globals
    from RestrictedPython import utility_builtins
    from RestrictedPython import limited_builtins
    
    # Create restricted environment
    restricted_globals = {
        '__builtins__': utility_builtins,
        'BeautifulSoup': BeautifulSoup,
        're': __import__('re'),
        'html': html,
    }
    
    # Prepare the code for execution
    # Add a wrapper to call the extract_tools function with the provided HTML
    wrapper_code = f"""
{crawler_code}

# Call the function and return results
result = extract_tools(html)
"""
    
    try:
        # Compile the code
        byte_code = compile(wrapper_code, '<string>', 'exec')
        
        # Execute in restricted environment
        exec(byte_code, restricted_globals)
        
        # Get the result
        result = restricted_globals.get('result', [])
        
        # Validate result
        if not isinstance(result, list):
            raise ValueError("Crawler function did not return a list")
        
        # Ensure all items have required fields
        for item in result:
            if not all(key in item for key in ['name', 'description', 'url']):
                raise ValueError("Crawler function returned items missing required fields")
        
        return result
    except Exception as e:
        logger.error(f"Error executing crawler code: {str(e)}")
        raise


def run_generated_crawler(source: Source, strategy: CrawlerStrategy) -> List[MCPTool]:
    """
    Run a generated crawler for a specific source.
    
    This function:
    1. Fetches the website content
    2. Executes the crawler strategy
    3. Processes and returns the discovered tools
    """
    logger.info(f"Running generated crawler for {source.url}")
    start_time = time.time()
    
    try:
        # Fetch the website content
        headers = {"User-Agent": "MCP-Tool-Crawler/1.0"}
        response = requests.get(source.url, headers=headers, timeout=30)
        response.raise_for_status()
        html = response.text
        
        # Execute the crawler strategy
        extracted_items = execute_crawler_safely(strategy.implementation, html)
        
        # Convert to MCPTool objects
        timestamp = datetime.utcnow().isoformat()
        tools = []
        
        for item in extracted_items:
            tool_id = f"tool-{uuid.uuid4()}"
            
            tool = MCPTool(
                id=tool_id,
                name=item['name'],
                description=item['description'] or item['name'],
                url=item['url'],
                source_url=source.url,
                first_discovered=timestamp,
                last_updated=timestamp,
                metadata={
                    "tags": item.get('tags', [])
                }
            )
            
            # Save to DynamoDB
            # TODO: In a real implementation, we would handle deduplication here
            
            tools.append(tool)
        
        logger.info(f"Discovered {len(tools)} tools from {source.url} in {time.time() - start_time:.2f}s")
        return tools
        
    except Exception as e:
        logger.error(f"Error running crawler for {source.url}: {str(e)}")
        raise


def lambda_handler(event, context):
    """
    AWS Lambda handler for running a generated crawler.
    
    Input event should contain 'source' and 'crawlerStrategy' objects.
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Parse source from the event
        source_data = event.get('source', {})
        source = Source(
            id=source_data.get('id'),
            url=source_data.get('url'),
            name=source_data.get('name'),
            type=SourceType(source_data.get('type')),
            has_known_crawler=source_data.get('has_known_crawler', False),
            crawler_id=source_data.get('crawler_id')
        )
        
        # Parse crawler strategy from the event
        strategy_data = event.get('crawlerStrategy', {})
        strategy = CrawlerStrategy(
            id=strategy_data.get('id'),
            source_id=strategy_data.get('source_id'),
            source_type=SourceType(strategy_data.get('source_type')),
            implementation=strategy_data.get('implementation'),
            description=strategy_data.get('description'),
            created=strategy_data.get('created'),
            last_modified=strategy_data.get('last_modified')
        )
        
        # Run the crawler
        tools = run_generated_crawler(source, strategy)
        
        # Convert to dict for JSON serialization
        tools_data = [
            {
                'id': tool.id,
                'name': tool.name,
                'description': tool.description,
                'url': tool.url,
                'source_url': tool.source_url,
                'first_discovered': tool.first_discovered,
                'last_updated': tool.last_updated,
                'metadata': tool.metadata
            }
            for tool in tools
        ]
        
        return {
            'statusCode': 200,
            'body': {
                'tools': tools_data,
                'count': len(tools),
                'source_id': source.id,
                'source_url': source.url
            }
        }
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': {
                'error': str(e)
            }
        }