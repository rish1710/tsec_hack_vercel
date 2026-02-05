# Complete Setup Guide - Career Switcher Platform with Finternet Payment

## 📁 File Structure

```
career-switcher-platform/
├── frontend/
│   ├── public/
│   │   └── videos/
│   │       └── course.mp4          ← PUT YOUR VIDEO HERE
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── PaymentFlow.tsx     ← NEW: Payment modal
│   │   │   └── VideoPlayer.tsx     ← NEW: Video player with timer
│   │   └── types/
│   └── package.json
└── backend/
    ├── main.py                      ← Updated with payment endpoints
    ├── finternet_service.py         ← NEW: Finternet API integration
    ├── video_session_manager.py     ← NEW: Session tracking
    ├── video_database.json          ← 12 videos
    └── requirements.txt
```

## 🎥 Step 1: Add Your Video

1. **Put your video file here:**
   ```
   career-switcher-platform/frontend/public/videos/course.mp4
   ```

2. The video player expects: `public/videos/course.mp4`
   - Format: MP4 (recommended)
   - Any resolution works
   - Make sure it's named `course.mp4` or update line 191 in `video/[id]/page.tsx`

## 🔧 Step 2: Backend Setup

```bash
cd career-switcher-platform/backend

# Install new dependencies
pip install httpx==0.26.0

# Create .env file (if not exists)
echo "GROQ_API_KEY=your_groq_key_here" > .env
echo "FINTERNET_API_KEY=sk_hackathon_3eb5a79c271079186415ba4af695a130" >> .env
echo "FINTERNET_BASE_URL=http://localhost:3000" >> .env

# Start backend
python main.py
```

Backend should run on: **http://localhost:8000**

## 🎨 Step 3: Frontend Setup

```bash
cd career-switcher-platform/frontend

# Install dependencies (if not done)
npm install

# Start frontend
npm run dev
```

Frontend should run on: **http://localhost:3001**

## 🌐 Step 4: Start Finternet Mock Server

In a **separate terminal**:

```bash
cd ../../backend  # Go to the original finternet backend
python main.py
```

Finternet server should run on: **http://localhost:3000**

## ✅ Step 5: Test Complete Flow

### User Journey:

1. **Chat Flow** (http://localhost:3001)
   - Chat opens with: "Hey! What do you do right now?"
   - Answer: "I'm a web developer"
   - AI asks: "What are you looking to learn?"
   - Answer: "AI and machine learning"
   - AI asks: "What's your experience level?"
   - Answer: "I'm a beginner"
   - AI shows 3 video suggestions

2. **Click Video Card**
   - Opens video page with course details
   - Shows: Lock $30.00, pay-per-watch

3. **Click "Start Learning Now"**
   - **Payment Modal Opens**
   - Step 1: Click "Connect Wallet" → Shows balance
   - Step 2: Enter card details (mock):
     - Name: John Doe
     - Card: 1234567890123456
     - Expiry: 12/25
     - CVV: 123
   - Step 3: Click "Continue" → See confirmation
   - Step 4: Click "Lock Funds & Start Course"

4. **Video Playing**
   - Video player loads your course.mp4
   - **Payment tracker shows:**
     - Time Watched: 0:00 (counting up)
     - Current Cost: $0.00 (increasing)
     - Locked Amount: $30.00
   - Play the video and watch timer count

5. **End Session**
   - Click "End Session" button
   - Confirmation shows:
     - Time watched
     - Amount charged (based on time)
     - Refund amount
   - Click "End & Settle"

6. **Summary Page**
   - Shows:
     - Total time watched
     - Amount charged to student
     - Amount refunded to student
     - Teacher payment status
   - Can "Watch Again" or "Back to Home"

7. **Back to Chat**
   - Chat history is preserved!
   - Previous conversation and video suggestions still visible

## 🔑 Key Features

### Chat History Preservation ✅
- Saved in localStorage
- Persists when navigating to video and back
- Reset by clearing browser cache

### Payment Flow ✅
- **Wallet Connect** → Get balance from Finternet
- **Card Input** → Mock payment details
- **Lock Funds** → Creates payment intent via Finternet API
- **Pay-Per-Watch** → Only charges for actual watch time

### Video Session ✅
- **Timer** → Counts every second watching
- **Cost Calculator** → Updates in real-time
- **Rate** → Based on (locked amount / video duration)
- **End Session** → Settles payment, refunds remainder

### Payment Settlement ✅
- **Teacher Gets** → Amount for time watched
- **Student Gets** → Refund for unwatched time
- **Finternet** → Handles escrow and settlement via delivery proof

## 🎯 API Endpoints

### Chat & Videos
- `POST /api/chat` - AI conversation
- `GET /api/video/{id}` - Get video details

### Payment (NEW)
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/video-session/start` - Lock funds, start session
- `GET /api/video-session/{id}` - Get session status
- `POST /api/video-session/end` - End session, settle payment

## 🐛 Troubleshooting

### Video not playing?
- Check file is at: `frontend/public/videos/course.mp4`
- Check browser console for errors
- Try a different video format if needed

### Payment not working?
- Ensure Finternet server is running (http://localhost:3000)
- Check backend logs for API errors
- Verify FINTERNET_API_KEY in .env

### Chat not preserved?
- Check browser localStorage (F12 → Application → Local Storage)
- Clear cache if corrupted

### Backend errors?
- Make sure all dependencies installed: `pip install -r requirements.txt`
- Check all 3 files exist: `finternet_service.py`, `video_session_manager.py`, `video_database.json`

## 📊 Example Flow

```
User Action          →  Backend           →  Finternet          →  Result
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Click "Start"        →  /video-session    →  Create Intent     →  Funds locked
                         /start                (lock $30)           Session started

Watch video          →  Session manager   →  -                 →  Timer counting
(2 minutes)              tracking time                             Cost: $1.00

Click "End"          →  /video-session    →  Submit proof      →  Charged: $1.00
                         /end                  Settlement            Refund: $29.00
                                                                    Teacher paid
```

## 🎬 All Done!

You now have a complete:
- ✅ AI-powered course recommendation system
- ✅ Video player with real-time payment tracking
- ✅ Finternet payment integration
- ✅ Pay-per-watch functionality
- ✅ Automatic refunds
- ✅ Chat history preservation

Enjoy your platform!
