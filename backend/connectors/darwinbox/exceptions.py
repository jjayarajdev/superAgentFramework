"""
Custom exceptions for Darwinbox connector.
"""


class DarwinboxError(Exception):
    """Base exception for Darwinbox connector."""
    pass


class DarwinboxAuthError(DarwinboxError):
    """Authentication failed."""
    pass


class DarwinboxAPIError(DarwinboxError):
    """API request failed."""

    def __init__(self, message: str, status_code: int = None, response_data: dict = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_data = response_data


class DarwinboxRateLimitError(DarwinboxError):
    """Rate limit exceeded."""
    pass


class DarwinboxValidationError(DarwinboxError):
    """Request validation failed."""
    pass
