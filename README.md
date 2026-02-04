# Murph – Conversational Pay-Per-Minute Learning Platform

> **Clarity-first learning.** Pay only for what you use. Fair for students. Fair for teachers.

---

## 🎯 Problem Statement

Online learning today is **rigid, commitment-heavy, and unfairly priced**.

- **Students** pay upfront for courses without knowing if the content, pace, or teaching style suits them
- **Teachers** are judged by impulsive or low-effort reviews that directly impact their earnings
- **No system exists** that:
  - Helps learners decide what to learn through conversation
  - Prices learning based on actual time used
  - Protects teachers using engagement-aware credibility
  - Handles payments fairly and transparently in real time

---

## 💡 Our Solution

**Murph** is a conversational, pay-per-minute learning platform that connects students and teachers using responsible AI and usage-based payments.

### Key Features

✅ **Conversational AI Guidance** – Students interact with Murph, not static dashboards  
✅ **Pay-Per-Minute Pricing** – Learners are charged only for minutes actually used  
✅ **Engagement-Based Credibility** – Safe scoring system, especially for children  
✅ **Teacher Protection** – Guards against unfair reviews  
✅ **Finternet Payment Gateway** – Session-based fund locking with instant settlement

**Murph transforms learning from commitment-first to clarity-first.**

---

## 🌟 Why This Matters

| Stakeholder | Benefit |
|------------|---------|
| **Students** | Reduce financial risk, explore freely |
| **Teachers** | Fair pay, transparent earnings, review protection |
| **Platform** | AI as a guide, not a decision-maker |
| **Payments** | Real-time alignment with learning value |

---

## 🏗️ Project Architecture

### Tech Stack

- **Frontend**: Next.js (deployed on Vercel)
- **Backend**: FastAPI (deployed on Render/Railway)
- **Database**: PostgreSQL + Redis
- **AI**: Conversational AI service (Murph)
- **Payments**: Finternet Gateway

### Architecture Rules

> **Frontend Rule**: Frontend never talks to Finternet, DB, or AI directly. It only communicates through `/api/*`.

> **Backend Rule**: Only the backend owns time, money, and trust.

---

## 📁 Project Structure

### 🟦 Frontend (Next.js)

```
frontend/
├── app/
│   ├── page.tsx                      # Landing / Role select
│   ├── student/
│   │   ├── chat/page.tsx             # Murph conversational UI
│   │   ├── live/page.tsx             # Live session (timer + cost)
│   │   ├── summary/page.tsx          # Session summary
│   │   └── settings/page.tsx
│   ├── teacher/
│   │   ├── dashboard/page.tsx
│   │   ├── sessions/page.tsx
│   │   └── earnings/page.tsx
│   ├── api/                          # Vercel API bridge
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
│   └── api.ts                        # fetch wrappers
│
├── styles/
├── .env.local
└── package.json
```

### 🟩 Backend (FastAPI)

```
backend/
├── main.py
├── core/
│   ├── config.py
│   ├── auth.py                       # JWT logic
│   └── security.py
│
├── api/
│   ├── chat.py                       # Murph AI
│   ├── sessions.py                   # start / end session
│   ├── reviews.py
│   ├── teacher.py
│   └── payments.py
│
├── services/
│   ├── ai_service.py
│   ├── session_service.py
│   ├── credibility_service.py
│   └── payment_service.py            # 🔑 FINTERNET HERE
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
```

---

## 💳 Finternet Integration

### Environment Variables (Backend Only)

```bash
FINTERNET_BASE_URL=https://api.fmm.finternetlab.io
FINTERNET_API_KEY=your_key_here
```

⚠️ **Never put Finternet credentials in frontend.**

### Payment Flow

#### 1. Initialize Finternet Client

```python
# services/payment_service.py
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
```

#### 2. Session Start → Lock Funds

```python
# api/sessions.py
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
```

#### 3. Session End → Settlement

```python
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
```

**Unused money → refunded automatically.**

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL
- Redis
- Finternet API credentials

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Add your environment variables
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your environment variables
uvicorn main:app --reload
```

---

## 🎓 Core Principle

> **Murph does not charge users — it orchestrates fair charging using Finternet.**

---

## 📝 License

[Add your license here]

---

## 👥 Team

[Add your team information here]

---

## 🏆 Hackathon

Built for [Hackathon Name]

---

**Made with ❤️ for fair, transparent, and conversational learning.**
