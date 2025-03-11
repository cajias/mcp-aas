"""
Lambda function to initialize sources from S3 or configuration.
"""

import json
import logging
import boto3
import asyncio
import sys
import os
from pathlib import Path

# Add the parent directory to sys.path to import from the src directory
sys.path.append(str(Path(__file__).parents[1]))

from services.source_manager import SourceManager
from utils.logging import setup_logging

# Setup logging
logger = setup_logging(__name__)

async def initialize_sources(event):
    """
    Initialize sources from S3 or configuration.
    
    Args:
        event: The event payload containing optional S3 bucket and key information.
        
    Returns:
        Dict: The result of the operation.
    """
    try:
        # Get S3 bucket and key from the event if available
        s3_bucket_name = event.get('s3BucketName')
        s3_source_list_key = event.get('s3SourceListKey')
        
        if s3_bucket_name and s3_source_list_key:
            logger.info(f"Initializing sources from S3: s3://{s3_bucket_name}/{s3_source_list_key}")
            # These will be used by the source manager to determine where to load sources from
            os.environ['S3_BUCKET_NAME'] = s3_bucket_name
            os.environ['S3_SOURCE_LIST_KEY'] = s3_source_list_key
        else:
            logger.info("No S3 information provided, using default configuration")
            
        # Initialize the source manager
        source_manager = SourceManager()
        
        # Initialize sources (this will try S3 first if the env vars are set)
        sources = await source_manager.initialize_sources()
        
        return {
            'sourceCount': len(sources),
            'message': f"Initialized {len(sources)} sources successfully"
        }
        
    except Exception as e:
        logger.error(f"Error initializing sources: {str(e)}")
        raise

def handler(event, context):
    """
    Lambda function handler.
    
    Args:
        event: The event payload.
        context: The Lambda context.
        
    Returns:
        Dict: The response object.
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Run the async function
        result = asyncio.run(initialize_sources(event))
        
        logger.info(f"Initialization complete: {json.dumps(result)}")
        return result
        
    except Exception as e:
        logger.error(f"Error in handler: {str(e)}")
        raise