"""
Finternet API Service - Handles all interactions with Finternet payment APIs
"""
import httpx
import logging
from typing import Optional, Dict, Any
from datetime import datetime

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
        """
        GET /api/v1/payment-intents/account/balance
        Returns the merchant's wallet balance
        """
        url = f"{self.base_url}/api/v1/payment-intents/account/balance"
        logger.info(f"[FINTERNET] Fetching account balance from: {url}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                logger.info(f"[FINTERNET] Balance retrieved successfully: {data}")
                return {"success": True, "data": data}
        except httpx.HTTPStatusError as e:
            logger.error(f"[FINTERNET] HTTP error getting balance: {e.response.status_code} - {e.response.text}")
            return {"success": False, "error": e.response.text}
        except Exception as e:
            logger.error(f"[FINTERNET] Error getting balance: {str(e)}")
            return {"success": False, "error": str(e)}

    async def create_payment_intent(
        self,
        amount: str,
        currency: str = "USD",
        intent_type: str = "DELIVERY_VS_PAYMENT",
        settlement_method: str = "OFF_RAMP_MOCK",
        settlement_destination: str = "teacher_bank_account",
        description: str = "Live teaching session payment",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        POST /api/v1/payment-intents
        Creates a payment intent (locks funds in escrow)
        """
        url = f"{self.base_url}/api/v1/payment-intents"
        logger.info(f"[FINTERNET] Creating payment intent for amount: {amount} {currency}")

        payload = {
            "amount": amount,
            "currency": currency,
            "type": intent_type,
            "settlementMethod": settlement_method,
            "settlementDestination": settlement_destination,
            "description": description
        }

        if metadata:
            payload["metadata"] = metadata

        logger.info(f"[FINTERNET] Payment Intent Payload: {payload}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=self.headers, json=payload, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                logger.info(f"[FINTERNET] Payment intent created successfully: {data}")
                return {"success": True, "data": data}
        except httpx.HTTPStatusError as e:
            logger.error(f"[FINTERNET] HTTP error creating payment intent: {e.response.status_code} - {e.response.text}")
            return {"success": False, "error": e.response.text}
        except Exception as e:
            logger.error(f"[FINTERNET] Error creating payment intent: {str(e)}")
            return {"success": False, "error": str(e)}

    async def get_escrow_details(self, intent_id: str) -> Dict[str, Any]:
        """
        GET /api/v1/payment-intents/{intentId}/escrow
        Gets escrow details for a payment intent
        """
        url = f"{self.base_url}/api/v1/payment-intents/{intent_id}/escrow"
        logger.info(f"[FINTERNET] Fetching escrow details for intent: {intent_id}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                logger.info(f"[FINTERNET] Escrow details retrieved: {data}")
                return {"success": True, "data": data}
        except httpx.HTTPStatusError as e:
            logger.error(f"[FINTERNET] HTTP error getting escrow: {e.response.status_code} - {e.response.text}")
            return {"success": False, "error": e.response.text}
        except Exception as e:
            logger.error(f"[FINTERNET] Error getting escrow: {str(e)}")
            return {"success": False, "error": str(e)}

    async def submit_delivery_proof(
        self,
        intent_id: str,
        proof_hash: str,
        proof_uri: str,
        submitted_by: str
    ) -> Dict[str, Any]:
        """
        POST /api/v1/payment-intents/{intentId}/escrow/delivery-proof
        Submits delivery proof to trigger settlement
        """
        url = f"{self.base_url}/api/v1/payment-intents/{intent_id}/escrow/delivery-proof"
        logger.info(f"[FINTERNET] Submitting delivery proof for intent: {intent_id}")

        payload = {
            "proofHash": proof_hash,
            "proofURI": proof_uri,
            "submittedBy": submitted_by
        }

        logger.info(f"[FINTERNET] Delivery Proof Payload: {payload}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=self.headers, json=payload, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                logger.info(f"[FINTERNET] Delivery proof submitted successfully: {data}")
                return {"success": True, "data": data}
        except httpx.HTTPStatusError as e:
            logger.error(f"[FINTERNET] HTTP error submitting delivery proof: {e.response.status_code} - {e.response.text}")
            return {"success": False, "error": e.response.text}
        except Exception as e:
            logger.error(f"[FINTERNET] Error submitting delivery proof: {str(e)}")
            return {"success": False, "error": str(e)}

    async def get_ledger_entries(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """
        GET /api/v1/payment-intents/account/ledger-entries
        Gets transaction history
        """
        url = f"{self.base_url}/api/v1/payment-intents/account/ledger-entries"
        params = {"limit": limit, "offset": offset}
        logger.info(f"[FINTERNET] Fetching ledger entries (limit={limit}, offset={offset})")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, params=params, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                logger.info(f"[FINTERNET] Ledger entries retrieved: {len(data.get('entries', []))} entries")
                return {"success": True, "data": data}
        except httpx.HTTPStatusError as e:
            logger.error(f"[FINTERNET] HTTP error getting ledger: {e.response.status_code} - {e.response.text}")
            return {"success": False, "error": e.response.text}
        except Exception as e:
            logger.error(f"[FINTERNET] Error getting ledger: {str(e)}")
            return {"success": False, "error": str(e)}

    async def create_milestone(
        self,
        intent_id: str,
        milestone_index: int,
        description: str,
        amount: str
    ) -> Dict[str, Any]:
        """
        POST /api/v1/payment-intents/{intentId}/escrow/milestones
        Creates a milestone for milestone-based escrow release
        """
        url = f"{self.base_url}/api/v1/payment-intents/{intent_id}/escrow/milestones"
        logger.info(f"[FINTERNET] Creating milestone for intent: {intent_id}")

        payload = {
            "milestoneIndex": milestone_index,
            "description": description,
            "amount": amount
        }

        logger.info(f"[FINTERNET] Milestone Payload: {payload}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=self.headers, json=payload, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                logger.info(f"[FINTERNET] Milestone created successfully: {data}")
                return {"success": True, "data": data}
        except httpx.HTTPStatusError as e:
            logger.error(f"[FINTERNET] HTTP error creating milestone: {e.response.status_code} - {e.response.text}")
            return {"success": False, "error": e.response.text}
        except Exception as e:
            logger.error(f"[FINTERNET] Error creating milestone: {str(e)}")
            return {"success": False, "error": str(e)}
