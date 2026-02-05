"""
Video Session Manager - Tracks video watching sessions and payment
Integrated with Firestore for persistent storage
"""
import time
import uuid
from typing import Dict, Any, Optional
from datetime import datetime
import firestore_service as fs

class VideoSessionManager:
    def __init__(self):
        # Keep in-memory cache for active sessions
        self.active_sessions: Dict[str, Dict[str, Any]] = {}

    def create_session(
        self,
        video_id: str,
        intent_id: str,
        locked_amount: float,
        rate_per_minute: float,
        student_address: str = "0x_student_address"
    ) -> Dict[str, Any]:
        """Create a new video watching session and save to Firestore"""
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
            "student_id": f"student_{uuid.uuid4().hex[:8]}",  # Generate student ID
            "created_at": datetime.utcnow().isoformat(),
            "quiz_scores": [],
            "feedback": None,
            "free_preview_completed": False
        }

        # Save to both cache and Firestore
        self.active_sessions[session_id] = session
        fs.save_session(session)

        return session

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by ID with current elapsed time"""
        # Try cache first
        session = self.active_sessions.get(session_id)

        # If not in cache, get from Firestore
        if not session:
            session = fs.get_session(session_id)
            if session:
                self.active_sessions[session_id] = session

        if session and session["status"] == "active":
            # Update elapsed time
            session["elapsed_seconds"] = int(time.time() - session["start_time"])
            session["amount_charged"] = (session["elapsed_seconds"] / 60) * session["rate_per_minute"]

        return session

    def end_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """End a video watching session and calculate final costs"""
        session = self.get_session(session_id)
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

        # Update Firestore
        fs.update_session(session_id, {
            "end_time": session["end_time"],
            "elapsed_seconds": session["elapsed_seconds"],
            "amount_charged": session["amount_charged"],
            "amount_refunded": session["amount_refunded"],
            "status": "completed"
        })

        # Remove from active cache
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]

        return session

    def add_quiz_score(self, session_id: str, quiz_data: Dict[str, Any]) -> bool:
        """Add quiz score to session"""
        session = self.get_session(session_id)
        if not session:
            return False

        quiz_entry = {
            "quiz_number": len(session.get("quiz_scores", [])) + 1,
            "score": quiz_data.get("score", 0),
            "total_questions": quiz_data.get("total_questions", 0),
            "timestamp": time.time(),
            "video_time": quiz_data.get("video_time", 0)
        }

        session["quiz_scores"].append(quiz_entry)

        # Save to Firestore
        fs.save_quiz_score({
            "session_id": session_id,
            **quiz_entry
        })

        return True

    def add_feedback(self, session_id: str, feedback_data: Dict[str, Any]) -> bool:
        """Add feedback to session"""
        session = self.get_session(session_id)
        if not session:
            return False

        feedback = {
            "stars": feedback_data.get("stars", 0),
            "review": feedback_data.get("review", ""),
            "submitted_at": datetime.utcnow().isoformat()
        }

        session["feedback"] = feedback

        # Save to Firestore
        fs.save_feedback({
            "session_id": session_id,
            "student_id": session.get("student_id", "Unknown"),
            "video_id": session.get("video_id"),
            **feedback
        })

        return True
