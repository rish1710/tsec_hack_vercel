"""
Firestore Database Service - Handle all database operations
"""
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from typing import Dict, Any, List, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK using environment variables
if not firebase_admin._apps:
    # Build credentials from environment variables
    firebase_config = {
        "type": os.getenv("FIREBASE_TYPE", "service_account"),
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": os.getenv("FIREBASE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth"),
        "token_uri": os.getenv("FIREBASE_TOKEN_URI", "https://oauth2.googleapis.com/token"),
        "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL", "https://www.googleapis.com/oauth2/v1/certs"),
        "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL")
    }

    # Validate required fields
    required_fields = ["project_id", "private_key", "client_email"]
    missing_fields = [field for field in required_fields if not firebase_config.get(field)]

    if missing_fields:
        raise ValueError(f"Missing required Firebase configuration: {', '.join(missing_fields)}")

    cred = credentials.Certificate(firebase_config)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Collection names
SESSIONS_COLLECTION = "video_sessions"
FEEDBACK_COLLECTION = "feedback"
QUIZ_SCORES_COLLECTION = "quiz_scores"


def save_session(session_data: Dict[str, Any]) -> bool:
    """Save video session to Firestore"""
    try:
        session_id = session_data["session_id"]
        db.collection(SESSIONS_COLLECTION).document(session_id).set({
            **session_data,
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        return True
    except Exception as e:
        print(f"Error saving session: {e}")
        return False


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Get session by ID"""
    try:
        doc = db.collection(SESSIONS_COLLECTION).document(session_id).get()
        if doc.exists:
            return doc.to_dict()
        return None
    except Exception as e:
        print(f"Error getting session: {e}")
        return None


def update_session(session_id: str, update_data: Dict[str, Any]) -> bool:
    """Update session data"""
    try:
        db.collection(SESSIONS_COLLECTION).document(session_id).update({
            **update_data,
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        return True
    except Exception as e:
        print(f"Error updating session: {e}")
        return False


def save_feedback(feedback_data: Dict[str, Any]) -> bool:
    """Save feedback to Firestore"""
    try:
        # Use session_id as document ID for easy lookup
        session_id = feedback_data["session_id"]
        db.collection(FEEDBACK_COLLECTION).document(session_id).set({
            **feedback_data,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return True
    except Exception as e:
        print(f"Error saving feedback: {e}")
        return False


def save_quiz_score(quiz_data: Dict[str, Any]) -> bool:
    """Save quiz score to session document"""
    try:
        session_id = quiz_data["session_id"]
        session_doc = db.collection(SESSIONS_COLLECTION).document(session_id)
        session_doc.update({
            "quiz_scores": firestore.ArrayUnion([{
                "quiz_number": quiz_data.get("quiz_number", 1),
                "score": quiz_data.get("score", 0),
                "total_questions": quiz_data.get("total_questions", 0),
                "timestamp": datetime.utcnow().isoformat(),
                "video_time": quiz_data.get("video_time", 0)
            }])
        })
        return True
    except Exception as e:
        print(f"Error saving quiz score: {e}")
        return False


def get_all_feedback_by_video(video_id: str) -> List[Dict[str, Any]]:
    """Get all feedback for a specific video"""
    try:
        # Get all sessions for this video
        sessions = db.collection(SESSIONS_COLLECTION).where("video_id", "==", video_id).stream()

        feedback_list = []
        for session in sessions:
            session_data = session.to_dict()
            if session_data.get("feedback"):
                feedback_list.append({
                    "session_id": session_data["session_id"],
                    "student_id": session_data.get("student_id", "Unknown"),
                    "video_id": video_id,
                    "stars": session_data["feedback"]["stars"],
                    "review": session_data["feedback"].get("review", ""),
                    "watch_time_seconds": session_data.get("elapsed_seconds", 0),
                    "quiz_scores": session_data.get("quiz_scores", []),
                    "submitted_at": session_data["feedback"].get("submitted_at", ""),
                    "amount_charged": session_data.get("amount_charged", 0)
                })

        return feedback_list
    except Exception as e:
        print(f"Error getting feedback: {e}")
        return []


def get_video_analytics(video_id: str) -> Dict[str, Any]:
    """Get analytics for a specific video"""
    try:
        sessions = db.collection(SESSIONS_COLLECTION).where("video_id", "==", video_id).stream()

        total_views = 0
        total_watch_time = 0
        total_earned = 0
        unique_students = set()
        ratings = []
        completion_rates = []

        for session in sessions:
            data = session.to_dict()
            total_views += 1
            total_watch_time += data.get("elapsed_seconds", 0)
            total_earned += data.get("amount_charged", 0)

            student_id = data.get("student_id")
            if student_id:
                unique_students.add(student_id)

            feedback = data.get("feedback")
            if feedback:
                ratings.append(feedback["stars"])

            # Assuming 180s video duration
            if data.get("elapsed_seconds"):
                completion_rates.append(data["elapsed_seconds"] / 180.0)

        return {
            "total_sessions": total_views,
            "total_views": total_views,
            "unique_students": len(unique_students),
            "total_watch_time_seconds": total_watch_time,
            "total_watch_time_minutes": round(total_watch_time / 60, 2),
            "total_earnings": round(total_earned, 2),
            "total_earned": round(total_earned, 2),
            "avg_rating": round(sum(ratings) / len(ratings), 2) if ratings else 0,
            "average_rating": round(sum(ratings) / len(ratings), 2) if ratings else 0,
            "avg_completion_rate": round(sum(completion_rates) / len(completion_rates), 2) if completion_rates else 0,
            "average_completion_rate": round(sum(completion_rates) / len(completion_rates), 2) if completion_rates else 0,
            "avg_watch_time_seconds": round(total_watch_time / total_views, 2) if total_views > 0 else 0,
            "total_feedback": len(ratings)
        }
    except Exception as e:
        print(f"Error getting analytics: {e}")
        return {
            "total_sessions": 0,
            "total_views": 0,
            "unique_students": 0,
            "total_watch_time_seconds": 0,
            "total_watch_time_minutes": 0,
            "total_earnings": 0,
            "total_earned": 0,
            "avg_rating": 0,
            "average_rating": 0,
            "avg_completion_rate": 0,
            "average_completion_rate": 0,
            "avg_watch_time_seconds": 0,
            "total_feedback": 0
        }
