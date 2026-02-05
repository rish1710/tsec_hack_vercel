"""
Teacher Analytics Module - Calculate KPIs and metrics for teacher dashboard
"""
from typing import List, Dict, Any


def calculate_teacher_kpis(sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate teacher dashboard KPIs from session data
    Returns metrics like total views, watch time, earnings, etc.
    """
    if not sessions:
        return {
            "total_views": 0,
            "unique_students": 0,
            "total_watch_time_hours": 0,
            "total_earned": 0,
            "avg_watch_time_minutes": 0,
            "completion_rate": 0,
            "avg_rating": 0,
            "total_feedback": 0
        }

    total_views = len(sessions)
    unique_students = len(set(s["student_id"] for s in sessions))
    total_watch_time_seconds = sum(s["watch_time_seconds"] for s in sessions)
    total_earned = round(sum(s["amount_charged"] for s in sessions), 2)

    # Calculate average watch time
    avg_watch_time_minutes = round(total_watch_time_seconds / total_views / 60, 2)

    # Calculate completion rate (assuming 180s video)
    video_duration = 180
    total_completion = sum(min(s["watch_time_seconds"] / video_duration, 1.0) for s in sessions)
    completion_rate = round(total_completion / total_views, 2)

    # Calculate average rating
    ratings = [s["feedback"]["stars"] for s in sessions if s.get("feedback")]
    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0
    total_feedback = len(ratings)

    # Calculate earning potential (if all viewers watched full 3-minute video at $0.50/min)
    video_duration_minutes = 3
    earning_potential = round(total_views * (video_duration_minutes * 0.50), 2)

    return {
        "total_views": total_views,
        "unique_students": unique_students,
        "total_watch_time": total_watch_time_seconds,  # Return seconds, frontend will convert
        "total_earned": total_earned,
        "earning_potential": earning_potential,  # New KPI
        "avg_watch_time_minutes": avg_watch_time_minutes,
        "completion_rate": completion_rate,
        "average_rating": avg_rating,  # Match frontend field name
        "total_feedback": total_feedback
    }


def prepare_reviews_for_analysis(sessions: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """
    Prepare reviews separated by rating for AI analysis
    Returns positive (4-5 stars) and negative (1-3 stars) reviews
    """
    positive_reviews = []
    negative_reviews = []

    for session in sessions:
        feedback = session.get("feedback")
        if feedback and feedback.get("review"):
            stars = feedback["stars"]
            review_text = feedback["review"]

            if stars >= 4:
                positive_reviews.append(review_text)
            elif stars <= 3:
                negative_reviews.append(review_text)

    return {
        "positive": positive_reviews,
        "negative": negative_reviews
    }


def calculate_quiz_performance(sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate quiz performance metrics across all sessions
    """
    all_quiz_scores = []

    for session in sessions:
        quiz_scores = session.get("quiz_scores", [])
        all_quiz_scores.extend(quiz_scores)

    if not all_quiz_scores:
        return {
            "total_quizzes": 0,
            "avg_score": 0.0,
            "avg_percentage": 0.0,
            "completion_rate": 0.0
        }

    total_quizzes = len(all_quiz_scores)
    total_score = sum(q["score"] for q in all_quiz_scores)
    total_possible = sum(q["total_questions"] for q in all_quiz_scores)

    avg_score = round(total_score / total_quizzes, 2)
    avg_percentage = round((total_score / total_possible) * 100, 2) if total_possible > 0 else 0

    # Calculate quiz completion rate (students who took quiz vs total students)
    sessions_with_quizzes = len([s for s in sessions if s.get("quiz_scores")])
    completion_rate = round(sessions_with_quizzes / len(sessions), 2) if sessions else 0

    return {
        "total_quizzes": total_quizzes,
        "avg_score": avg_score,
        "avg_percentage": avg_percentage,
        "completion_rate": completion_rate
    }
