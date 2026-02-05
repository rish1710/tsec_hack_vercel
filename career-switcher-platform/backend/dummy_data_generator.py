"""
Generate realistic dummy session data for testing teacher analytics
"""
import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any


def generate_dummy_sessions(video_id: str, num_sessions: int = 50) -> List[Dict[str, Any]]:
    """
    Generate dummy video session data for analytics
    Simulates realistic viewing patterns with drop-offs
    """
    sessions = []
    video_duration = 180  # 3 minutes in seconds
    rate_per_minute = 0.50  # $0.50 per minute

    # Sample review texts
    positive_reviews = [
        "Excellent course! Very clear explanations and practical examples.",
        "This helped me transition into my new role smoothly. Highly recommend!",
        "Great content, well-structured. The instructor knows their stuff.",
        "Best course I've taken on this topic. Worth every penny!",
        "Clear, concise, and actionable. Exactly what I needed.",
    ]

    neutral_reviews = [
        "Good course overall. Some parts could be more detailed.",
        "Decent content. Got what I expected from the description.",
        "The course was okay. Not bad, but not exceptional either.",
    ]

    negative_reviews = [
        "Too basic for someone with some background. Expected more depth.",
        "Audio quality could be better. Hard to hear at times.",
        "The pace was too fast for beginners. Needed more examples.",
        "Content was good but the video kept buffering.",
    ]

    for i in range(num_sessions):
        session_id = f"video_session_{uuid.uuid4().hex[:12]}"
        student_id = f"student_{uuid.uuid4().hex[:8]}"

        # Simulate realistic viewing patterns:
        # 20% early drop-off (watch < 30%)
        # 30% mid drop-off (watch 30-60%)
        # 30% late drop-off (watch 60-90%)
        # 20% full watch (watch > 90%)

        rand = random.random()
        if rand < 0.2:
            # Early drop-off
            watch_time = random.randint(10, int(video_duration * 0.3))
            rating = random.choice([1, 2, 3])
            review_text = random.choice(negative_reviews) if random.random() > 0.5 else ""
        elif rand < 0.5:
            # Mid drop-off
            watch_time = random.randint(int(video_duration * 0.3), int(video_duration * 0.6))
            rating = random.choice([2, 3, 4])
            review_text = random.choice(neutral_reviews) if random.random() > 0.6 else ""
        elif rand < 0.8:
            # Late drop-off
            watch_time = random.randint(int(video_duration * 0.6), int(video_duration * 0.9))
            rating = random.choice([3, 4, 5])
            review_text = random.choice(neutral_reviews + positive_reviews) if random.random() > 0.5 else ""
        else:
            # Full watch
            watch_time = random.randint(int(video_duration * 0.9), video_duration)
            rating = random.choice([4, 5])
            review_text = random.choice(positive_reviews) if random.random() > 0.4 else ""

        # Calculate cost
        elapsed_minutes = watch_time / 60
        amount_charged = round(elapsed_minutes * rate_per_minute, 2)
        locked_amount = 30.00  # Standard lock amount
        amount_refunded = round(locked_amount - amount_charged, 2)

        # Generate quiz scores (70% of students take quiz)
        quiz_scores = []
        if random.random() > 0.3 and watch_time > 30:
            num_quizzes = random.randint(1, 3)
            for q in range(num_quizzes):
                quiz_scores.append({
                    "quiz_number": q + 1,
                    "score": random.randint(3, 10),
                    "total_questions": 10,
                    "timestamp": (datetime.utcnow() - timedelta(days=random.randint(1, 30))).isoformat(),
                    "video_time": random.randint(30, max(31, watch_time))
                })

        # Create session object
        session = {
            "session_id": session_id,
            "video_id": video_id,
            "intent_id": f"intent_{uuid.uuid4().hex[:12]}",
            "locked_amount": locked_amount,
            "rate_per_minute": rate_per_minute,
            "start_time": (datetime.utcnow() - timedelta(days=random.randint(1, 60))).timestamp(),
            "end_time": (datetime.utcnow() - timedelta(days=random.randint(1, 60))).timestamp(),
            "elapsed_seconds": watch_time,
            "watch_time_seconds": watch_time,
            "amount_charged": amount_charged,
            "amount_refunded": amount_refunded,
            "status": "completed",
            "student_address": f"0x{uuid.uuid4().hex[:20]}",
            "student_id": student_id,
            "created_at": (datetime.utcnow() - timedelta(days=random.randint(1, 60))).isoformat(),
            "quiz_scores": quiz_scores,
            "free_preview_completed": True
        }

        # Add feedback (80% of students leave feedback)
        if random.random() > 0.2:
            session["feedback"] = {
                "stars": rating,
                "review": review_text,
                "submitted_at": (datetime.utcnow() - timedelta(days=random.randint(1, 60))).isoformat()
            }

        sessions.append(session)

    return sessions


