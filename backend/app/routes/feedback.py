import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException

from app.schemas.feedback import FeedbackSubmitRequest, FeedbackItem, FeedbackListResponse

router = APIRouter()

# ---------------------------------------------------------------------------
# Storage: always persist to a file so data survives server restarts.
# On Render/Railway the app directory IS writable during a deploy's lifetime.
# Data only resets on a *new* deploy (ephemeral FS) — acceptable for now.
# Set FEEDBACK_DIR env var to point to a persistent volume if available.
# ---------------------------------------------------------------------------
_FEEDBACK_DIR = os.environ.get("FEEDBACK_DIR", "")
if _FEEDBACK_DIR:
    FEEDBACK_FILE = Path(_FEEDBACK_DIR) / "feedback.json"
else:
    # Use the backend/ project directory (writable on all platforms)
    FEEDBACK_FILE = Path(__file__).resolve().parent.parent.parent / "feedback.json"


def _read_all() -> List[dict]:
    """Read feedback from disk every time — single source of truth."""
    if not FEEDBACK_FILE.exists():
        return []
    try:
        data = json.loads(FEEDBACK_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _write_all(items: List[dict]) -> None:
    """Write feedback list to disk."""
    try:
        FEEDBACK_FILE.parent.mkdir(parents=True, exist_ok=True)
        FEEDBACK_FILE.write_text(
            json.dumps(items, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
    except OSError:
        pass  # read-only FS edge case — feedback is still returned from memory


@router.get("/feedback", response_model=FeedbackListResponse)
async def get_feedback():
    """Return all feedback, newest first."""
    items = _read_all()
    return FeedbackListResponse(
        feedback=[FeedbackItem(**item) for item in reversed(items)]
    )


@router.post("/feedback", response_model=FeedbackItem)
async def submit_feedback(request: FeedbackSubmitRequest):
    """Submit a new piece of feedback."""
    if not request.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    item = {
        "id": str(uuid.uuid4()),
        "name": request.name.strip() or "Anonymous",
        "message": request.message.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    items = _read_all()
    items.append(item)
    _write_all(items)

    return FeedbackItem(**item)
