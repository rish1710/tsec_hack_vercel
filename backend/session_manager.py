"""
In-memory session manager for tracking active teaching sessions
"""
import time
from typing import Dict, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class SessionManager:
    def __init__(self):
        # In-memory storage: {session_id: session_data}
        self.sessions: Dict[str, Dict] = {}
        logger.info("Session Manager initialized")

    def create_session(
        self,
        session_id: str,
        intent_id: str,
        locked_amount: float,
        rate_per_minute: float
    ) -> Dict:
        """Create a new session"""
        session_data = {
            "session_id": session_id,
            "intent_id": intent_id,
            "locked_amount": locked_amount,
            "rate_per_minute": rate_per_minute,
            "start_time": time.time(),
            "end_time": None,
            "status": "active",
            "elapsed_seconds": 0,
            "teacher": "Guitar Master Pro",  # Hardcoded
            "student": "Student User",  # Hardcoded
            "session_title": "Live Guitar Basics"
        }
        self.sessions[session_id] = session_data
        logger.info(f"Session created: {session_id} | Intent: {intent_id}")
        return session_data

    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session details"""
        return self.sessions.get(session_id)

    def update_session_status(self, session_id: str) -> Optional[Dict]:
        """Update session with current elapsed time"""
        session = self.sessions.get(session_id)
        if not session:
            return None

        if session["status"] == "active":
            session["elapsed_seconds"] = int(time.time() - session["start_time"])

        return session

    def end_session(self, session_id: str) -> Optional[Dict]:
        """End a session and calculate final costs"""
        session = self.sessions.get(session_id)
        if not session:
            return None

        session["end_time"] = time.time()
        session["status"] = "completed"
        session["elapsed_seconds"] = int(session["end_time"] - session["start_time"])

        # Calculate costs
        elapsed_minutes = session["elapsed_seconds"] / 60.0
        amount_charged = round(elapsed_minutes * session["rate_per_minute"], 2)
        amount_refunded = round(session["locked_amount"] - amount_charged, 2)

        # Ensure we don't charge more than locked amount
        if amount_charged > session["locked_amount"]:
            amount_charged = session["locked_amount"]
            amount_refunded = 0.0

        session["elapsed_minutes"] = round(elapsed_minutes, 2)
        session["amount_charged"] = amount_charged
        session["amount_refunded"] = amount_refunded

        logger.info(f"Session ended: {session_id} | Duration: {elapsed_minutes:.2f}m | Charged: ${amount_charged} | Refunded: ${amount_refunded}")
        return session

    def get_all_sessions(self) -> Dict[str, Dict]:
        """Get all sessions (for debugging)"""
        return self.sessions
