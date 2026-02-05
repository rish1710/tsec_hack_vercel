"""
Video Session Manager - Tracks video watching sessions and payment
"""
import time
import uuid
from typing import Dict, Any, Optional
from datetime import datetime

class VideoSessionManager:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def create_session(
        self,
        video_id: str,
        intent_id: str,
        locked_amount: float,
        rate_per_minute: float,
        student_address: str = "0x_student_address"
    ) -> Dict[str, Any]:
        """Create a new video watching session"""
        session_id = f"video_session_{uuid.uuid4().hex[:12]}"

        session = {
            "session_id": session_id,
            "video_id": video_id,
            "intent_id": intent_id,
            "locked_amount": locked_amount,
            "rate_per_minute": rate_per_minute,
            "start_time": time.time(),
            "end_time": None,
            "elapsed_seconds": 0,
            "amount_charged": 0.0,
            "amount_refunded": 0.0,
            "status": "active",
            "student_address": student_address,
            "created_at": datetime.utcnow().isoformat(),
            "quiz_scores": [],
            "feedback": None,
            "free_preview_completed": False
        }

        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by ID with current elapsed time"""
        session = self.sessions.get(session_id)
        if session and session["status"] == "active":
            # Update elapsed time
            session["elapsed_seconds"] = int(time.time() - session["start_time"])
            session["amount_charged"] = (session["elapsed_seconds"] / 60) * session["rate_per_minute"]
        return session

    def end_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """End a video watching session and calculate final costs"""
        session = self.sessions.get(session_id)
        if not session:
            return None

        session["end_time"] = time.time()
        session["elapsed_seconds"] = int(session["end_time"] - session["start_time"])

        # Calculate costs
        elapsed_minutes = session["elapsed_seconds"] / 60
        total_charged = elapsed_minutes * session["rate_per_minute"]

        # Cap at locked amount
        if total_charged > session["locked_amount"]:
            total_charged = session["locked_amount"]

        session["amount_charged"] = round(total_charged, 2)
        session["amount_refunded"] = round(session["locked_amount"] - total_charged, 2)
        session["status"] = "completed"

        return session

    def add_quiz_score(self, session_id: str, quiz_data: Dict[str, Any]) -> bool:
        """Add quiz score to session"""
        session = self.sessions.get(session_id)
        if not session:
            return False

        session["quiz_scores"].append({
            "quiz_number": len(session["quiz_scores"]) + 1,
            "score": quiz_data.get("score", 0),
            "total_questions": quiz_data.get("total_questions", 0),
            "timestamp": time.time(),
            "video_time": quiz_data.get("video_time", 0)
        })
        return True

    def add_feedback(self, session_id: str, feedback_data: Dict[str, Any]) -> bool:
        """Add feedback to session"""
        session = self.sessions.get(session_id)
        if not session:
            return False

        session["feedback"] = {
            "stars": feedback_data.get("stars", 0),
            "review": feedback_data.get("review", ""),
            "submitted_at": datetime.utcnow().isoformat()
        }
        return True

    def get_all_sessions(self) -> Dict[str, Dict[str, Any]]:
        """Get all sessions"""
        return self.sessions
