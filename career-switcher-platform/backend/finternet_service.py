"""
Finternet API Service - Handles all interactions with Finternet payment APIs
"""
import httpx
import logging
from typing import Optional, Dict, Any
from httpx import HTTPStatusError

logger = logging.getLogger(__name__)

class FinternetService:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }
        logger.info(f"Initialized Finternet Service with base URL: {self.base_url}")

    async def get_account_balance(self) -> Dict[str, Any]:
        """GET /api/v1/payment-intents/account/balance"""
        url = f"{self.base_url}/api/v1/payment-intents/account/balance"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                return {"success": True, "data": data}
        except Exception as e:
            logger.error(f"Error getting balance: {str(e)}")
            return {"success": False, "error": str(e)}

    async def create_payment_intent(
        self,
        amount: str,
        currency: str = "USD",
        description: str = "Course payment",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """POST /api/v1/payment-intents - Creates payment intent (locks funds)"""
        url = f"{self.base_url}/api/v1/payment-intents"

        payload = {
            "amount": amount,
            "currency": currency,
            "type": "DELIVERY_VS_PAYMENT",
            "settlementMethod": "OFF_RAMP_MOCK",
            "settlementDestination": "teacher_bank_account",
            "description": description,
            "metadata": metadata or {}
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=self.headers, json=payload, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                return {"success": True, "data": data}
        except Exception as e:
            logger.error(f"Error creating payment intent: {str(e)}")
            return {"success": False, "error": str(e)}

    async def submit_delivery_proof(
        self,
        intent_id: str,
        proof_hash: str,
        proof_uri: str,
        submitted_by: str
    ) -> Dict[str, Any]:
        """POST /api/v1/payment-intents/{intentId}/escrow/delivery-proof"""
        url = f"{self.base_url}/api/v1/payment-intents/{intent_id}/escrow/delivery-proof"

        payload = {
            "proofHash": proof_hash,
            "proofURI": proof_uri,
            "submittedBy": submitted_by
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=self.headers, json=payload, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                logger.info("Delivery proof submitted successfully")
                return {"success": True, "data": data}
        except httpx.HTTPStatusError as e:
            # If endpoint doesn't exist (404), this is expected with some APIs
            if e.response.status_code == 404:
                logger.warning(f"Delivery proof endpoint not found (404) - may be expected with this API")
                return {"success": False, "error": "Endpoint not available", "recoverable": True}
            logger.error(f"HTTP error submitting delivery proof: {str(e)}")
            return {"success": False, "error": str(e), "recoverable": False}
        except Exception as e:
            logger.error(f"Error submitting delivery proof: {str(e)}")
            return {"success": False, "error": str(e), "recoverable": False}
