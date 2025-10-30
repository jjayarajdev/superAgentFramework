"""
Darwinbox API Client with SHA512 authentication.
"""
import hashlib
import time
import httpx
from typing import Dict, Any, Optional
from datetime import datetime

from .exceptions import DarwinboxAuthError, DarwinboxAPIError, DarwinboxRateLimitError


class DarwinboxClient:
    """
    Darwinbox API client with authentication and request handling.

    Implements SHA512-based token authentication as per Darwinbox API specs.
    """

    def __init__(
        self,
        admin_email: str,
        secret_key: str,
        base_url: str = "https://api.darwinbox.in",
        timeout: int = 30
    ):
        """
        Initialize Darwinbox client.

        Args:
            admin_email: Admin email for authentication
            secret_key: Secret key provided by Darwinbox
            base_url: API base URL (default: https://api.darwinbox.in)
            timeout: Request timeout in seconds
        """
        self.admin_email = admin_email
        self.secret_key = secret_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self._client = httpx.AsyncClient(timeout=timeout)

    def _generate_auth_token(self) -> str:
        """
        Generate SHA512 authentication token.

        Token format: SHA512(admin_email + secret_key + epoch_timestamp)

        Returns:
            SHA512 hash token
        """
        epoch = str(int(time.time()))
        payload = f"{self.admin_email}{self.secret_key}{epoch}"
        token = hashlib.sha512(payload.encode()).hexdigest()
        return token

    def _get_auth_headers(self) -> Dict[str, str]:
        """
        Get authentication headers.

        Returns:
            Dictionary with auth headers
        """
        token = self._generate_auth_token()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-Admin-Email": self.admin_email,
            "X-Timestamp": str(int(time.time()))
        }

    async def request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        retry_count: int = 3
    ) -> Dict[str, Any]:
        """
        Make authenticated API request.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint (e.g., '/employees')
            data: Request body data
            params: Query parameters
            retry_count: Number of retries for failed requests

        Returns:
            Response data as dictionary

        Raises:
            DarwinboxAuthError: Authentication failed
            DarwinboxAPIError: API request failed
            DarwinboxRateLimitError: Rate limit exceeded
        """
        url = f"{self.base_url}{endpoint}"
        headers = self._get_auth_headers()

        for attempt in range(retry_count):
            try:
                response = await self._client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    json=data,
                    params=params
                )

                # Handle rate limiting
                if response.status_code == 429:
                    if attempt < retry_count - 1:
                        wait_time = 2 ** attempt  # Exponential backoff
                        time.sleep(wait_time)
                        continue
                    raise DarwinboxRateLimitError("Rate limit exceeded")

                # Handle authentication errors
                if response.status_code == 401:
                    raise DarwinboxAuthError(
                        f"Authentication failed: {response.text}"
                    )

                # Handle other errors
                if response.status_code >= 400:
                    raise DarwinboxAPIError(
                        f"API request failed: {response.text}",
                        status_code=response.status_code,
                        response_data=response.json() if response.text else None
                    )

                # Success
                return response.json() if response.text else {}

            except httpx.HTTPError as e:
                if attempt == retry_count - 1:
                    raise DarwinboxAPIError(f"HTTP error: {str(e)}")
                time.sleep(2 ** attempt)

        raise DarwinboxAPIError("Max retries exceeded")

    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """GET request."""
        return await self.request("GET", endpoint, params=params)

    async def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """POST request."""
        return await self.request("POST", endpoint, data=data)

    async def put(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """PUT request."""
        return await self.request("PUT", endpoint, data=data)

    async def delete(self, endpoint: str) -> Dict[str, Any]:
        """DELETE request."""
        return await self.request("DELETE", endpoint)

    async def close(self):
        """Close HTTP client."""
        await self._client.aclose()

    def __del__(self):
        """Cleanup on deletion."""
        try:
            import asyncio
            asyncio.get_event_loop().run_until_complete(self.close())
        except:
            pass
