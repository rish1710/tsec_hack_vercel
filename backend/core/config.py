import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application configuration"""
    
    # App
    APP_NAME = "Murph"
    APP_VERSION = "0.1.0"
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/murph")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # CORS
    CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Payment
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLIC_KEY", "")
    
    # AI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "")
    
    # Session defaults
    DEFAULT_COST_PER_MINUTE = 0.5
    MIN_SESSION_DURATION = 5  # minutes
    MAX_SESSION_DURATION = 480  # minutes (8 hours)
    
settings = Settings()
