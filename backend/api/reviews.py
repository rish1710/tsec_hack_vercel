"""Reviews API - Fair review system"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.credibility_service import CredibilityService

router = APIRouter(prefix="/api/reviews", tags=["reviews"])
credibility_service = CredibilityService()

class ReviewCreate(BaseModel):
    session_id: str
    student_id: str
    rating: float  # 1-5
    comment: str

class ReviewResponse(BaseModel):
    review_id: str
    session_id: str
    student_id: str
    rating: float
    comment: str
    credibility_score: float

@router.post("", response_model=ReviewResponse)
async def create_review(review: ReviewCreate):
    """Submit a review (credibility calculated server-side)"""
    try:
        # TODO: Get session details to calculate credibility
        credibility_score, factors = await credibility_service.calculate_credibility(
            session_id=review.session_id,
            student_id=review.student_id,
            session_duration_minutes=45,  # TODO: Get from session
            completion_percentage=100.0,   # TODO: Calculate
            time_to_exit_seconds=2700,     # TODO: Get from session
            student_review_history=[]      # TODO: Get from database
        )
        
        # TODO: Save review with credibility score
        
        return ReviewResponse(
            review_id="review_123",
            session_id=review.session_id,
            student_id=review.student_id,
            rating=review.rating,
            comment=review.comment,
            credibility_score=credibility_score
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/teacher/{teacher_id}")
async def get_teacher_rating(teacher_id: str):
    """Get teacher's weighted rating (only credible reviews)"""
    try:
        # TODO: Get all reviews for teacher
        reviews = []  # TODO: Fetch from database
        
        avg_rating, num_credible = await credibility_service.calculate_teacher_rating(
            reviews,
            weights_only_credible=True
        )
        
        return {
            "teacher_id": teacher_id,
            "rating": avg_rating,
            "credible_reviews": num_credible,
            "total_reviews": len(reviews)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session/{session_id}")
async def get_session_reviews(session_id: str):
    """Get all reviews for a session"""
    try:
        # TODO: Fetch reviews from database
        return {"session_id": session_id, "reviews": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
