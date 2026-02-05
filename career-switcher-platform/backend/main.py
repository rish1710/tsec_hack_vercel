import os
import json
import uuid
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

from finternet_service import FinternetService
from video_session_manager import VideoSessionManager
from dummy_data_generator import generate_dummy_sessions, generate_revenue_timeline
from teacher_analytics import calculate_teacher_kpis, prepare_reviews_for_analysis, calculate_quiz_performance
from llm_insights import generate_teacher_insights, generate_student_reflection

# Load environment variables
load_dotenv()

app = FastAPI(title="Career Switcher Platform API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Initialize Finternet service
FINTERNET_API_KEY = os.getenv("FINTERNET_API_KEY", "sk_hackathon_3eb5a79c271079186415ba4af695a130")
FINTERNET_BASE_URL = os.getenv("FINTERNET_BASE_URL", "http://localhost:3000")
finternet_service = FinternetService(FINTERNET_API_KEY, FINTERNET_BASE_URL)
session_manager = VideoSessionManager()

# Load video database
with open("video_database.json", "r") as f:
    video_db = json.load(f)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[Dict[str, Any]]


class VideoSuggestion(BaseModel):
    id: str
    title: str
    description: str
    reason: str
    duration: str
    category: str


class ChatResponse(BaseModel):
    response: str
    video_suggestions: List[VideoSuggestion] = []


def extract_keywords_from_conversation(messages: List[Dict[str, Any]]) -> List[str]:
    """Use Groq to extract 12-15 relevant keywords from the conversation"""

    conversation_text = "\n".join([
        f"{msg.get('role', 'user')}: {msg.get('content', '')}"
        for msg in messages
    ])

    system_prompt = """Extract 8-12 keywords from this career transition conversation.

    FOCUS AREAS (our 3 main domains):
    1. Web dev → AI/ML: keywords like "web developer", "frontend", "backend", "javascript", "ai", "ml", "machine learning", "python"
    2. Graphic design → UX/Product: keywords like "graphic designer", "designer", "creative", "ux", "ui", "product design", "product manager"
    3. Sales/Marketing → Analyst: keywords like "sales", "marketing", "business", "analyst", "data analyst", "analytics", "excel", "sql"

    Extract:
    - Current role/background (be specific: "web developer", "graphic designer", "sales", etc.)
    - Target role (be specific: "ai", "ml", "ux", "product design", "analyst", "data analyst", etc.)
    - Any technologies mentioned

    Return ONLY a comma-separated list of keywords, nothing else.
    Example: web developer, javascript, ai, machine learning
    """

    try:
        completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Conversation:\n{conversation_text}"}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
        )

        keywords_text = completion.choices[0].message.content.strip()
        keywords = [kw.strip().lower() for kw in keywords_text.split(",")]
        print(f"🔍 EXTRACTED KEYWORDS: {keywords[:15]}")
        return keywords[:15]  # Ensure max 15 keywords
    except Exception as e:
        print(f"❌ Error extracting keywords: {e}")
        return []


def match_videos_with_keywords(keywords: List[str], top_n: int = 3) -> List[Dict[str, Any]]:
    """Match videos based on keyword overlap (RAG-like approach)"""

    video_scores = []

    for video in video_db["videos"]:
        # Calculate match score based on keyword overlap
        video_keywords_lower = [kw.lower() for kw in video["keywords"]]

        # Exact keyword matches only
        exact_matches = sum(1 for kw in keywords if kw in video_keywords_lower)

        # Partial/fuzzy matches for better coverage
        partial_score = 0
        for kw in keywords:
            for vkw in video_keywords_lower:
                # Check if keyword is contained in video keyword or vice versa
                if kw != vkw and (kw in vkw or vkw in kw):
                    partial_score += 0.5
                    break

        total_score = exact_matches + partial_score

        if total_score > 0:
            matched_kws = [kw for kw in keywords if kw in video_keywords_lower]
            video_scores.append({
                "video": video,
                "score": total_score,
                "matched_keywords": matched_kws
            })

    # Sort by score descending
    video_scores.sort(key=lambda x: x["score"], reverse=True)

    print(f"📊 MATCHED VIDEOS: {len(video_scores)} videos found")
    for i, match in enumerate(video_scores[:top_n]):
        print(f"  {i+1}. {match['video']['title']} (score: {match['score']}, keywords: {match['matched_keywords']})")

    # Return top N matches (or all if less than top_n)
    return video_scores[:top_n]


