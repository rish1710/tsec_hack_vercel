"""
Smart Review Analyzer - AI-powered classification of student reviews
Determines if feedback is about user-side or course-side issues
"""
import os
from typing import Dict, Any, List
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Groq client
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def classify_review(review_data: Dict[str, Any]) -> Dict[str, str]:
    """
    Classify a review and generate one-liner summary
    Returns: {"classification": "user_side" or "course_side", "one_liner": str}
    """
    stars = review_data.get("stars", 3)
    review_text = review_data.get("review", "No written review")
    watch_time = review_data.get("watch_time_seconds", 0)

    # If no review text, classify based on stars and watch time
    if not review_text or review_text == "No written review":
        if stars >= 4 and watch_time > 120:
            return {
                "classification": "user_side",
                "one_liner": "Engaged learner with positive experience"
            }
        elif stars <= 2:
            return {
                "classification": "user_side",
                "one_liner": "Low engagement, possibly wrong fit"
            }
        else:
            return {
                "classification": "user_side",
                "one_liner": "Average engagement level"
            }

    prompt = f"""Analyze this course review and classify it:

REVIEW: "{review_text}"
RATING: {stars}/5 stars
WATCH TIME: {watch_time} seconds

Classify as:
- "user_side": Issue is about student's fit, expectations, or personal situation (wrong level, pace too fast/slow for them, not what they expected, personal time constraints)
- "course_side": Issue is about actual course quality (content errors, poor audio/video, missing topics, instructor mistakes)

Also provide a 5-8 word summary of the feedback.

Respond in format:
{{
  "classification": "user_side" or "course_side",
  "one_liner": "Brief summary here"
}}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=150
        )

        import json
        result_text = response.choices[0].message.content.strip()

        # Extract JSON from markdown code blocks if present
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()

        result = json.loads(result_text)

        return {
            "classification": result.get("classification", "user_side"),
            "one_liner": result.get("one_liner", "Student feedback")
        }

    except Exception as e:
        print(f"Error classifying review: {e}")
        # Default classification
        if stars >= 4:
            return {
                "classification": "user_side",
                "one_liner": "Positive student experience"
            }
        else:
            return {
                "classification": "course_side",
                "one_liner": "Needs improvement"
            }


def bulk_classify_reviews(reviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Classify multiple reviews efficiently
    Returns reviews with added classification and one_liner fields
    """
    classified_reviews = []

    for review in reviews:
        classification = classify_review(review)
        review_with_classification = {
            **review,
            "ai_classification": classification["classification"],
            "ai_one_liner": classification["one_liner"]
        }
        classified_reviews.append(review_with_classification)

    return classified_reviews
