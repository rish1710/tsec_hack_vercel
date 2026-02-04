# Getting Started with Murph Platform

## Option 1: Using Docker (Recommended)

Install Docker Desktop from https://docker.com/get-started/, then:

```bash
cd frontend

# Build and run with Docker Compose
docker-compose up --build

# Development server runs at http://localhost:3000
```

## Option 2: Install Node.js Locally (Windows)

### Using Chocolatey (Fastest):
```powershell
# Run PowerShell as Administrator
choco install nodejs

# Verify installation
node -v
npm -v
```

### Using winget (Windows Package Manager):
```powershell
winget install OpenJS.NodeJS

# Verify installation
node -v
npm -v
```

### Manual Installation:
Download from https://nodejs.org/en/ (LTS version recommended)

## After Node.js Installation:

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── api/chat/route.ts          ← Grok AI API endpoint
│   ├── student/
│   │   ├── chat/                  ← Main chat interface
│   │   ├── sessions/              ← Book tutoring sessions
│   │   └── progress/              ← Learning analytics
│   └── page.tsx                   ← Home page
├── components/
│   ├── Header.tsx                 ← Navigation
│   ├── Sidebar.tsx                ← Chat history
│   ├── MurphChat.tsx              ← Chat interface
│   └── ChatMessage.tsx            ← Message display
├── .env.local                     ← API keys (DO NOT COMMIT)
├── Dockerfile                     ← For Docker deployment
└── docker-compose.yml             ← Docker configuration
```

## Environment Variables

Create `.env.local` with:
```
GROK_API_KEY=your_rotated_key_here
GROK_BASE_URL=https://api.x.ai/v1
GROK_MODEL=grok-2-latest
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Development

- **Chat**: Visit http://localhost:3000/student/chat
- **Sessions**: Visit http://localhost:3000/student/sessions
- **Progress**: Visit http://localhost:3000/student/progress
- **Home**: Visit http://localhost:3000

## Troubleshooting

### npm install fails
- Ensure Node.js is properly installed
- Try: `npm cache clean --force` then `npm install` again

### Port 3000 already in use
- Kill process: `lsof -ti:3000 | xargs kill -9` (Mac/Linux)
- Or change port: `npm run dev -- -p 3001`

### API key not working
- Verify key in `.env.local`
- Check key hasn't been rotated
- Ensure `GROK_BASE_URL` is correct

## Deployment to Vercel

```bash
# Login to Vercel
npm install -g vercel
vercel login

# Set environment variables
vercel env add GROK_API_KEY
vercel env add GROK_BASE_URL
vercel env add GROK_MODEL

# Deploy
vercel --prod
```

## Backend Integration

The frontend is ready to connect to your Flask backend at [backend/main.py](../backend/main.py).

Current backend endpoints to integrate:
- `POST /api/chat` - Chat messages
- `POST /api/sessions` - Book sessions
- `GET /api/progress` - Learning progress

## Support

For issues, check:
1. .env.local has correct API keys
2. Docker/Node.js is properly installed
3. Port 3000 is available
4. API rate limits with Grok aren't exceeded
