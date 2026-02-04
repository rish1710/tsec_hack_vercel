"""Data models for the application"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class User(BaseModel):
    """User model"""
    user_id: str
    email: str
    full_name: str
    role: UserRole
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class SessionStatus(str, Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class LearningSession(BaseModel):
    """Learning session model"""
    session_id: str
    teacher_id: str
    title: str
    description: str
    topic: str
    skill_level: str
    cost_per_minute: float
    estimated_duration: int
    status: SessionStatus = SessionStatus.SCHEDULED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewCredibilityFactors(BaseModel):
    """Factors determining review credibility"""
    session_duration: int  # minutes
    completion_percentage: float  # 0-100
    engagement_score: float  # 0-100
    time_to_exit: int  # seconds to exit
    learner_history_score: float  # based on past reviews

class Review(BaseModel):
    """Review model"""
    review_id: str
    session_id: str
    student_id: str
    teacher_id: str
    rating: float  # 1-5
    comment: str
    credibility_score: float  # 0-100 (calculated)
    credibility_factors: ReviewCredibilityFactors
    created_at: datetime = Field(default_factory=datetime.utcnow)
    weighted: bool = False  # whether low-credibility reviews should be weighted less
