"""Payments API - Usage-based billing"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.payment_service import PaymentService

router = APIRouter(prefix="/api/payments", tags=["payments"])
payment_service = PaymentService()

class PaymentRequest(BaseModel):
    student_id: str
    session_id: str
    amount: float

class PaymentResponse(BaseModel):
    transaction_id: str
    status: str
    amount: float

@router.post("/charge", response_model=PaymentResponse)
async def charge_student(request: PaymentRequest):
    """Charge student for completed session"""
    try:
        result = await payment_service.charge_student(
            request.student_id,
            request.session_id,
            request.amount
        )
        return PaymentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/{student_id}")
async def get_student_spending(student_id: str):
    """Get student's spending summary"""
    try:
        return await payment_service.get_student_spending(student_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/teacher/{teacher_id}/earnings")
async def get_teacher_earnings(teacher_id: str):
    """Get teacher's earnings breakdown"""
    try:
        return await payment_service.get_teacher_earnings(teacher_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/teacher/{teacher_id}/bonus")
async def calculate_bonus(teacher_id: str, rating: float, credible_reviews: int, completion_rate: float):
    """Calculate quality-based bonus for teacher"""
    try:
        bonus = await payment_service.calculate_teacher_bonus(
            rating,
            credible_reviews,
            completion_rate
        )
        return {
            "teacher_id": teacher_id,
            "bonus_percentage": bonus,
            "explanation": f"Quality bonus based on {credible_reviews} credible reviews and {rating:.1f}★ rating"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
