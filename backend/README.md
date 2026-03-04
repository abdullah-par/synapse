# Synapse Backend

FastAPI backend for the Synapse YouTube → Notion note generation service.

## Stack

- FastAPI
- Anthropic Claude
- YouTube Transcript API
- yt-dlp
- Notion API

## Project Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app, routers, middleware
│   ├── config.py                # All env vars via pydantic-settings
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py            # GET /health
│   │   ├── notes.py             # POST /generate-notes (main endpoint)
│   │   └── notion.py            # POST /notion/save, GET /notion/databases
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── youtube.py           # URL parsing, transcript, metadata
│   │   └── claude.py            # Claude API call + prompt + response parsing
│   │
│   └── schemas/
│       ├── __init__.py
│       ├── notes.py             # Request/response Pydantic models
│       └── notion.py            # Notion request/response models
│
├── .env                         # Local secrets (not committed)
├── .env.example                 # Example environment configuration
├── requirements.txt             # Python dependencies
└── README.md
```

## Environment

Create a `.env` file in `backend/` (or copy from `.env.example`) with:

```env
ANTHROPIC_API_KEY=your_anthropic_key_here
NOTION_API_KEY=your_notion_integration_token_here
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

## Installation

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

## Running the API

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

Key endpoints:

- `GET /health` — health check
- `POST /generate-notes` — generate structured notes from a YouTube URL
- `POST /notion/save` — save generated notes to Notion

