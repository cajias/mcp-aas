"""
Storage services for MCP tools.
"""

import os
from typing import List, Union

from ..models import MCPTool
from .local_storage import LocalStorage
from .s3_storage import S3Storage


def get_storage():
    """
    Get the appropriate storage service based on the environment.
    
    In production, uses S3Storage, in development, uses LocalStorage.
    
    Returns:
        A storage service instance.
    """
    if os.environ.get('ENVIRONMENT', 'development') == 'production':
        return S3Storage()
    else:
        return LocalStorage()
