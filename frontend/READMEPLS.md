make readme
read me 
Problem Statement

Online learning today is rigid, commitment-heavy, and unfairly priced.
Students are required to pay upfront for courses without knowing whether the content, pace, or teaching style suits them. Teachers, on the other hand, are often judged by impulsive or low-effort reviews, which directly impact their earnings.

There is no system that:

Helps learners decide what to learn through conversation

Prices learning based on actual time used

Protects teachers using engagement-aware credibility

Handles payments fairly and transparently in real time

Our Solution

Murph is a conversational, pay-per-minute learning platform that connects students and teachers using responsible AI and usage-based payments.

Murph:

Guides students using conversational AI, not static dashboards

Charges learners only for the minutes they actually use

Uses engagement-based credibility scoring, especially safe for children

Protects teachers from unfair reviews

Uses Finternet as a secure payment gateway with session-based fund locking and instant settlement

Murph transforms learning from commitment-first to clarity-first.

Why this matters

Students reduce financial risk

Teachers are paid fairly and transparently

AI is used as a guide, not a decision-maker

Payments align with real learning value

2️⃣ Project File Structure (THIS IS IMPORTANT)

This structure is scalable, clean, and hackathon-safe.

🟦 Frontend (Next.js – Vercel)
frontend/
├── app/
│   ├── page.tsx                 # Landing / Role select
│   ├── student/
│   │   ├── chat/page.tsx        # Murph conversational UI
│   │   ├── live/page.tsx        # Live session (timer + cost)
│   │   ├── summary/page.tsx     # Session summary
│   │   └── settings/page.tsx
│   ├── teacher/
│   │   ├── dashboard/page.tsx
│   │   ├── sessions/page.tsx
│   │   └── earnings/page.tsx
│   ├── api/                     # Vercel API bridge
│   │   ├── chat/route.ts
│   │   ├── session/
│   │   │   ├── start/route.ts
│   │   │   └── end/route.ts
│   │   └── teacher/dashboard/route.ts
│   └── layout.tsx
│
├── components/
│   ├── ChatBox.tsx
│   ├── Timer.tsx
│   ├── CostMeter.tsx
│   └── SessionCard.tsx
│
├── lib/
│   └── api.ts                   # fetch wrappers
│
├── styles/
├── .env.local
└── package.json

Frontend rule

Frontend never talks to Finternet, DB, or AI directly.
It only talks to /api/*.

🟩 Backend (FastAPI – Render / Railway)
backend/
├── main.py
├── core/
│   ├── config.py
│   ├── auth.py                  # JWT logic
│   └── security.py
│
├── api/
│   ├── chat.py                  # Murph AI
│   ├── sessions.py              # start / end session
│   ├── reviews.py
│   ├── teacher.py
│   └── payments.py
│
├── services/
│   ├── ai_service.py
│   ├── session_service.py
│   ├── credibility_service.py
│   └── payment_service.py       # 🔑 FINTERNET HERE
│
├── models/
│   ├── user.py
│   ├── session.py
│   ├── review.py
│   └── payment.py
│
├── db/
│   ├── postgres.py
│   └── redis.py
│
├── requirements.txt
└── .env

Backend rule

Only the backend owns time, money, and trust.

3️⃣ Finternet Gateway Initialization (Very Important)

This is where most teams get sloppy. Don’t.

Step 1: Environment Variables (Backend Only)

In Render / Railway:

FINTERNET_BASE_URL=https://api.fmm.finternetlab.io
FINTERNET_API_KEY=your_key_here


Never put this in frontend.

Step 2: Initialize Finternet Client
services/payment_service.py
import requests
import os

FINTERNET_URL = os.getenv("FINTERNET_BASE_URL")
FINTERNET_KEY = os.getenv("FINTERNET_API_KEY")

HEADERS = {
    "Authorization": f"Bearer {FINTERNET_KEY}",
    "Content-Type": "application/json"
}

class FinternetClient:

    @staticmethod
    def lock_funds(amount, user_id):
        res = requests.post(
            f"{FINTERNET_URL}/lock",
            headers=HEADERS,
            json={
                "amount": amount,
                "user_id": user_id
            }
        )
        return res.json()

    @staticmethod
    def settle_payment(lock_id, final_amount):
        res = requests.post(
            f"{FINTERNET_URL}/settle",
            headers=HEADERS,
            json={
                "lock_id": lock_id,
                "amount": final_amount
            }
        )
        return res.json()


This file is your money firewall.

Step 3: Session Start → Lock Funds
api/sessions.py
from services.payment_service import FinternetClient
from db.redis import redis_client
import time

def start_session(user_id, teacher_id, rate_per_min):
    max_minutes = 30
    max_amount = rate_per_min * max_minutes

    lock = FinternetClient.lock_funds(max_amount, user_id)

    session_id = f"sess_{int(time.time())}"

    redis_client.set(
        session_id,
        {
            "start_time": time.time(),
            "lock_id": lock["lock_id"],
            "rate": rate_per_min
        }
    )

    return session_id

Step 4: Session End → Settlement
def end_session(session_id):
    session = redis_client.get(session_id)
    duration_min = (time.time() - session["start_time"]) / 60

    final_amount = int(duration_min * session["rate"])

    FinternetClient.settle_payment(
        session["lock_id"],
        final_amount
    )

    return {
        "minutes_used": round(duration_min, 2),
        "amount_paid": final_amount
    }


Unused money → refunded automatically.

4️⃣ One-liner you should remember

Murph does not charge users — it orchestrates fair charging using Finternet.
