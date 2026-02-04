"""
FastAPI Backend for Finternet Payment Integration MVP
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import logging
import uuid
from datetime import datetime
from dotenv import load_dotenv

from finternet_service import FinternetService
from session_manager import SessionManager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="Finternet Teaching Session MVP", version="1.0.0")

# CORS configuration - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
FINTERNET_API_KEY = os.getenv("FINTERNET_API_KEY", "sk_hackathon_3eb5a79c271079186415ba4af695a130")
FINTERNET_BASE_URL = os.getenv("FINTERNET_BASE_URL", "http://localhost:3000")

finternet_service = FinternetService(FINTERNET_API_KEY, FINTERNET_BASE_URL)
session_manager = SessionManager()

logger.info(f"🚀 Backend initialized with Finternet API: {FINTERNET_BASE_URL}")

# ==================== Pydantic Models ====================

class StartSessionRequest(BaseModel):
    amount: str
    rate_per_minute: float
    session_title: str = "Live Guitar Basics"

class EndSessionRequest(BaseModel):
    session_id: str

class DeliveryProofRequest(BaseModel):
    intent_id: str
    proof_hash: str
    proof_uri: str
    submitted_by: str

class MilestoneRequest(BaseModel):
    intent_id: str
    milestone_index: int
    description: str
    amount: str

# ==================== API Endpoints ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "Finternet Teaching Session MVP",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/wallet/balance")
async def get_wallet_balance():
    """
    Get merchant wallet balance via Finternet API
    Endpoint: GET /api/v1/payment-intents/account/balance
    """
    logger.info("📊 [API] GET /api/wallet/balance - Fetching wallet balance")

    result = await finternet_service.get_account_balance()

    if not result["success"]:
        logger.error(f"Failed to get balance: {result.get('error')}")
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result["data"]

@app.post("/api/session/start")
async def start_session(request: StartSessionRequest):
    """
    Start a teaching session:
    1. Create Payment Intent (lock funds via Finternet)
    2. Create session in memory
    3. Return session ID and intent ID
    """
    logger.info(f"🎬 [API] POST /api/session/start - Amount: ${request.amount}, Rate: ${request.rate_per_minute}/min")

    # Step 1: Create Payment Intent via Finternet API
    intent_result = await finternet_service.create_payment_intent(
        amount=request.amount,
        currency="USD",
        intent_type="DELIVERY_VS_PAYMENT",
        settlement_method="OFF_RAMP_MOCK",
        settlement_destination="teacher_bank_account",
        description=f"Payment for {request.session_title}",
        metadata={
            "sessionTitle": request.session_title,
            "ratePerMinute": request.rate_per_minute
        }
    )

    if not intent_result["success"]:
        logger.error(f"Failed to create payment intent: {intent_result.get('error')}")
        raise HTTPException(status_code=500, detail=intent_result.get("error"))

    intent_data = intent_result["data"]
    intent_id = intent_data.get("data", {}).get("id") or intent_data.get("id")

    if not intent_id:
        logger.error(f"No intent ID in response: {intent_data}")
        raise HTTPException(status_code=500, detail="Failed to extract intent ID from response")

    # Step 2: Create session
    session_id = f"session_{uuid.uuid4().hex[:12]}"
    session = session_manager.create_session(
        session_id=session_id,
        intent_id=intent_id,
        locked_amount=float(request.amount),
        rate_per_minute=request.rate_per_minute
    )

    logger.info(f"✅ Session started: {session_id} | Intent: {intent_id} | Locked: ${request.amount}")

    return {
        "success": True,
        "session_id": session_id,
        "intent_id": intent_id,
        "locked_amount": request.amount,
        "session": session,
        "finternet_response": intent_data
    }

@app.get("/api/session/status/{session_id}")
async def get_session_status(session_id: str):
    """
    Get current session status with elapsed time
    """
    logger.info(f"📈 [API] GET /api/session/status/{session_id}")

    session = session_manager.update_session_status(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "success": True,
        "session": session
    }

@app.post("/api/session/end")
async def end_session(request: EndSessionRequest):
    """
    End a teaching session:
    1. Calculate elapsed time and costs
    2. Get escrow details
    3. Submit delivery proof (trigger settlement)
    4. Return summary
    """
    logger.info(f"🛑 [API] POST /api/session/end - Session: {request.session_id}")

    # Step 1: End session and calculate costs
    session = session_manager.end_session(request.session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    intent_id = session["intent_id"]

    # Step 2: Get escrow details
    logger.info(f"🔍 Fetching escrow details for intent: {intent_id}")
    escrow_result = await finternet_service.get_escrow_details(intent_id)

    # Step 3: Submit delivery proof to trigger settlement
    logger.info(f"📝 Submitting delivery proof for intent: {intent_id}")

    # Generate proof data
    proof_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex[:32]}"
    proof_uri = f"https://sessions.example.com/proof/{request.session_id}"
    submitted_by = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"  # Mock teacher address

    delivery_result = await finternet_service.submit_delivery_proof(
        intent_id=intent_id,
        proof_hash=proof_hash,
        proof_uri=proof_uri,
        submitted_by=submitted_by
    )

    logger.info(f"✅ Session ended: {request.session_id} | Charged: ${session['amount_charged']} | Refunded: ${session['amount_refunded']}")

    return {
        "success": True,
        "session": session,
        "escrow_details": escrow_result.get("data") if escrow_result["success"] else None,
        "delivery_proof": delivery_result.get("data") if delivery_result["success"] else None,
        "summary": {
            "elapsed_minutes": session["elapsed_minutes"],
            "amount_charged": session["amount_charged"],
            "amount_refunded": session["amount_refunded"],
            "teacher_paid": True,
            "settlement_method": "OFF_RAMP_MOCK"
        }
    }

@app.get("/api/ledger/entries")
async def get_ledger_entries(limit: int = 20, offset: int = 0):
    """
    Get transaction ledger entries via Finternet API
    """
    logger.info(f"📜 [API] GET /api/ledger/entries - Limit: {limit}, Offset: {offset}")

    result = await finternet_service.get_ledger_entries(limit=limit, offset=offset)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result["data"]

@app.get("/api/escrow/{intent_id}")
async def get_escrow(intent_id: str):
    """
    Get escrow details for a specific payment intent
    """
    logger.info(f"🔒 [API] GET /api/escrow/{intent_id}")

    result = await finternet_service.get_escrow_details(intent_id)

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result["data"]

@app.post("/api/delivery-proof")
async def submit_delivery_proof(request: DeliveryProofRequest):
    """
    Submit delivery proof for manual settlement trigger
    """
    logger.info(f"📝 [API] POST /api/delivery-proof - Intent: {request.intent_id}")

    result = await finternet_service.submit_delivery_proof(
        intent_id=request.intent_id,
        proof_hash=request.proof_hash,
        proof_uri=request.proof_uri,
        submitted_by=request.submitted_by
    )

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result["data"]

@app.post("/api/milestone")
async def create_milestone(request: MilestoneRequest):
    """
    Create milestone for milestone-based escrow release
    """
    logger.info(f"🎯 [API] POST /api/milestone - Intent: {request.intent_id}")

    result = await finternet_service.create_milestone(
        intent_id=request.intent_id,
        milestone_index=request.milestone_index,
        description=request.description,
        amount=request.amount
    )

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))

    return result["data"]

@app.get("/api/sessions/all")
async def get_all_sessions():
    """
    Debug endpoint: Get all sessions
    """
    return {
        "success": True,
        "sessions": session_manager.get_all_sessions()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", 8000))
    host = os.getenv("BACKEND_HOST", "0.0.0.0")

    logger.info(f"🚀 Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
