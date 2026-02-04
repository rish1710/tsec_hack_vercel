# 🎸 Finternet Teaching Session MVP

A fully working hackathon prototype demonstrating **Finternet Labs payment infrastructure** for live teaching sessions with real-time payment intent creation, escrow, and settlement.

## 🎯 What This Demo Does

This MVP showcases a complete payment flow using Finternet's REST APIs:

1. **Connect Wallet** → Check balance via Finternet API
2. **Start Session** → Create payment intent (lock $30 in escrow)
3. **Live Session** → Real-time timer with cost calculation
4. **End Session** → Submit delivery proof (trigger settlement)
5. **Summary** → Show amount charged, refunded, and settlement confirmation

## ✅ Success Criteria Met

- ✅ Real balance check via Finternet API
- ✅ Real fund locking (Payment Intent creation)
- ✅ Real settlement trigger (Delivery Proof submission)
- ✅ Real refund calculation
- ✅ Full transaction summary

## 🏗️ Tech Stack

- **Backend**: Python + FastAPI
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Payment API**: Finternet Labs REST APIs

## 📁 Project Structure

```
tsec_hacks_finternet/
├── backend/
│   ├── main.py                  # FastAPI application
│   ├── finternet_service.py     # Finternet API integration
│   ├── session_manager.py       # In-memory session storage
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Main UI component
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Tailwind styles
│   ├── package.json            # Node dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── tailwind.config.js      # Tailwind config
│   └── next.config.js          # Next.js config
├── .env.example                # Environment template
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+ installed
- Node.js 18+ installed
- npm or yarn installed

### Step 1: Clone and Setup Environment

```bash
cd tsec_hacks_finternet
cp .env.example backend/.env
```

Edit `backend/.env`:
```env
FINTERNET_API_KEY=sk_hackathon_3eb5a79c271079186415ba4af695a130
FINTERNET_BASE_URL=http://localhost:3000
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
```

### Step 2: Start Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
python main.py
```

Backend will start on `http://localhost:8000`

### Step 3: Start Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Run Next.js dev server
npm run dev
```

Frontend will start on `http://localhost:3000`

### Step 4: Test the Flow

1. Open `http://localhost:3000` in your browser
2. Click **"Connect Wallet"**
3. Click **"Start Session"**
4. Watch the timer run
5. Click **"End Session"**
6. View the transaction summary

## 🔌 Finternet API Endpoints Implemented

### Backend Endpoints

| Endpoint | Method | Description | Finternet API Called |
|----------|--------|-------------|---------------------|
| `/api/wallet/balance` | GET | Check wallet balance | `GET /api/v1/payment-intents/account/balance` |
| `/api/session/start` | POST | Start session & lock funds | `POST /api/v1/payment-intents` |
| `/api/session/status/:id` | GET | Get session status | Internal (in-memory) |
| `/api/session/end` | POST | End session & settle | `POST /api/v1/payment-intents/:id/escrow/delivery-proof` |
| `/api/escrow/:intentId` | GET | Get escrow details | `GET /api/v1/payment-intents/:id/escrow` |
| `/api/ledger/entries` | GET | Get transaction history | `GET /api/v1/payment-intents/account/ledger-entries` |
| `/api/milestone` | POST | Create milestone | `POST /api/v1/payment-intents/:id/escrow/milestones` |

### Finternet APIs Used

All API calls are in [`backend/finternet_service.py`](backend/finternet_service.py):

1. **Get Account Balance**
   ```python
   GET /api/v1/payment-intents/account/balance
   Headers: X-API-Key: {API_KEY}
   ```

2. **Create Payment Intent** (Lock Funds)
   ```python
   POST /api/v1/payment-intents
   Headers: X-API-Key: {API_KEY}
   Body: {
     "amount": "30.00",
     "currency": "USD",
     "type": "DELIVERY_VS_PAYMENT",
     "settlementMethod": "OFF_RAMP_MOCK",
     "settlementDestination": "teacher_bank_account",
     "description": "Live teaching session payment"
   }
   ```

3. **Get Escrow Details**
   ```python
   GET /api/v1/payment-intents/{intentId}/escrow
   Headers: X-API-Key: {API_KEY}
   ```

4. **Submit Delivery Proof** (Trigger Settlement)
   ```python
   POST /api/v1/payment-intents/{intentId}/escrow/delivery-proof
   Headers: X-API-Key: {API_KEY}
   Body: {
     "proofHash": "0x...",
     "proofURI": "https://sessions.example.com/proof/{sessionId}",
     "submittedBy": "0x742d35Cc..."
   }
   ```

