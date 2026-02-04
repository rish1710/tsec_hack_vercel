"""Sessions API - Manage learning sessions"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from services.session_service import SessionService

router = APIRouter(prefix="/api/sessions", tags=["sessions"])
session_service = SessionService()

class SessionCreate(BaseModel):
    title: str
    description: str
    topic: str
    skill_level: str
    cost_per_minute: float
    estimated_duration: int

class SessionResponse(BaseModel):
    session_id: str
    title: str
    description: str
    topic: str
    skill_level: str
    cost_per_minute: float
    estimated_duration: int
    status: str

@router.post("", response_model=SessionResponse)
async def create_session(session: SessionCreate, teacher_id: str):
    """Create a new learning session"""
    try:
        return await session_service.create_session(
            teacher_id=teacher_id,
            title=session.title,
            description=session.description,
            topic=session.topic,
            skill_level=session.skill_level,
            cost_per_minute=session.cost_per_minute,
            estimated_duration=session.estimated_duration
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    try:
        session = await session_service.get_session_details(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def list_sessions(
    topic: Optional[str] = None,
    skill_level: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """List all sessions with optional filters"""
    try:
        filters = {}
        if topic:
            filters["topic"] = topic
        if skill_level:
            filters["skill_level"] = skill_level
        
        return await session_service.list_sessions(filters, limit, offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{session_id}/start")
async def start_session(
    session_id: str,
    student_id: str,
    teacher_id: str,
    cost_per_minute: float
):
    """Start a session (begin billing and lock funds)"""
    try:
        return await session_service.start_session(
            session_id=session_id,
            student_id=student_id,
            teacher_id=teacher_id,
            cost_per_minute=cost_per_minute
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{session_id}/end")
async def end_session(session_id: str):
    """End a session, settle payment, and refund unused funds"""
    try:
        return await session_service.end_session(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{session_id}/cancel")
async def cancel_session(session_id: str, reason: str = "user_cancelled"):
    """Cancel a session and refund all locked funds"""
    try:
        return await session_service.cancel_session(session_id, reason)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
