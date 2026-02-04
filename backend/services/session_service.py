"""Session Service - Manage learning sessions with Finternet payments"""
from typing import Optional, List, Dict, Any
from datetime import datetime
import time
import logging
from services.payment_service import PaymentService
from db.redis import get_redis

logger = logging.getLogger(__name__)

class SessionService:
    """Service for managing learning sessions with pay-per-minute billing"""
    
    def __init__(self):
        self.payment_service = PaymentService()
        self.max_session_duration = 30  # minutes
    
    async def create_session(
        self,
        teacher_id: str,
        title: str,
        description: str,
        topic: str,
        skill_level: str,
        cost_per_minute: float,
        estimated_duration: int
    ) -> dict:
        """Create a new learning session"""
        # TODO: Save to database
        session_id = f"sess_{int(time.time())}"
        return {
            "session_id": session_id,
            "teacher_id": teacher_id,
            "title": title,
            "description": description,
            "topic": topic,
            "skill_level": skill_level,
            "cost_per_minute": cost_per_minute,
            "estimated_duration": estimated_duration,
            "status": "scheduled"
        }
    
    async def start_session(
        self,
        session_id: str,
        student_id: str,
        teacher_id: str,
        cost_per_minute: float
    ) -> dict:
        """
        Start an active session with fund locking.
        
        Flow:
        1. Calculate max amount (cost_per_min * max_duration)
        2. Lock funds via Finternet
        3. Store session data in Redis with lock_id
        4. Return session start info
        """
        try:
            # Calculate maximum amount to lock
            max_amount = cost_per_minute * self.max_session_duration
            
            logger.info(f"Starting session {session_id} for student {student_id}")
            
            # Lock funds via Finternet
            lock_result = await self.payment_service.lock_session_funds(
                user_id=student_id,
                session_id=session_id,
                max_amount=max_amount
            )
            
            # Store session data in Redis
            redis = await get_redis()
            session_data = {
                "session_id": session_id,
                "student_id": student_id,
                "teacher_id": teacher_id,
                "start_time": time.time(),
                "cost_per_minute": cost_per_minute,
                "lock_id": lock_result.get("lock_id"),
                "locked_amount": max_amount,
                "status": "active"
            }
            
            await redis.set_session(session_id, session_data)
            
            logger.info(f"Session {session_id} started, funds locked: {lock_result.get('lock_id')}")
            
            return {
                "session_id": session_id,
                "started_at": datetime.utcnow().isoformat(),
                "cost_per_minute": cost_per_minute,
                "max_duration_minutes": self.max_session_duration,
                "locked_amount": max_amount,
                "lock_id": lock_result.get("lock_id"),
                "status": "active"
            }
            
        except Exception as e:
            logger.error(f"Failed to start session {session_id}: {str(e)}")
            raise Exception(f"Failed to start session: {str(e)}")
    
    async def end_session(self, session_id: str) -> dict:
        """
        End session and settle payment.
        
        Flow:
        1. Get session data from Redis
        2. Calculate actual duration and cost
        3. Settle payment via Finternet (charge actual, refund unused)
        4. Clean up Redis session
        5. Return session summary
        """
        try:
            redis = await get_redis()
            session_data = await redis.get_session(session_id)
            
            if not session_data:
                raise Exception(f"Session {session_id} not found")
            
            # Calculate actual duration
            duration_seconds = time.time() - session_data["start_time"]
            duration_minutes = duration_seconds / 60
            
            # Calculate final cost
            final_cost = await self.payment_service.calculate_session_cost(
                duration_minutes=duration_minutes,
                cost_per_minute=session_data["cost_per_minute"]
            )
            
            logger.info(f"Ending session {session_id}, duration: {duration_minutes:.2f} min, cost: {final_cost}")
            
            # Settle payment via Finternet
            settlement_result = await self.payment_service.settle_session_payment(
                lock_id=session_data["lock_id"],
                final_amount=final_cost,
                session_id=session_id
            )
            
            # Update session status in Redis
            await redis.update_session(session_id, {"status": "completed"})
            
            # Calculate refunded amount
            refunded = session_data["locked_amount"] - final_cost
            
            logger.info(f"Session {session_id} completed, charged: {final_cost}, refunded: {refunded}")
            
            return {
                "session_id": session_id,
                "status": "completed",
                "duration_minutes": round(duration_minutes, 2),
                "cost_per_minute": session_data["cost_per_minute"],
                "total_cost": final_cost,
                "locked_amount": session_data["locked_amount"],
                "refunded_amount": refunded,
                "transaction_id": settlement_result.get("transaction_id"),
                "ended_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to end session {session_id}: {str(e)}")
            raise Exception(f"Failed to end session: {str(e)}")
    
    async def cancel_session(self, session_id: str, reason: str = "user_cancelled") -> dict:
        """
        Cancel session and refund all locked funds.
        """
        try:
            redis = await get_redis()
            session_data = await redis.get_session(session_id)
            
            if not session_data:
                raise Exception(f"Session {session_id} not found")
            
            # Refund all locked funds
            refund_result = await self.payment_service.cancel_session_payment(
                lock_id=session_data["lock_id"],
                reason=reason
            )
            
            # Update session status
            await redis.update_session(session_id, {"status": "cancelled"})
            
            logger.info(f"Session {session_id} cancelled, refunded: {session_data['locked_amount']}")
            
            return {
                "session_id": session_id,
                "status": "cancelled",
                "refunded_amount": session_data["locked_amount"],
                "refund_id": refund_result.get("refund_id"),
                "reason": reason
            }
            
        except Exception as e:
            logger.error(f"Failed to cancel session {session_id}: {str(e)}")
            raise Exception(f"Failed to cancel session: {str(e)}")
    
    async def get_session_details(self, session_id: str) -> Optional[dict]:
        """Get session details from Redis"""
        try:
            redis = await get_redis()
            return await redis.get_session(session_id)
        except Exception as e:
            logger.error(f"Failed to get session {session_id}: {str(e)}")
            return None
    
    async def list_sessions(
        self,
        filters: Optional[dict] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[dict]:
        """List all sessions with optional filters"""
        # TODO: Query database with filters
        return []
    
    async def search_sessions(
        self,
        query: str,
        topic: Optional[str] = None,
        skill_level: Optional[str] = None,
        max_cost: Optional[float] = None
    ) -> List[dict]:
        """Search sessions by query and filters"""
        # TODO: Implement full-text search
        return []

