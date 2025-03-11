"""
Logging configuration for the MCP Tool Crawler.
"""

import logging
import os
import sys
from pathlib import Path

from .config import LOG_LEVEL

# Ensure logs directory exists
logs_dir = Path(__file__).parents[2] / 'logs'
logs_dir.mkdir(exist_ok=True)

# Configure logging
logger = logging.getLogger('mcp_tool_crawler')
logger.setLevel(getattr(logging, LOG_LEVEL))

# Create console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(getattr(logging, LOG_LEVEL))

# Create file handler
file_handler = logging.FileHandler(logs_dir / 'mcp_tool_crawler.log')
file_handler.setLevel(getattr(logging, LOG_LEVEL))

# Create formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Add formatter to handlers
console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

# Add handlers to logger
logger.addHandler(console_handler)
logger.addHandler(file_handler)

def get_logger(name: str = None) -> logging.Logger:
    """
    Get a logger instance.
    
    Args:
        name: Name of the logger. If None, the root logger is returned.
        
    Returns:
        A logger instance.
    """
    if name:
        return logger.getChild(name)
    return logger