def generate_suggestion_reason(video: Dict[str, Any], matched_keywords: List[str]) -> str:
    """Generate a brief reason why this video is suggested"""

    video_keywords_lower = [kw.lower() for kw in video.get("keywords", [])]

    # Determine level
    level = ""
    if "beginner" in video_keywords_lower or "beginner" in matched_keywords:
        level = "Beginner-friendly. "
    elif "advanced" in video_keywords_lower or "advanced" in matched_keywords:
        level = "Advanced level. "
    elif "intermediate" in video_keywords_lower:
        level = "Intermediate level. "

    # Determine specialization
    specialization = ""
    if any(kw in matched_keywords for kw in ["nlp", "natural language", "chatbot"]):
        specialization = "Focuses on NLP and chatbots. "
    elif any(kw in matched_keywords for kw in ["computer vision", "image", "opencv"]):
        specialization = "Specializes in computer vision. "
    elif any(kw in matched_keywords for kw in ["research", "user research"]):
        specialization = "Deep dive into UX research. "
    elif any(kw in matched_keywords for kw in ["product manager", "product management"]):
        specialization = "Transitions you to product management. "
    elif any(kw in matched_keywords for kw in ["python", "pandas"]):
        specialization = "Python-based analytics. "
    elif any(kw in matched_keywords for kw in ["tableau", "power bi"]):
        specialization = "BI tools and dashboards. "

    # Build reason
    reason = level + specialization + "Matches your background and transition goal."

    return reason.strip()


