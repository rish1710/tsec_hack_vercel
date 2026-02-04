# Murph Backend

FastAPI-based conversational AI backend for the Murph learning platform.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
```

2. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend:
```bash
python main.py
```

The backend will start on `http://localhost:8000`

## API Endpoints

- `GET /health` - Health check
- `POST /api/chat` - Main chat endpoint
- `POST /api/recommendations` - Get session recommendations
- `GET /api/sessions` - List all available sessions
