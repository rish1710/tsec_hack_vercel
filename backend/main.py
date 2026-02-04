from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
import uvicorn
import json
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import core configuration
from core.config import settings

# Import API routers
from api import chat, sessions, reviews, payments, teacher

# Import database clients
from db.redis import RedisClient, redis_client as global_redis_client

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Guided Pay-Per-Minute Learning Platform"
)

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# STARTUP & SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize connections on startup"""
    logger.info("Starting Murph backend...")
    
    # Initialize Redis
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    global global_redis_client
    import db.redis as redis_module
    redis_module.redis_client = RedisClient(redis_url)
    
    try:
        await redis_module.redis_client.connect()
        logger.info("✓ Redis connected")
    except Exception as e:
        logger.warning(f"⚠ Redis connection failed: {str(e)}")
        logger.warning("  Sessions will not persist. Install Redis for production.")
    
    # Verify Finternet configuration
    finternet_url = os.getenv("FINTERNET_BASE_URL")
    finternet_key = os.getenv("FINTERNET_API_KEY")
    
    if not finternet_url or not finternet_key:
        logger.warning("⚠ Finternet credentials not configured")
        logger.warning("  Set FINTERNET_BASE_URL and FINTERNET_API_KEY in .env")
    else:
        logger.info("✓ Finternet configured")
    
    logger.info("Murph backend ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up connections on shutdown"""
    logger.info("Shutting down Murph backend...")
    
    import db.redis as redis_module
    if redis_module.redis_client:
        await redis_module.redis_client.disconnect()
        logger.info("✓ Redis disconnected")

# Include API routers
app.include_router(chat.router)
app.include_router(sessions.router)
app.include_router(reviews.router)
app.include_router(payments.router)
app.include_router(teacher.router)

# ============================================================================
# HEALTH & ROOT ENDPOINTS
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "murph-backend",
        "version": settings.APP_VERSION
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "endpoints": {
            "chat": "/api/chat",
            "sessions": "/api/sessions",
            "reviews": "/api/reviews",
            "payments": "/api/payments",
            "teacher": "/api/teacher"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
