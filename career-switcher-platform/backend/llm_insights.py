"""
LLM-powered insights generation for teachers and students
"""
import os
from typing import List, Dict, Any
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Groq client
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def generate_teacher_insights(positive_reviews: List[str], negative_reviews: List[str]) -> Dict[str, List[str]]:
    """
    Generate AI insights for teachers based on student reviews
    Returns strengths (from positive reviews) and improvements (from negative reviews)
    """
    # Prepare prompt for AI
    prompt = f"""You are analyzing student feedback for an online course. Based on the reviews below, identify:
1. **Strengths**: What students love about the course (from 4-5 star reviews)
2. **Improvements**: What needs work (from 1-3 star reviews)

POSITIVE REVIEWS (4-5 stars):
{chr(10).join(f"- {review}" for review in positive_reviews[:10])}

NEGATIVE REVIEWS (1-3 stars):
{chr(10).join(f"- {review}" for review in negative_reviews[:10])}

Respond in JSON format:
{{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}}

Keep each point concise (1-2 sentences). Focus on actionable insights."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1000
        )

        # Parse JSON response
        import json
        result_text = response.choices[0].message.content.strip()

        # Extract JSON from markdown code blocks if present
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()

        insights = json.loads(result_text)

        return {
            "strengths": insights.get("strengths", [])[:5],
            "improvements": insights.get("improvements", [])[:5]
        }

    except Exception as e:
        print(f"Error generating insights: {e}")
        # Return default insights if AI fails
        return {
            "strengths": [
                "Clear explanations and practical examples",
                "Well-structured content that's easy to follow",
                "Relevant to real-world career transitions"
            ],
            "improvements": [
                "Could include more detailed examples",
                "Audio/video quality could be enhanced",
                "Pace might be adjusted for different skill levels"
            ]
        }


def generate_student_reflection(
    watch_time_minutes: float,
    quiz_scores: List[Dict[str, Any]],
    completion_percentage: float
) -> Dict[str, List[str]]:
    """
    Generate personalized AI reflection for students after course completion
    Returns dict with 'positives' and 'suggestions' arrays
    """
    # Calculate quiz performance
    quiz_summary = ""
    if quiz_scores:
        total_correct = sum(q["score"] for q in quiz_scores)
        total_questions = sum(q["total_questions"] for q in quiz_scores)
        quiz_percentage = round((total_correct / total_questions) * 100, 1) if total_questions > 0 else 0
        quiz_summary = f"You completed {len(quiz_scores)} quizzes with a {quiz_percentage}% average score."
    else:
        quiz_summary = "You didn't complete any quizzes."

    prompt = f"""You are a career coach providing personalized feedback to a student who just completed an online course.

STUDENT STATS:
- Watch time: {watch_time_minutes:.1f} minutes
- Completion: {completion_percentage:.0f}%
- {quiz_summary}

Provide feedback in JSON format with these keys:
- "positives": array of 2-3 specific things they did well (be encouraging)
- "suggestions": array of 2-3 actionable next steps for their career journey

Example format:
{{
  "positives": ["Great engagement with the course material", "Strong quiz performance"],
  "suggestions": ["Apply these concepts in a real project", "Connect with others in this field"]
}}

Be specific, encouraging, and actionable."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300
        )

        reflection_text = response.choices[0].message.content.strip()

        # Parse JSON response
        import json
        # Remove markdown code blocks if present
        if reflection_text.startswith("```"):
            reflection_text = reflection_text.split("```")[1]
            if reflection_text.startswith("json"):
                reflection_text = reflection_text[4:]

        reflection = json.loads(reflection_text)
        return reflection

    except Exception as e:
        print(f"Error generating reflection: {e}")
        # Return default structured reflection if AI fails
        return {
            "positives": [
                f"You completed {completion_percentage:.0f}% of the course content",
                f"You invested {watch_time_minutes:.1f} minutes in your professional development",
                "You took action towards your career goals"
            ],
            "suggestions": [
                "Apply one concept from this course in your current work this week",
                "Share what you learned with a colleague or friend",
                "Identify the next skill to build on your learning journey"
            ]
        }
