"""Redis client for session management and caching"""
import redis.asyncio as redis
import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class RedisClient:
    """Redis wrapper for caching and session management"""
    
    def __init__(self, url: str):
        self.url = url
        self.client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Initialize Redis connection"""
        try:
            self.client = await redis.from_url(
                self.url,
                encoding="utf-8",
                decode_responses=True
            )
            # Test connection
            await self.client.ping()
            logger.info("Redis connected successfully")
        except Exception as e:
            logger.error(f"Redis connection failed: {str(e)}")
            raise
    
    async def disconnect(self):
        """Close Redis connection"""
        if self.client:
            await self.client.close()
            logger.info("Redis disconnected")
    
    async def set_session(self, session_id: str, data: Dict[str, Any], ttl: int = 7200):
        """
        Store session data with TTL (default 2 hours).
        
        Args:
            session_id: Unique session identifier
            data: Session data dictionary
            ttl: Time to live in seconds
        """
        try:
            serialized = json.dumps(data)
            await self.client.setex(f"session:{session_id}", ttl, serialized)
            logger.debug(f"Session {session_id} cached with TTL {ttl}s")
        except Exception as e:
            logger.error(f"Failed to cache session {session_id}: {str(e)}")
            raise
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve session data.
        
        Args:
            session_id: Session identifier
            
        Returns:
            Session data dictionary or None if not found
        """
        try:
            data = await self.client.get(f"session:{session_id}")
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Failed to get session {session_id}: {str(e)}")
            return None
    
    async def delete_session(self, session_id: str):
        """Delete session data"""
        try:
            await self.client.delete(f"session:{session_id}")
            logger.debug(f"Session {session_id} deleted")
        except Exception as e:
            logger.error(f"Failed to delete session {session_id}: {str(e)}")
    
    async def update_session(self, session_id: str, updates: Dict[str, Any]):
        """
        Update specific fields in session data.
        
        Args:
            session_id: Session identifier
            updates: Dictionary of fields to update
        """
        session = await self.get_session(session_id)
        if session:
            session.update(updates)
            # Preserve original TTL
            ttl = await self.client.ttl(f"session:{session_id}")
            await self.set_session(session_id, session, ttl if ttl > 0 else 7200)
    
    async def cache_recommendation(self, user_id: str, data: dict, ttl: int = 1800):
        """Cache AI recommendation (30 min default)"""
        try:
            serialized = json.dumps(data)
            await self.client.setex(f"rec:{user_id}", ttl, serialized)
        except Exception as e:
            logger.error(f"Failed to cache recommendation: {str(e)}")
    
    async def get_recommendation(self, user_id: str) -> Optional[dict]:
        """Get cached recommendation"""
        try:
            data = await self.client.get(f"rec:{user_id}")
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Failed to get recommendation: {str(e)}")
            return None
    
    async def health_check(self) -> bool:
        """Check if Redis is healthy"""
        try:
            await self.client.ping()
            return True
        except:
            return False

# Global Redis instance
redis_client: Optional[RedisClient] = None

async def get_redis() -> RedisClient:
    """Get Redis client instance"""
    global redis_client
    if not redis_client:
        raise Exception("Redis not initialized")
    return redis_client

