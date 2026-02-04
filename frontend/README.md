# Murph Frontend

Next.js-based conversational AI learning platform frontend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` (optional, defaults to localhost:8000):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

Navigate to `http://localhost:3000/student/chat` to test the conversational flow.

## Project Structure

- `/app/student/chat` - Main student chat interface
- `/components` - Reusable React components
- `/lib/api.ts` - API client functions
