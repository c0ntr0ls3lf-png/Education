"""
Rate limiting for high traffic
"""
import time
from typing import Dict
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """Simple in-memory rate limiter (Redis-backed in production)"""
    
    def __init__(self, requests: int = 100, period: int = 60):
        self.requests = requests
        self.period = period
        self.requests_log: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, client_id: str) -> bool:
        """Check if request is allowed"""
        now = time.time()
        
        # Clean old requests
        self.requests_log[client_id] = [
            req_time for req_time in self.requests_log[client_id]
            if now - req_time < self.period
        ]
        
        # Check limit
        if len(self.requests_log[client_id]) >= self.requests:
            logger.warning(f"Rate limit exceeded for {client_id}")
            return False
        
        # Add current request
        self.requests_log[client_id].append(now)
        return True
    
    def get_remaining(self, client_id: str) -> int:
        """Get remaining requests"""
        now = time.time()
        self.requests_log[client_id] = [
            req_time for req_time in self.requests_log[client_id]
            if now - req_time < self.period
        ]
        return self.requests - len(self.requests_log[client_id])

rate_limiter = RateLimiter()
