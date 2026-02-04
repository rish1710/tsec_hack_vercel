from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TokenData(BaseModel):
    """JWT Token payload"""
    sub: str  # subject (user_id)
    exp: datetime
    type: str = "access"  # access or refresh

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    token_data = TokenData(sub=user_id, exp=expire)
    encoded_jwt = jwt.encode(
        token_data.model_dump(),
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def decode_access_token(token: str) -> Optional[TokenData]:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return TokenData(sub=user_id, exp=payload.get("exp"))
    except jwt.InvalidTokenError:
        return None