5. **Get Ledger Entries** (Transaction History)
   ```python
   GET /api/v1/payment-intents/account/ledger-entries?limit=20&offset=0
   Headers: X-API-Key: {API_KEY}
   ```

6. **Create Milestone** (Milestone-based Release)
   ```python
   POST /api/v1/payment-intents/{intentId}/escrow/milestones
   Headers: X-API-Key: {API_KEY}
   Body: {
     "milestoneIndex": 0,
     "description": "Phase 1",
     "amount": "10.00"
   }
   ```

## 💡 How It Works

### User Flow

1. **Connect Wallet**
   - Frontend calls: `GET /api/wallet/balance`
   - Backend calls: Finternet `GET /account/balance`
   - Displays current balance

2. **Start Session**
   - Frontend calls: `POST /api/session/start`
   - Backend:
     - Calls Finternet `POST /payment-intents` (locks $30)
     - Stores session in memory
     - Returns `session_id` and `intent_id`
   - Frontend starts timer

3. **Active Session**
   - Timer runs in frontend (UI only)
   - Cost calculated: `elapsed_minutes × $1.50/min`
   - Shows locked amount: $30

4. **End Session**
   - Frontend calls: `POST /api/session/end`
   - Backend:
     - Calculates final cost
     - Gets escrow details
     - Submits delivery proof (triggers settlement)
     - Calculates refund
   - Frontend shows summary

### Payment Logic

```
Locked Amount: $30.00
Rate: $1.50 / minute
Max Duration: 20 minutes

Example Session (5 minutes):
- Amount Charged: 5 × $1.50 = $7.50
- Amount Refunded: $30.00 - $7.50 = $22.50
- Teacher Paid: $7.50 (instantly via Finternet)
```

## 🧪 Testing

### Test Balance Check
```bash
curl http://localhost:8000/api/wallet/balance
```

### Test Payment Intent Creation
```bash
curl -X POST http://localhost:8000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"amount": "30.00", "rate_per_minute": 1.50, "session_title": "Live Guitar Basics"}'
```

### View All Sessions (Debug)
```bash
curl http://localhost:8000/api/sessions/all
```

## 📊 Logs

Backend logs every Finternet API call with clear markers:

```
[FINTERNET] Fetching account balance from: http://localhost:3000/api/v1/payment-intents/account/balance
[FINTERNET] Balance retrieved successfully
[FINTERNET] Creating payment intent for amount: 30.00 USD
[FINTERNET] Payment intent created successfully
[FINTERNET] Submitting delivery proof for intent: intent_xxx
[FINTERNET] Delivery proof submitted successfully
```

## 🔒 Security Notes

- API key is stored in `.env` (not committed)
- CORS is wide open for MVP (restrict in production)
- No authentication system (hardcoded users)
- In-memory storage only (no database)

## 🚫 What's NOT Included (By Design)

- ❌ Real authentication/authorization
- ❌ Real video streaming (mock placeholder)
- ❌ AI discovery (hardcoded session)
- ❌ Review system (out of scope)
- ❌ Teacher dashboard
- ❌ Database persistence
- ❌ Blockchain UI/wallets

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.9+)
- Install dependencies: `pip install -r requirements.txt`
- Check if port 8000 is available

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if port 3000 is available

### API calls failing
- Verify Finternet base URL in `.env`
- Check API key is correct
- Ensure Finternet service is running
- Check backend logs for error details

### CORS errors
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

## 📝 API Key

Current API Key (Provided):
```
sk_hackathon_3eb5a79c271079186415ba4af695a130
```

## 🎓 Hardcoded Session

- **Title**: Live Guitar Basics
- **Teacher**: Guitar Master Pro
- **Rate**: $1.50 / minute
- **Max Lock**: $30.00
- **Max Duration**: 20 minutes

## 📦 Dependencies

### Backend
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `httpx` - HTTP client for Finternet API
- `python-dotenv` - Environment variables
- `pydantic` - Data validation

### Frontend
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety
- `tailwindcss` - Styling
- `axios` - HTTP client

## 🏆 Success Verification

The MVP is successful if you can:

1. ✅ Click "Connect Wallet" → See real balance from Finternet
2. ✅ Click "Start Session" → See $30 locked (real payment intent created)
3. ✅ Timer runs → Shows elapsed time and cost
4. ✅ Click "End Session" → See settlement + refund processed
5. ✅ View Summary → Shows detailed transaction breakdown

## 🤝 Credits

Built for **Finternet Labs Hackathon**

- Payment Infrastructure: Finternet Labs
- Backend: FastAPI
- Frontend: Next.js + TypeScript + Tailwind CSS

---

**Note**: This is a hackathon MVP focused on payment flow correctness, not production-ready code.
