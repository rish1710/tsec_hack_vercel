# Murph Platform - Quick Start Guide

## 🚀 Getting Started

This guide will help you set up and run the Murph learning platform locally.

---

## Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.9+ (for backend)
- **Redis** (for session management)
- **Finternet API credentials** (for payments)

---

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your credentials
notepad .env  # or use your preferred editor
```

**Required variables**:
```bash
FINTERNET_BASE_URL=https://api.fmm.finternetlab.io
FINTERNET_API_KEY=your_actual_finternet_key_here
REDIS_URL=redis://localhost:6379
```

### 3. Start Redis

```bash
# Install Redis if you haven't already
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# Or use Docker: docker run -d -p 6379:6379 redis

# Start Redis server
redis-server
```

### 4. Run Backend

```bash
# From backend directory
uvicorn main:app --reload
```

Backend will be available at: **http://localhost:8000**

Check health: http://localhost:8000/health

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
# Copy example file
cp .env.example .env.local

# Edit if needed (default should work)
notepad .env.local
```

**Default configuration**:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 3. Run Frontend

```bash
npm run dev
```

Frontend will be available at: **http://localhost:3000**

---

## Testing Finternet Integration

### Run Payment Flow Test

```bash
cd backend
python test_payment_flow.py
```

**Expected output**:
```
✓ Finternet credentials configured
✓ Funds locked successfully
✓ Session completed
✓ Payment settled successfully
✓ Unused funds refunded automatically

🎉 ALL TESTS PASSED! Finternet integration is working!
```

---

## Quick Test Flow

### 1. Start Both Services

**Terminal 1** (Backend):
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 2** (Redis):
```bash
redis-server
```

**Terminal 3** (Frontend):
```bash
cd frontend
npm run dev
```

### 2. Test the Application

1. Open browser: http://localhost:3000
2. Navigate to student chat
3. Start a learning session
4. Watch timer and cost meter update in real-time
5. End session
6. View summary with payment breakdown

---

## Troubleshooting

### Redis Connection Failed

**Error**: `Redis connection failed`

**Solution**:
- Make sure Redis is running: `redis-server`
- Check Redis URL in `.env`: `REDIS_URL=redis://localhost:6379`
- Test Redis: `redis-cli ping` (should return "PONG")

### Finternet API Errors

**Error**: `Finternet credentials not configured`

**Solution**:
- Check `.env` file has both variables set:
  - `FINTERNET_BASE_URL`
  - `FINTERNET_API_KEY`
- Verify API key is valid
- Test with: `python test_payment_flow.py`

### Backend Not Starting

**Error**: `Module not found`

**Solution**:
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Build Errors

**Error**: `Cannot find module`

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Project Structure

```
tsec_hack/
├── backend/                    # FastAPI backend
│   ├── api/                   # API endpoints
│   │   ├── sessions.py       # Session management
│   │   ├── chat.py           # Murph AI
│   │   └── payments.py       # Payment endpoints
│   ├── services/              # Business logic
│   │   ├── payment_service.py # Finternet client
│   │   └── session_service.py # Session + payment flow
│   ├── db/                    # Database clients
│   │   └── redis.py          # Redis session store
│   ├── main.py               # FastAPI app
│   └── test_payment_flow.py  # Payment tests
│
└── frontend/                  # Next.js frontend
    ├── app/
    │   ├── student/          # Student pages
    │   │   ├── chat/        # Murph chat
    │   │   ├── live/        # Live session
    │   │   └── summary/     # Session summary
    │   └── api/             # Next.js API routes
    │       └── session/     # Session endpoints
    └── components/           # React components
        ├── Timer.tsx        # Session timer
        ├── CostMeter.tsx    # Cost tracking
        └── SessionCard.tsx  # Session display
```

---

## Key Features Implemented

✅ **Finternet Payment Integration**
- Fund locking at session start
- Automatic settlement at session end
- Unused funds refunded automatically

✅ **Real-time Session Tracking**
- Live timer (updates every second)
- Live cost meter (updates every 100ms)
- Session data stored in Redis

✅ **Student Flow**
- Conversational chat with Murph
- Live session page with video placeholder
- Session summary with payment breakdown

✅ **Payment Flow**
- Lock → Use → Settle → Refund
- Complete transparency
- Fair pricing guarantee

---

## Next Steps

### For Development

1. **Add Authentication**
   - JWT-based auth
   - User registration/login
   - Protected routes

2. **Complete Teacher Dashboard**
   - Earnings overview
   - Session management
   - Review system

3. **Integrate AI**
   - Connect OpenAI/Claude for Murph
   - Conversational learning guidance
   - Session recommendations

4. **Database Integration**
   - Replace mock data with PostgreSQL
   - User profiles
   - Session history

### For Production

1. **Deploy Backend**
   - Railway or Render
   - Set environment variables
   - Configure production Redis

2. **Deploy Frontend**
   - Vercel
   - Set backend URL
   - Configure domains

3. **Testing**
   - End-to-end tests
   - Load testing
   - Security audit

---

## Support

For issues or questions:
1. Check the [walkthrough.md](file:///C:/Users/rishi/.gemini/antigravity/brain/59a6d830-5d7c-4d5e-a816-66aa2af91b9b/walkthrough.md)
2. Review [implementation_plan.md](file:///C:/Users/rishi/.gemini/antigravity/brain/59a6d830-5d7c-4d5e-a816-66aa2af91b9b/implementation_plan.md)
3. Check backend logs: `uvicorn main:app --reload --log-level debug`

---

**Happy Learning with Murph! 🎓**
