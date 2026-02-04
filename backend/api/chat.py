"""Chat API - Conversational learning discovery"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from services.ai_service import AIService
from services.session_service import SessionService

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Initialize services
ai_service = AIService()
session_service = SessionService()

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage]

class SessionRecommendation(BaseModel):
    session_id: str
    title: str
    description: str
    instructor_name: str
    estimated_minutes: int
    cost_per_minute: float
    total_estimated_cost: float
    relevance_score: float

class ChatResponse(BaseModel):
    message: str
    session_recommendation: Optional[SessionRecommendation] = None
    clarifying_questions: Optional[List[str]] = None

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint - AI-guided learning discovery
    """
    try:
        # Extract user intent
        intent = await ai_service.understand_intent(
            request.message,
            [{"role": m.role, "content": m.content} for m in request.conversation_history]
        )
        
        # Generate response
        response_text = await ai_service.generate_response(
            request.message,
            [{"role": m.role, "content": m.content} for m in request.conversation_history]
        )
        
        # If we have clear intent, find matching sessions
        session_recommendation = None
        if intent.get("learning_goal") and intent.get("skill_level"):
            matching_sessions = await ai_service.match_sessions(
                intent["learning_goal"],
                intent["skill_level"]
            )
            
            if matching_sessions:
                best_match = matching_sessions[0]
                session_recommendation = SessionRecommendation(
                    session_id=best_match["session_id"],
                    title=best_match["title"],
                    description=best_match["description"],
                    instructor_name=best_match["instructor_name"],
                    estimated_minutes=best_match["estimated_duration"],
                    cost_per_minute=best_match["cost_per_minute"],
                    total_estimated_cost=best_match["estimated_duration"] * best_match["cost_per_minute"],
                    relevance_score=await ai_service.score_relevance(best_match, intent["learning_goal"])
                )
        
        return ChatResponse(
            message=response_text,
            session_recommendation=session_recommendation,
            clarifying_questions=intent.get("clarifying_questions")
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for chat service"""
    return {"status": "ok", "service": "chat"}
