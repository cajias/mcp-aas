"""
Lambda function to retrieve sources that need to be crawled.
"""

import json
import logging
import boto3
import os
from datetime import datetime, timezone, timedelta

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Import DynamoDB client
dynamodb = boto3.resource('dynamodb')

def get_sources_to_crawl(time_threshold_hours=24):
    """
    Get sources that need to be crawled.
    
    Args:
        time_threshold_hours: Time threshold in hours. Sources that haven't been
                             crawled in this period will be returned.
        
    Returns:
        List of sources to crawl.
    """
    try:
        # Get sources table
        table_name = os.environ.get('DYNAMODB_SOURCES_TABLE')
        table = dynamodb.Table(table_name)
        
        # Get all sources
        response = table.scan()
        all_sources = response.get('Items', [])
        
        # Calculate threshold timestamp
        threshold_time = (datetime.now(timezone.utc) - 
                         timedelta(hours=time_threshold_hours)).isoformat()
        
        # Filter sources
        sources_to_crawl = []
        
        for source in all_sources:
            # If the source has never been crawled, or was crawled before the threshold
            if not source.get('last_crawled') or source.get('last_crawled', '') < threshold_time:
                sources_to_crawl.append(source)
        
        logger.info(f"Found {len(sources_to_crawl)} sources to crawl")
        return sources_to_crawl
    except Exception as e:
        logger.error(f"Error getting sources to crawl: {str(e)}")
        return []

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
        # Get time threshold from event
        time_threshold = event.get('timeThreshold', 24)
        
        # Get sources to crawl
        sources = get_sources_to_crawl(time_threshold)
        
        logger.info(f"Returning {len(sources)} sources to crawl")
        return sources
        
    except Exception as e:
        logger.error(f"Error in handler: {str(e)}")
        raise