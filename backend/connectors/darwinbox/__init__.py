"""
Darwinbox Connector Package.

Provides enterprise-grade integration with Darwinbox HRMS.
"""
from .client import DarwinboxClient
from .exceptions import DarwinboxError, DarwinboxAuthError, DarwinboxAPIError

__all__ = ['DarwinboxClient', 'DarwinboxError', 'DarwinboxAuthError', 'DarwinboxAPIError']
