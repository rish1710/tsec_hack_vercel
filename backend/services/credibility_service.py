"""Review Credibility Service - Fair review system"""
from typing import Optional
from datetime import datetime, timedelta

class CredibilityService:
    """Calculate review credibility scores"""
    
    def __init__(self):
        self.weights = {
            "session_duration": 0.3,      # longer sessions = more credible
            "completion_percentage": 0.3, # more completed = more credible
            "engagement_score": 0.2,      # active participation = more credible
            "learner_history": 0.2        # consistent reviewer = more credible
        }
    
    async def calculate_credibility(
        self,
        session_id: str,
        student_id: str,
        session_duration_minutes: int,
        completion_percentage: float,
        time_to_exit_seconds: int,
        student_review_history: list
    ) -> tuple[float, dict]:
        """
        Calculate review credibility score (0-100)
        
        Returns:
            (credibility_score, factors_dict)
        """
        
        # Factor 1: Session duration (5-60 min optimal)
        duration_score = self._score_duration(session_duration_minutes)
        
        # Factor 2: Completion percentage (>90% is credible)
        completion_score = min(completion_percentage * 1.11, 100)
        
        # Factor 3: Engagement score (time spent actively in session)
        engagement_score = self._calculate_engagement(
            session_duration_minutes,
            time_to_exit_seconds
        )
        
        # Factor 4: Learner history (consistent, thoughtful reviewers)
        history_score = self._score_learner_history(student_review_history)
        
        # Calculate weighted score
        credibility_score = (
            (duration_score * self.weights["session_duration"]) +
            (completion_score * self.weights["completion_percentage"]) +
            (engagement_score * self.weights["engagement_score"]) +
            (history_score * self.weights["learner_history"])
        )
        
        return credibility_score, {
            "duration_score": duration_score,
            "completion_score": completion_score,
            "engagement_score": engagement_score,
            "history_score": history_score
        }
    
    def _score_duration(self, minutes: int) -> float:
        """Score based on session duration"""
        if minutes < 5:
            return 20.0  # too short, low credibility
        elif 5 <= minutes <= 60:
            return 100.0  # optimal range
        elif 60 < minutes <= 120:
            return 80.0  # longer but okay
        else:
            return 60.0  # very long sessions less credible
    
    def _calculate_engagement(self, duration_minutes: int, exit_seconds: int) -> float:
        """Calculate engagement based on time spent vs session duration"""
        total_seconds = duration_minutes * 60
        engagement_ratio = exit_seconds / total_seconds if total_seconds > 0 else 0
        
        if engagement_ratio > 0.8:
            return 100.0  # stayed for 80%+ of session
        elif engagement_ratio > 0.5:
            return 70.0   # stayed for 50-80%
        elif engagement_ratio > 0.2:
            return 40.0   # only stayed for 20-50%
        else:
            return 10.0   # exited very early (impulsive)
    
    def _score_learner_history(self, review_history: list) -> float:
        """Score based on reviewer's history"""
        if not review_history:
            return 50.0  # new reviewer
        
        # Consistent reviewers with detailed feedback = higher score
        avg_rating = sum(r.get("rating", 3) for r in review_history) / len(review_history)
        avg_comment_length = sum(len(r.get("comment", "")) for r in review_history) / len(review_history)
        
        # Moderate ratings + detailed comments = credible
        if 3.5 <= avg_rating <= 4.5 and avg_comment_length > 50:
            return 90.0
        elif avg_comment_length > 50:
            return 75.0
        else:
            return 50.0
    
    async def should_weight_review(self, credibility_score: float) -> bool:
        """Determine if review should be down-weighted in teacher metrics"""
        # Credibility below 40 = potentially unfair review
        return credibility_score < 40
    
    async def calculate_teacher_rating(
        self,
        reviews: list,
        weights_only_credible: bool = True
    ) -> tuple[float, int]:
        """
        Calculate fair teacher rating based on credible reviews
        
        Returns:
            (weighted_rating, number_of_credible_reviews)
        """
        if weights_only_credible:
            credible_reviews = [r for r in reviews if r.get("credibility_score", 0) >= 40]
        else:
            credible_reviews = reviews
        
        if not credible_reviews:
            return 0.0, 0
        
        weighted_sum = 0.0
        weight_total = 0.0
        
        for review in credible_reviews:
            # Weight each review by its credibility score
            credibility = review.get("credibility_score", 50) / 100
            rating = review.get("rating", 0)
            weighted_sum += rating * credibility
            weight_total += credibility
        
        avg_rating = weighted_sum / weight_total if weight_total > 0 else 0.0
        return avg_rating, len(credible_reviews)