def generate_revenue_timeline(video_duration_seconds: int = 180, num_points: int = 30) -> List[Dict[str, Any]]:
    """
    Generate revenue timeline data for the video timeline chart
    Shows how revenue accumulates over the video duration with realistic fluctuations
    First 10 seconds are FREE (no revenue)
    """
    timeline = []
    interval = video_duration_seconds // num_points

    initial_viewers = 100
    cumulative_revenue = 0
    rate_per_second = 0.50 / 60  # $0.50 per minute

    # Track engagement peaks and valleys
    # Some parts of video are more engaging (quizzes, important concepts)
    engagement_multipliers = {}
    for i in range(num_points + 1):
        timestamp = i * interval
        # Add random engagement spikes and drops
        if 20 <= timestamp <= 40:  # Early content spike
            engagement_multipliers[i] = random.uniform(1.1, 1.3)
        elif 50 <= timestamp <= 60:  # Quiz time - slight drop
            engagement_multipliers[i] = random.uniform(0.7, 0.85)
        elif 90 <= timestamp <= 110:  # Mid-content spike
            engagement_multipliers[i] = random.uniform(1.15, 1.35)
        elif 120 <= timestamp <= 135:  # Challenging section - drop
            engagement_multipliers[i] = random.uniform(0.6, 0.8)
        elif 150 <= timestamp <= 170:  # Final insights - spike
            engagement_multipliers[i] = random.uniform(1.2, 1.4)
        else:
            engagement_multipliers[i] = random.uniform(0.9, 1.1)

    for i in range(num_points + 1):
        timestamp = i * interval

        # First 10 seconds are FREE - NO REVENUE
        if timestamp < 10:
            retention = 1.0  # Everyone watching during free preview
            cumulative_revenue = 0  # No revenue yet
            active_viewers = initial_viewers
        else:
            # After 10s, retention drops with fluctuations
            progress = (timestamp - 10) / (video_duration_seconds - 10)

            # Base retention with sharper drops at certain points
            if progress < 0.2:  # 10-46s: Initial paid content
                base_retention = 0.95 - (progress * 0.25)
            elif progress < 0.4:  # 46-82s: Early drop-off
                base_retention = 0.70 - ((progress - 0.2) * 0.20)
            elif progress < 0.6:  # 82-118s: Mid-video stabilization
                base_retention = 0.50 - ((progress - 0.4) * 0.15)
            elif progress < 0.8:  # 118-154s: Late drop-off
                base_retention = 0.35 - ((progress - 0.6) * 0.15)
            else:  # 154-180s: Final viewers
                base_retention = 0.20 - ((progress - 0.8) * 0.05)

            # Apply engagement multiplier for fluctuations
            retention = base_retention * engagement_multipliers[i]
            retention = max(min(retention, 1.0), 0.15)  # Between 15% and 100%

            # Calculate revenue for this segment
            active_viewers = initial_viewers * retention
            segment_revenue = active_viewers * rate_per_second * interval
            cumulative_revenue += segment_revenue

        timeline.append({
            "timestamp": timestamp,
            "retention_rate": round(retention, 3),
            "cumulative_revenue": round(cumulative_revenue, 2),
            "active_viewers": int(initial_viewers * retention)
        })

    return timeline
