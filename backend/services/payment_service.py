"""Finternet Payment Service - Session-based fund locking and settlement"""
import requests
import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

# Finternet API Configuration
FINTERNET_URL = os.getenv("FINTERNET_BASE_URL", "https://api.fmm.finternetlab.io")
FINTERNET_KEY = os.getenv("FINTERNET_API_KEY", "")

HEADERS = {
    "Authorization": f"Bearer {FINTERNET_KEY}",
    "Content-Type": "application/json"
}

class FinternetClient:
    """
    Finternet payment gateway client for Murph platform.
    
    Handles:
    - Fund locking at session start (max estimated amount)
    - Payment settlement at session end (actual usage)
    - Automatic refund of unused funds
    """
    
    @staticmethod
    def lock_funds(amount: float, user_id: str, session_id: str) -> Dict[str, Any]:
        """
        Lock funds at session start.
        
        Args:
            amount: Maximum amount to lock (rate_per_min * max_duration)
            user_id: Student's user ID
            session_id: Unique session identifier
            
        Returns:
            {
                "lock_id": str,
                "amount": float,
                "status": "locked",
                "timestamp": str
            }
            
        Raises:
            Exception: If fund locking fails (insufficient balance, API error)
        """
        try:
            logger.info(f"Locking {amount} for user {user_id}, session {session_id}")
            
            response = requests.post(
                f"{FINTERNET_URL}/lock",
                headers=HEADERS,
                json={
                    "amount": amount,
                    "user_id": user_id,
                    "session_id": session_id,
                    "description": f"Murph session {session_id}"
                },
                timeout=10
            )
            
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"Funds locked successfully: {result.get('lock_id')}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Finternet lock_funds failed: {str(e)}")
            raise Exception(f"Failed to lock funds: {str(e)}")
    
    @staticmethod
    def settle_payment(lock_id: str, final_amount: float, session_id: str) -> Dict[str, Any]:
        """
        Settle payment at session end.
        
        Args:
            lock_id: Lock ID from initial fund lock
            final_amount: Actual amount to charge (based on actual duration)
            session_id: Session identifier
            
        Returns:
            {
                "transaction_id": str,
                "lock_id": str,
                "charged_amount": float,
                "refunded_amount": float,
                "status": "settled",
                "timestamp": str
            }
            
        Raises:
            Exception: If settlement fails
        """
        try:
            logger.info(f"Settling payment for lock {lock_id}, amount {final_amount}")
            
            response = requests.post(
                f"{FINTERNET_URL}/settle",
                headers=HEADERS,
                json={
                    "lock_id": lock_id,
                    "amount": final_amount,
                    "session_id": session_id
                },
                timeout=10
            )
            
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"Payment settled: {result.get('transaction_id')}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Finternet settle_payment failed: {str(e)}")
            raise Exception(f"Failed to settle payment: {str(e)}")
    
    @staticmethod
    def refund_locked_funds(lock_id: str, reason: str = "session_cancelled") -> Dict[str, Any]:
        """
        Refund all locked funds (for cancelled sessions).
        
        Args:
            lock_id: Lock ID to refund
            reason: Cancellation reason
            
        Returns:
            {
                "refund_id": str,
                "lock_id": str,
                "refunded_amount": float,
                "status": "refunded",
                "timestamp": str
            }
        """
        try:
            logger.info(f"Refunding lock {lock_id}, reason: {reason}")
            
            response = requests.post(
                f"{FINTERNET_URL}/refund",
                headers=HEADERS,
                json={
                    "lock_id": lock_id,
                    "reason": reason
                },
                timeout=10
            )
            
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"Refund completed: {result.get('refund_id')}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Finternet refund failed: {str(e)}")
            raise Exception(f"Failed to refund: {str(e)}")
    
    @staticmethod
    def get_lock_status(lock_id: str) -> Dict[str, Any]:
        """
        Check status of a fund lock.
        
        Args:
            lock_id: Lock ID to check
            
        Returns:
            {
                "lock_id": str,
                "status": "locked" | "settled" | "refunded",
                "locked_amount": float,
                "remaining_amount": float
            }
        """
        try:
            response = requests.get(
                f"{FINTERNET_URL}/lock/{lock_id}",
                headers=HEADERS,
                timeout=10
            )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get lock status: {str(e)}")
            raise Exception(f"Failed to get lock status: {str(e)}")


class PaymentService:
    """
    Payment service wrapper for backward compatibility.
    Uses FinternetClient internally.
    """
    
    def __init__(self):
        self.finternet = FinternetClient()
    
    async def calculate_session_cost(
        self,
        duration_minutes: float,
        cost_per_minute: float
    ) -> float:
        """Calculate session cost based on actual duration"""
        return round(duration_minutes * cost_per_minute, 2)
    
    async def lock_session_funds(
        self,
        user_id: str,
        session_id: str,
        max_amount: float
    ) -> Dict[str, Any]:
        """Lock funds at session start"""
        return self.finternet.lock_funds(max_amount, user_id, session_id)
    
    async def settle_session_payment(
        self,
        lock_id: str,
        final_amount: float,
        session_id: str
    ) -> Dict[str, Any]:
        """Settle payment at session end"""
        return self.finternet.settle_payment(lock_id, final_amount, session_id)
    
    async def cancel_session_payment(
        self,
        lock_id: str,
        reason: str = "session_cancelled"
    ) -> Dict[str, Any]:
        """Refund locked funds for cancelled session"""
        return self.finternet.refund_locked_funds(lock_id, reason)

