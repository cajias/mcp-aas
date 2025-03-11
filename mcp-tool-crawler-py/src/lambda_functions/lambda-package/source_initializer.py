"""
Lambda function to initialize sources from S3 or configuration.
"""

import json
import logging
import boto3
import os
import yaml
from typing import List, Dict, Any

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Import S3 client
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def load_sources_from_s3(bucket_name: str, source_list_key: str) -> List[Dict[str, Any]]:
    """
    Load sources from S3 YAML file.
    
    Args:
        bucket_name: S3 bucket name
        source_list_key: S3 object key
        
    Returns:
        List of source objects loaded from S3.
    """
    try:
        # Check if object exists
        try:
            s3_client.head_object(
                Bucket=bucket_name,
                Key=source_list_key
            )
        except Exception:
            logger.warning(f"No source list found in S3 bucket: {bucket_name}/{source_list_key}")
            return []
        
        # Get object from S3
        response = s3_client.get_object(
            Bucket=bucket_name,
            Key=source_list_key
        )
        
        # Parse YAML
        content = response['Body'].read().decode('utf-8')
        data = yaml.safe_load(content)
        sources_data = data.get('sources', [])
        
        logger.info(f"Loaded {len(sources_data)} sources from S3 bucket: {bucket_name}/{source_list_key}")
        return sources_data
    except Exception as e:
        logger.error(f"Error loading sources from S3: {str(e)}")
        return []

def initialize_sources(event):
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
        
        if not s3_bucket_name or not s3_source_list_key:
            s3_bucket_name = os.environ.get('S3_BUCKET_NAME')
            s3_source_list_key = os.environ.get('S3_SOURCE_LIST_KEY')
        
        if s3_bucket_name and s3_source_list_key:
            logger.info(f"Initializing sources from S3: s3://{s3_bucket_name}/{s3_source_list_key}")
            
            # Load sources from S3
            sources_data = load_sources_from_s3(s3_bucket_name, s3_source_list_key)
            
            # Save sources to DynamoDB
            if sources_data:
                table_name = os.environ.get('DYNAMODB_SOURCES_TABLE')
                table = dynamodb.Table(table_name)
                
                for source in sources_data:
                    # Generate a source ID if not present
                    if 'id' not in source:
                        import uuid
                        source['id'] = f"source-{uuid.uuid4()}"
                    
                    # Set has_known_crawler based on type if not provided
                    if 'has_known_crawler' not in source and 'type' in source:
                        source['has_known_crawler'] = source['type'] in ['github_awesome_list', 'github_repository']
                    
                    # Save to DynamoDB
                    table.put_item(Item=source)
            
            return {
                'sourceCount': len(sources_data),
                'sources': sources_data,
                'message': f"Initialized {len(sources_data)} sources successfully"
            }
        else:
            logger.warning("No S3 information provided in event or environment variables")
            return {
                'sourceCount': 0,
                'message': "No S3 bucket or key information provided"
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
        # Run the initialization
        result = initialize_sources(event)
        
        logger.info(f"Initialization complete: {json.dumps(result)}")
        return result
        
    except Exception as e:
        logger.error(f"Error in handler: {str(e)}")
        raise