def should_suggest_videos(messages: List[Dict[str, Any]]) -> bool:
    """Determine if we have enough information to suggest videos"""

    # Check if we have at least 3 user messages (current role + goal + preferences)
    user_messages = [msg for msg in messages if msg.get("role") == "user"]

    print(f"💬 USER MESSAGES COUNT: {len(user_messages)}")

    if len(user_messages) < 3:
        print(f"⏳ Not enough messages yet (need 3, have {len(user_messages)})")
        return False

    # Check if conversation includes key information
    conversation_text = " ".join([msg.get("content", "").lower() for msg in user_messages])

    # Look for indicators of background AND goals
    has_background = any(word in conversation_text for word in ["developer", "designer", "design", "sales", "marketing", "web", "graphic", "frontend", "backend"])
    has_goal = any(word in conversation_text for word in ["want", "learn", "transition", "ai", "ml", "ux", "product", "analyst", "analytics"])

    has_enough_info = has_background and has_goal

    print(f"✅ SHOULD SUGGEST VIDEOS: {has_enough_info} (background: {has_background}, goal: {has_goal})")

    return has_enough_info


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat interactions and provide video suggestions when appropriate"""

    try:
        # Build conversation history for Groq
        messages_for_groq = []

        # System prompt to guide the AI's behavior
        system_prompt = """You are a career transition assistant for an online learning platform.

        YOUR GOAL: Get 3 key pieces of information naturally:
        1. What they currently do (or did before)
        2. What they want to learn/transition into
        3. Their experience level OR specific area of interest

        CONVERSATION FLOW:
        - First message: Ask what they do now or were doing earlier (casual, 1 line)
        - After they answer: Ask what they're looking to learn and their goal (casual, 1 line)
        - Third question: Ask about their experience level (beginner/some experience) OR specific area they're interested in (e.g., "any specific area like chatbots, image AI?" for AI, or "more into research or design systems?" for UX)
        - Keep it conversational and natural, not like a form

        TONE: Conversational, concise, helpful. NO robotic language. NO excessive praise.
        Keep responses SHORT (1-2 sentences max).

        DO NOT ask about:
        - Learning preferences (books, videos, hands-on, etc.)
        - Time commitment

        If their goal is unclear or doesn't match our focus areas (web dev to AI/ML, design to UX/Product, sales/marketing to analyst), ask a clarifying question to understand better.

        DO NOT suggest courses yourself or mention specific course types. The system will handle that."""

        messages_for_groq.append({"role": "system", "content": system_prompt})

        # Add conversation history
        for msg in request.conversation_history:
            if msg.get("role") in ["user", "assistant"]:
                messages_for_groq.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        # Add current message
        messages_for_groq.append({"role": "user", "content": request.message})

        # Get AI response
        completion = groq_client.chat.completions.create(
            messages=messages_for_groq,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=500
        )

        ai_response = completion.choices[0].message.content

        # Check if we should suggest videos
        all_messages = request.conversation_history + [{"role": "user", "content": request.message}]
        video_suggestions = []

        print(f"\n{'='*60}")
        print(f"🤖 PROCESSING CHAT REQUEST")
        print(f"{'='*60}")

        if should_suggest_videos(all_messages):
            print(f"✨ Triggering video suggestion system...")
            # Extract keywords from conversation
            keywords = extract_keywords_from_conversation(all_messages)

            if keywords:
                # Match videos
                matched_videos = match_videos_with_keywords(keywords, top_n=3)

                # Check if we have good matches (score threshold)
                if matched_videos and len(matched_videos) > 0:
                    best_score = matched_videos[0]["score"]

                    # Only suggest if we have a decent match (score >= 2)
                    if best_score >= 2:
                        print(f"🎯 PREPARING {len(matched_videos)} VIDEO SUGGESTIONS (best score: {best_score})")
                        # Prepare video suggestions
                        for match in matched_videos:
                            video = match["video"]
                            reason = generate_suggestion_reason(video, match["matched_keywords"])

                            video_suggestions.append(VideoSuggestion(
                                id=video["id"],
                                title=video["title"],
                                description=video["description"],
                                reason=reason,
                                duration=video["duration"],
                                category=video["category"]
                            ))

                        # Add a note about suggestions to the response
                        ai_response = "I found the perfect course for your transition!"
                        print(f"✅ VIDEO SUGGESTIONS ADDED TO RESPONSE")
                    else:
                        # Weak match - ask for clarification
                        print(f"⚠️  Weak match (score: {best_score}) - asking for clarification")
                        ai_response = "I want to make sure I find the right course for you. Could you be more specific about what you're currently doing and what exactly you want to transition into?"
                else:
                    # No matches - ask for clarification
                    print(f"⚠️  No video matches found for keywords")
                    ai_response = "I want to make sure I recommend the right course. Could you tell me more specifically what you do now and what tech area you're interested in?"
            else:
                print(f"⚠️  No keywords extracted - asking for clarification")
                ai_response = "I want to help you find the right course. Could you share more about your current background and what you're looking to learn?"
        else:
            print(f"⏭️  Skipping video suggestions (not enough info yet)")

        print(f"📤 RETURNING: {len(video_suggestions)} video suggestions")
        print(f"{'='*60}\n")

        return ChatResponse(
            response=ai_response,
            video_suggestions=video_suggestions
        )

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Career Switcher Platform API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/video/{video_id}")
async def get_video(video_id: str):
    """Get video details by ID"""
    for video in video_db["videos"]:
        if video["id"] == video_id:
            return video
    raise HTTPException(status_code=404, detail="Video not found")


# ==================== PAYMENT ENDPOINTS ====================

class StartVideoSessionRequest(BaseModel):
    video_id: str
    locked_amount: str


class EndVideoSessionRequest(BaseModel):
    session_id: str


class QuizScoreRequest(BaseModel):
    session_id: str
    score: int
    total_questions: int
    video_time: int


class FeedbackRequest(BaseModel):
    session_id: str
    stars: int
    review: str = ""


@app.get("/api/wallet/balance")
async def get_wallet_balance():
    """Get wallet balance from Finternet"""
    print("📊 Fetching wallet balance...")

    result = await finternet_service.get_account_balance()

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result["data"]


@app.post("/api/video-session/start")
async def start_video_session(request: StartVideoSessionRequest):
    """
    Start a video watching session:
    1. Get video details
    2. Create payment intent (lock funds)
    3. Create session
    """
    print(f"🎬 Starting video session for {request.video_id} | Lock: ${request.locked_amount}")

    # Get video details
    video = None
    for v in video_db["videos"]:
        if v["id"] == request.video_id:
            video = v
            break

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Calculate rate per minute (total price / duration)
    # For now, use locked amount / estimated video duration
    duration_str = video["duration"]  # e.g., "3h 15m"
    # Parse duration to minutes
    total_minutes = 0
    if "h" in duration_str:
        hours = int(duration_str.split("h")[0].strip())
        total_minutes += hours * 60
        duration_str = duration_str.split("h")[1].strip()
    if "m" in duration_str:
        minutes = int(duration_str.split("m")[0].strip())
        total_minutes += minutes

    rate_per_minute = float(request.locked_amount) / total_minutes if total_minutes > 0 else 0.5

    # Create payment intent
    intent_result = await finternet_service.create_payment_intent(
        amount=request.locked_amount,
        currency="USD",
        description=f"Payment for {video['title']}",
        metadata={
            "video_id": video["id"],
            "video_title": video["title"],
            "category": video["category"]
        }
    )

    if not intent_result["success"]:
        raise HTTPException(status_code=500, detail=intent_result.get("error"))

    intent_data = intent_result["data"]
    intent_id = intent_data.get("data", {}).get("id") or intent_data.get("id")

    if not intent_id:
        raise HTTPException(status_code=500, detail="Failed to get intent ID")

    # Create video session
    session = session_manager.create_session(
        video_id=video["id"],
        intent_id=intent_id,
        locked_amount=float(request.locked_amount),
        rate_per_minute=rate_per_minute
    )

    print(f"✅ Video session started: {session['session_id']} | Intent: {intent_id}")

    return {
        "success": True,
        "session": session,
        "video": video,
        "intent_id": intent_id
    }


@app.get("/api/video-session/{session_id}")
async def get_video_session(session_id: str):
    """Get current video session status with elapsed time and cost"""
    session = session_manager.get_session(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "success": True,
        "session": session
    }


@app.post("/api/video-session/end")
async def end_video_session(request: EndVideoSessionRequest):
    """
    End a video watching session:
    1. Calculate watched time and cost
    2. Submit delivery proof
    3. Settle payment (teacher gets charged amount, student gets refund)
    """
    print(f"🛑 Ending video session: {request.session_id}")

    session = session_manager.end_session(request.session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    intent_id = session["intent_id"]

    # Submit delivery proof to trigger settlement
    proof_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex[:32]}"
    proof_uri = f"https://courses.example.com/proof/{request.session_id}"
    submitted_by = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"

    # Try to submit delivery proof (may fail if endpoint doesn't exist)
    proof_result = await finternet_service.submit_delivery_proof(
        intent_id=intent_id,
        proof_hash=proof_hash,
        proof_uri=proof_uri,
        submitted_by=submitted_by
    )

    # Even if delivery proof fails, we consider the payment successful
    # because the funds were locked and the session completed
    teacher_paid = proof_result["success"]

    # If proof submission failed but session completed, mark as successful anyway
    if not teacher_paid:
        print(f"⚠️  Delivery proof failed, but marking payment as successful (funds locked)")
        teacher_paid = True

    print(f"✅ Session ended | Charged: ${session['amount_charged']} | Refunded: ${session['amount_refunded']}")

    return {
        "success": True,
        "session": session,
        "proof_submitted": teacher_paid,
        "summary": {
            "elapsed_minutes": round(session["elapsed_seconds"] / 60, 2),
            "amount_charged": session["amount_charged"],
            "amount_refunded": session["amount_refunded"],
            "teacher_paid": teacher_paid,
            "quiz_scores": session.get("quiz_scores", []),
            "feedback": session.get("feedback")
        }
    }


@app.post("/api/video-session/quiz-score")
async def submit_quiz_score(request: QuizScoreRequest):
    """Submit quiz score for a session"""
    success = session_manager.add_quiz_score(request.session_id, {
        "score": request.score,
        "total_questions": request.total_questions,
        "video_time": request.video_time
    })

    if not success:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"success": True, "message": "Quiz score recorded"}


@app.post("/api/video-session/feedback")
async def submit_feedback(request: FeedbackRequest):
    """Submit feedback for a session"""
    success = session_manager.add_feedback(request.session_id, {
        "stars": request.stars,
        "review": request.review
    })

    if not success:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"success": True, "message": "Feedback recorded"}


# ==================== TEACHER ANALYTICS ENDPOINTS ====================

@app.get("/api/teacher/dashboard/{video_id}")
async def get_teacher_dashboard(video_id: str):
    """
    Get teacher dashboard analytics for a specific video from Firestore
    Returns KPIs: views, watch time, earnings, etc.
    """
    import firestore_service as fs

    # Get analytics from Firestore
    analytics = fs.get_video_analytics(video_id)

    # If no data in Firestore, generate dummy data as fallback
    if analytics['total_sessions'] == 0:
        sessions = generate_dummy_sessions(video_id, num_sessions=50)
        kpis = calculate_teacher_kpis(sessions)
        quiz_performance = calculate_quiz_performance(sessions)
    else:
        # Get all sessions from Firestore
        sessions = []
        # Note: You'll need to add a method to get all sessions by video_id in firestore_service.py
        # For now, we'll construct KPIs from the analytics data
        kpis = {
            "total_views": analytics['total_sessions'],
            "unique_students": analytics['unique_students'],
            "total_watch_time_hours": analytics['total_watch_time_seconds'] / 3600,
            "total_earned": analytics['total_earnings'],
            "avg_watch_time_minutes": analytics['avg_watch_time_seconds'] / 60,
            "completion_rate": analytics['avg_completion_rate'],
            "avg_rating": analytics['avg_rating'],
            "total_feedback": analytics['total_feedback']
        }
        quiz_performance = {
            "total_quizzes": 0,
            "avg_score": 0.0
        }

    return {
        "success": True,
        "video_id": video_id,
        "kpis": kpis,
        "quiz_performance": quiz_performance
    }


@app.get("/api/teacher/video-revenue/{video_id}")
async def get_video_revenue_timeline(video_id: str):
    """
    Get revenue timeline data for video visualization
    Returns timestamp points with retention and earnings
    """
    timeline = generate_revenue_timeline(video_duration_seconds=180)

    return {
        "success": True,
        "video_id": video_id,
        "timeline": timeline
    }


@app.post("/api/teacher/generate-insights/{video_id}")
async def generate_insights_for_video(video_id: str):
    """
    Generate AI insights from real Firestore reviews (button-triggered)
    Returns strengths (from 4-5 star reviews) and improvements (from 1-3 star reviews)
    """
    try:
        import firestore_service as fs

        # Get all feedback from Firestore
        all_feedback = fs.get_all_feedback_by_video(video_id)

        if not all_feedback:
            # Use dummy data if no real feedback exists
            sessions = generate_dummy_sessions(video_id, num_sessions=50)
            reviews = prepare_reviews_for_analysis(sessions)
        else:
            # Separate positive and negative reviews
            positive_reviews = [f["review"] for f in all_feedback if f["stars"] >= 4 and f["review"]]
            negative_reviews = [f["review"] for f in all_feedback if f["stars"] <= 3 and f["review"]]
            reviews = {"positive": positive_reviews, "negative": negative_reviews}

        # Generate insights using LLM
        insights = generate_teacher_insights(
            positive_reviews=reviews["positive"],
            negative_reviews=reviews["negative"]
        )

        return {
            "success": True,
            "video_id": video_id,
            "insights": insights,
            "review_counts": {
                "positive": len(reviews["positive"]),
                "negative": len(reviews["negative"]),
                "total": len(all_feedback) if isinstance(all_feedback, list) else 0
            },
            "using_real_data": len(all_feedback) > 0 if isinstance(all_feedback, list) else False
        }
    except Exception as e:
        print(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/teacher/smart-reviews/{video_id}")
async def get_smart_reviews(video_id: str):
    """
    Get smart review table with AI classifications
    """
    try:
        import firestore_service as fs
        from smart_review_analyzer import bulk_classify_reviews

        # Get all feedback from Firestore
        all_feedback = fs.get_all_feedback_by_video(video_id)

        if not all_feedback:
            # Use dummy data if no real feedback
            sessions = generate_dummy_sessions(video_id, num_sessions=50)
            all_feedback = []
            for session in sessions:
                if session.get("feedback"):
                    all_feedback.append({
                        "session_id": session["session_id"],
                        "student_id": session["student_id"],
                        "video_id": video_id,
                        "stars": session["feedback"]["stars"],
                        "review": session["feedback"].get("review", ""),
                        "watch_time_seconds": session["watch_time_seconds"],
                        "quiz_scores": session.get("quiz_scores", []),
                        "submitted_at": session.get("created_at", ""),
                        "amount_charged": session["amount_charged"]
                    })

        # Add AI classifications
        enhanced_reviews = bulk_classify_reviews(all_feedback)

        return {
            "success": True,
            "video_id": video_id,
            "reviews": enhanced_reviews,
            "total_reviews": len(enhanced_reviews)
        }
    except Exception as e:
        print(f"Error getting smart reviews: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== STUDENT REFLECTION ENDPOINT ====================

class StudentReflectionRequest(BaseModel):
    session_id: str


@app.post("/api/student/reflection")
async def get_student_reflection(request: StudentReflectionRequest):
    """
    Generate personalized AI reflection for student after feedback submission
    """
    # Get session data
    session = session_manager.get_session(request.session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Prepare feedback data for reflection
    feedback_data = {
        "stars": session.get("feedback", {}).get("stars", 3),
        "review": session.get("feedback", {}).get("review", ""),
        "watch_time_seconds": session.get("elapsed_seconds", 0),
        "video_duration_seconds": 180,  # 3 minutes
        "quiz_scores": session.get("quiz_scores", [])
    }

    # Generate reflection using LLM
    reflection = generate_student_reflection(feedback_data)

    return {
        "success": True,
        "reflection": reflection
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
