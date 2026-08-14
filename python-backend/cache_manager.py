"""
Redis caching for high traffic handling
"""
import json
import redis
import hashlib
import logging
from typing import Optional, Any
from config import settings

logger = logging.getLogger(__name__)

class CacheManager:
    """Handle Redis caching"""
    
    def __init__(self):
        try:
            self.redis_client = redis.from_url(settings.redis_url, decode_responses=True)
            self.redis_client.ping()
            logger.info("Redis connected")
        except Exception as e:
            logger.warning(f"Redis not available: {e}")
            self.redis_client = None
    
    def _generate_key(self, prompt: str, image_base64: Optional[str] = None) -> str:
        """Generate cache key"""
        key_data = f"{prompt}:{image_base64[:100] if image_base64 else ''}"
        return f"ai_solution:{hashlib.md5(key_data.encode()).hexdigest()}"
    
    def get(self, prompt: str, image_base64: Optional[str] = None) -> Optional[dict]:
        """Get from cache"""
        if not self.redis_client:
            return None
        
        try:
            key = self._generate_key(prompt, image_base64)
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    def set(self, prompt: str, data: dict, image_base64: Optional[str] = None, ttl: int = 86400):
        """Set cache (24 hours default)"""
        if not self.redis_client:
            return
        
        try:
            key = self._generate_key(prompt, image_base64)
            self.redis_client.setex(key, ttl, json.dumps(data))
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    def delete(self, prompt: str, image_base64: Optional[str] = None):
        """Delete cache"""
        if not self.redis_client:
            return
        
        try:
            key = self._generate_key(prompt, image_base64)
            self.redis_client.delete(key)
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
    
    def clear_all(self):
        """Clear all cache"""
        if not self.redis_client:
            return
        
        try:
            self.redis_client.flushdb()
        except Exception as e:
            logger.error(f"Cache clear error: {e}")

cache_manager = CacheManager()
