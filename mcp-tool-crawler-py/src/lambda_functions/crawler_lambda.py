"""
Lambda function handlers for MCP tool crawler.
"""

import json
import asyncio
from typing import Dict, Any, List

from ..models import Source, SourceType
from ..services.crawler_service import CrawlerService
from ..services.source_manager import SourceManager
from ..utils.logging import get_logger

logger = get_logger(__name__)


def initialize_sources_handler(event, context):
    """
    Handler for initializing sources Lambda function.
    
    Args:
        event: Lambda event object.
        context: Lambda context object.
        
    Returns:
        Dictionary with status code and list of sources.
    """
    logger.info("Initialize sources handler called")
    
    # Create source manager
    source_manager = SourceManager()
    
    try:
        # Initialize sources
        sources = asyncio.run(source_manager.initialize_sources())
        
        # Convert to JSON-serializable format
        sources_json = [source.dict() for source in sources]
        
        logger.info(f"Initialized {len(sources)} sources")
        
        return {
            'statusCode': 200,
            'body': sources_json,
        }
    except Exception as e:
        logger.error(f"Error initializing sources: {str(e)}")
        return {
            'statusCode': 500,
            'body': {
                'error': str(e),
            },
        }


def get_sources_to_crawl_handler(event, context):
    """
    Handler for getting sources to crawl Lambda function.
    
    Args:
        event: Lambda event object.
        context: Lambda context object.
        
    Returns:
        Dictionary with status code and list of sources to crawl.
    """
    logger.info("Get sources to crawl handler called")
    
    # Get time threshold from event or use default
    time_threshold_hours = event.get('timeThreshold', 24)
    
    # Create source manager
    source_manager = SourceManager()
    
    try:
        # Get sources to crawl
        sources = asyncio.run(source_manager.get_sources_to_crawl(time_threshold_hours))
        
        # Convert to JSON-serializable format
        sources_json = [source.dict() for source in sources]
        
        logger.info(f"Found {len(sources)} sources to crawl")
        
        return {
            'statusCode': 200,
            'body': sources_json,
        }
    except Exception as e:
        logger.error(f"Error getting sources to crawl: {str(e)}")
        return {
            'statusCode': 500,
            'body': {
                'error': str(e),
            },
        }


def crawl_source_handler(event, context):
    """
    Handler for crawling a source Lambda function.
    
    Args:
        event: Lambda event object.
        context: Lambda context object.
        
    Returns:
        Dictionary with status code and crawl results.
    """
    logger.info("Crawl source handler called")
    
    try:
        # Parse source from event
        source_data = event.get('source', {})
        source = Source(**source_data)
        
        # Create crawler service
        crawler_service = CrawlerService()
        
        # Crawl the source
        result = asyncio.run(crawler_service.crawl_source(source))
        
        # Convert to JSON-serializable format
        result_json = result.dict()
        
        logger.info(f"Crawl completed for source {source.name}: {result.tools_discovered} tools discovered")
        
        return {
            'statusCode': 200,
            'body': result_json,
        }
    except Exception as e:
        logger.error(f"Error crawling source: {str(e)}")
        return {
            'statusCode': 500,
            'body': {
                'error': str(e),
            },
        }


def crawl_all_sources_handler(event, context):
    """
    Handler for crawling all sources Lambda function.
    
    Args:
        event: Lambda event object.
        context: Lambda context object.
        
    Returns:
        Dictionary with status code and crawl results.
    """
    logger.info("Crawl all sources handler called")
    
    # Parse parameters from event
    force = event.get('force', False)
    concurrency = event.get('concurrency', None)
    
    try:
        # Create services
        source_manager = SourceManager()
        crawler_service = CrawlerService()
        
        # Initialize sources
        asyncio.run(source_manager.initialize_sources())
        
        # Crawl all sources
        results = asyncio.run(crawler_service.crawl_all_sources(force, concurrency))
        
        # Convert to JSON-serializable format
        results_json = [result.dict() for result in results]
        
        # Calculate summary
        success_count = sum(1 for result in results if result.success)
        total_tools = sum(result.tools_discovered for result in results if result.success)
        new_tools = sum(result.new_tools for result in results if result.success)
        updated_tools = sum(result.updated_tools for result in results if result.success)
        
        logger.info(f"Crawl all sources completed: {success_count}/{len(results)} successful")
        
        return {
            'statusCode': 200,
            'body': {
                'results': results_json,
                'summary': {
                    'total_sources': len(results),
                    'success_count': success_count,
                    'failure_count': len(results) - success_count,
                    'total_tools': total_tools,
                    'new_tools': new_tools,
                    'updated_tools': updated_tools,
                },
            },
        }
    except Exception as e:
        logger.error(f"Error crawling all sources: {str(e)}")
        return {
            'statusCode': 500,
            'body': {
                'error': str(e),
            },
        }