# Career Switcher Platform

AI-powered personalized learning platform for career switchers, homemakers re-entering the workforce, and professionals transitioning to tech.

## Features

- **Conversational AI Interface**: Chat with an AI counselor that understands your background and goals
- **Smart Video Recommendations**: RAG-like keyword matching system that suggests relevant courses
- **Personalized Learning Paths**: Tailored content for non-tech to tech transitions
- **Diverse Course Library**: 20+ courses covering Data Analytics, QA, Product Management, Programming, and more

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React

### Backend
- Python FastAPI
- Groq AI (Llama 3.3 70B)
- RAG-like keyword matching

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Groq API key ([Get one here](https://console.groq.com))

### Backend Setup

1. Navigate to the backend directory:
```bash
cd career-switcher-platform/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file from example:
```bash
cp .env.example .env
```

6. Add your Groq API key to `.env`:
```
GROQ_API_KEY=your_actual_groq_api_key_here
```

7. Run the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd career-switcher-platform/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3001`

## Usage

1. Open your browser and go to `http://localhost:3001`
2. Start chatting with the AI about your career goals and background
3. After a few exchanges, the AI will suggest personalized video courses
4. Click on any video suggestion to view details (Coming Soon page for now)

## How It Works

### AI Conversation Flow
1. User chats with the AI about their background, goals, and interests
2. AI asks thoughtful questions to gather relevant information
3. After sufficient conversation (3+ exchanges), AI analyzes the discussion

### Video Recommendation System
1. **Keyword Extraction**: AI extracts 12-15 relevant keywords from the conversation
2. **RAG-like Matching**: Keywords are matched against video database (each video has 20 keywords)
3. **Scoring**: Videos are scored based on keyword overlap
4. **Top 3 Selection**: Best matching videos are presented with personalized reasons

### Video Database
- 20 mock videos covering different tech career paths
- Categories: Data Analytics, QA, Product Management, Programming, Design, Operations, etc.
- Each video mapped with 20 industry-relevant keywords
- Optimized for career switchers, beginners, and non-tech backgrounds

## Project Structure

```
career-switcher-platform/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Main landing page with chat
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── globals.css        # Global styles
│   │   │   └── video/[id]/
│   │   │       └── page.tsx       # Video detail page (Coming Soon)
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx  # Main chat component
│   │   │   ├── MessageBubble.tsx  # Chat message display
│   │   │   └── VideoSuggestions.tsx # Video cards display
│   │   └── types/
│   │       └── index.ts           # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── main.py                    # FastAPI app with Groq integration
│   ├── video_database.json        # Video-keyword database
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## API Endpoints

### POST /api/chat
Chat with the AI and get video suggestions

**Request:**
```json
{
  "message": "I want to transition from HR to tech",
  "conversation_history": [
    {"role": "assistant", "content": "Hi! How can I help you?"},
    {"role": "user", "content": "I'm interested in tech careers"}
  ]
}
```

**Response:**
```json
{
  "response": "That's great! What specific area interests you?",
  "video_suggestions": [
    {
      "id": "vid001",
      "title": "Introduction to Data Analytics",
      "description": "...",
      "reason": "Perfect for beginners starting from scratch",
      "duration": "2h 15m",
      "category": "Data Analytics"
    }
  ]
}
```

## Future Enhancements

- [ ] Video player integration
- [ ] Progress tracking
- [ ] User authentication
- [ ] Personalized learning paths
- [ ] Course completion certificates
- [ ] Community forums
- [ ] Live mentor sessions
- [ ] Job placement assistance

## License

MIT
