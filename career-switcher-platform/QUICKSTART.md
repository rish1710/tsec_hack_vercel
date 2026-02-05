# Quick Start Guide

Get your Career Switcher Platform up and running in 5 minutes!

## Step 1: Get Your Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you'll need it in Step 3)

## Step 2: Setup Backend

Open a terminal and run:

```bash
# Navigate to backend
cd career-switcher-platform/backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate
# OR on Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env
# OR on Mac/Linux: cp .env.example .env
```

## Step 3: Add Your API Key

Open `career-switcher-platform/backend/.env` in any text editor and replace:

```
GROQ_API_KEY=your_groq_api_key_here
```

with your actual Groq API key:

```
GROQ_API_KEY=gsk_abc123xyz...
```

## Step 4: Start Backend Server

In the same terminal (with venv activated):

```bash
python main.py
```

You should see: `Uvicorn running on http://0.0.0.0:8000`

## Step 5: Setup Frontend

Open a **new terminal** and run:

```bash
# Navigate to frontend
cd career-switcher-platform/frontend

# Install dependencies (this might take a minute)
npm install

# Start development server
npm run dev
```

You should see: `Local: http://localhost:3001`

## Step 6: Open Your Browser

Go to: [http://localhost:3001](http://localhost:3001)

You should see the Career Switcher Platform landing page with the chat interface!

## Testing the App

1. Start chatting with the AI
2. Tell it about your background (e.g., "I'm from HR and want to move to tech")
3. Answer its questions about your goals
4. After 3-4 exchanges, you'll see video recommendations pop up
5. Click on any video card to see the "Coming Soon" page

## Common Issues

### Backend not starting?
- Make sure virtual environment is activated
- Check if port 8000 is already in use
- Verify GROQ_API_KEY is set correctly in .env

### Frontend not starting?
- Run `npm install` again if dependencies failed
- Make sure you're in the frontend directory
- Check if port 3001 is available

### Videos not showing?
- Make sure backend is running on port 8000
- Check browser console for errors
- Ensure you've had at least 3 exchanges with the AI

### API Key errors?
- Double-check your Groq API key is valid
- Make sure there are no extra spaces in .env file
- Restart the backend server after updating .env

## Architecture Overview

```
User Browser (localhost:3001)
    ↓
Next.js Frontend
    ↓ (API calls)
FastAPI Backend (localhost:8000)
    ↓
Groq AI (Llama 3.3 70B)
    ↓
Keyword Extraction → Video Matching → Top 3 Results
```

## Next Steps

- Experiment with different conversation flows
- Check out the video database in `backend/video_database.json`
- Explore the code structure in the README
- Start customizing for your needs!

## Need Help?

Check the main [README.md](README.md) for detailed documentation and API endpoints.

Happy coding!
