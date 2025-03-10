import json
import os
import time
import uuid
import requests
from datetime import datetime
import logging
from typing import Dict, Any

import boto3
from openai import OpenAI

from ..models import Source, CrawlerStrategy, SourceType

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
crawler_table = dynamodb.Table(os.environ.get('DYNAMODB_CRAWLERS_TABLE', 'mcp-crawlers'))


def generate_crawler_for_website(source: Source) -> CrawlerStrategy:
    """
    Generate a crawler strategy for a website using AI.
    
    This function:
    1. Fetches the website content
    2. Uses OpenAI to analyze the content and generate a Python function
    3. Returns a crawler strategy with the generated function
    """
    logger.info(f"Generating crawler for {source.url}")
    start_time = time.time()
    
    try:
        # Fetch the website content
        headers = {"User-Agent": "MCP-Tool-Crawler/1.0"}
        response = requests.get(source.url, headers=headers, timeout=30)
        response.raise_for_status()
        html = response.text[:20000]  # Limit to first 20k chars
        
        # Use OpenAI to generate a crawler function
        logger.info(f"Calling OpenAI to generate crawler for {source.url}")
        
        completion = openai_client.chat.completions.create(
            model=os.environ.get('OPENAI_MODEL', 'gpt-4'),
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert web scraper. Your task is to generate a Python function that can extract MCP (Machine Context Protocol) tools from a webpage.
                    
                    The function should analyze the HTML structure, identify patterns, and extract tool information (name, description, URL).
                    
                    The function should:
                    1. Take the HTML content as input
                    2. Use BeautifulSoup for HTML parsing
                    3. Return a list of dictionaries with {'name': str, 'description': str, 'url': str} format
                    4. Focus on finding MCP tools which are AI-related tools that help with context windows, retrieval, embeddings, etc.
                    5. Be robust to handle variations in the page structure
                    
                    The function should be named "extract_tools" and have this signature:
                    
                    ```python
                    def extract_tools(html: str) -> list:
                        # Your code here
                        return [{'name': '...', 'description': '...', 'url': '...'}]
                    ```
                    
                    Please analyze the HTML and identify the pattern used to list tools or resources on the page."""
                },
                {
                    "role": "user",
                    "content": f"Generate a crawler function for the website: {source.url}\n\nHTML preview:\n{html[:10000]}"
                }
            ],
            temperature=0.2,
        )
        
        # Extract the function code from the response
        assistant_message = completion.choices[0].message.content
        
        # Look for Python code blocks in the response
        import re
        code_block_pattern = r'```python\s*(def extract_tools.*?)```'
        code_blocks = re.findall(code_block_pattern, assistant_message, re.DOTALL)
        
        if not code_blocks:
            # Try without the python prefix
            code_block_pattern = r'```\s*(def extract_tools.*?)```'
            code_blocks = re.findall(code_block_pattern, assistant_message, re.DOTALL)
        
        if not code_blocks:
            # Fall back to finding the function declaration
            code_block_pattern = r'(def extract_tools.*?)(?:```|$)'
            code_blocks = re.findall(code_block_pattern, assistant_message, re.DOTALL)
        
        if not code_blocks:
            raise ValueError("Could not extract a valid crawler function from the OpenAI response")
        
        # Use the first code block found
        function_code = code_blocks[0].strip()
        
        # TODO: In a real implementation, we would validate the function here by executing it
        # in a sandbox environment to ensure it works correctly
        
        # Create the crawler strategy
        timestamp = datetime.utcnow().isoformat()
        
        strategy = CrawlerStrategy(
            id=f"crawler-{uuid.uuid4()}",
            source_id=source.id,
            source_type=source.type,
            implementation=function_code,
            description=f"AI-generated crawler for {source.name}",
            created=timestamp,
            last_modified=timestamp
        )
        
        # TODO: Save the strategy to DynamoDB
        
        logger.info(f"Successfully generated crawler for {source.url} in {time.time() - start_time:.2f}s")
        return strategy
        
    except Exception as e:
        logger.error(f"Error generating crawler for {source.url}: {str(e)}")
        raise


def lambda_handler(event, context):
    """
    AWS Lambda handler for the crawler generator.
    
    Input event should contain a 'source' object that represents the source to crawl.
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Parse the source from the event
        source_data = event.get('source', {})
        source = Source(
            id=source_data.get('id'),
            url=source_data.get('url'),
            name=source_data.get('name'),
            type=SourceType(source_data.get('type')),
            has_known_crawler=source_data.get('has_known_crawler', False),
            crawler_id=source_data.get('crawler_id')
        )
        
        # Generate the crawler
        strategy = generate_crawler_for_website(source)
        
        # Convert to dict for JSON serialization
        return {
            'statusCode': 200,
            'body': {
                'id': strategy.id,
                'source_id': strategy.source_id,
                'source_type': strategy.source_type,
                'implementation': strategy.implementation,
                'description': strategy.description,
                'created': strategy.created,
                'last_modified': strategy.last_modified
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