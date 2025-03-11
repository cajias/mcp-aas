"""
Lambda function to handle S3 events and trigger the Step Function.
"""

import json
import os
import boto3
import logging
from urllib.parse import unquote_plus

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
sfn_client = boto3.client('stepfunctions')

def handler(event, context):
    """
    Lambda function handler for S3 events.
    
    Args:
        event: The event payload.
        context: The Lambda context.
        
    Returns:
        Dict: The response object.
    """
    # Log the received event
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Get the STATE_MACHINE_ARN from environment variables
        state_machine_arn = os.environ['STATE_MACHINE_ARN']
        
        # Extract bucket and key from the S3 event
        for record in event['Records']:
            bucket = record['s3']['bucket']['name']
            key = unquote_plus(record['s3']['object']['key'])
            
            logger.info(f"S3 object updated: s3://{bucket}/{key}")
            
            # Only process if it's the source list file
            if key != os.environ.get('S3_SOURCE_LIST_KEY', 'sources.yaml'):
                logger.info(f"Skipping {key} as it's not the source list file")
                continue
            
            # Prepare input for the Step Function
            step_function_input = {
                's3BucketName': bucket,
                's3SourceListKey': key,
                'timeThreshold': 24  # Default time threshold in hours
            }
            
            logger.info(f"Starting Step Function execution with input: {json.dumps(step_function_input)}")
            
            # Start the Step Function execution
            response = sfn_client.start_execution(
                stateMachineArn=state_machine_arn,
                input=json.dumps(step_function_input)
            )
            
            logger.info(f"Step Function execution started: {response['executionArn']}")
        
        return {
            'statusCode': 200,
            'body': json.dumps('Step Function execution started successfully')
        }
        
    except Exception as e:
        logger.error(f"Error processing S3 event: {str(e)}")
        
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error: {str(e)}")
        }