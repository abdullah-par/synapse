import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException

from app.schemas.feedback import FeedbackSubmitRequest, FeedbackItem, FeedbackListResponse

router = APIRouter()

# Simple file-based storage — works for single-server deployments
FEEDBACK_FILE = Path(__file__).resolve().parent.parent.parent / "feedback.json"


def _read_feedback() -> List[dict]:
    if not FEEDBACK_FILE.exists():
        return []
    try:
        return json.loads(FEEDBACK_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def _write_feedback(items: List[dict]) -> None:
    FEEDBACK_FILE.write_text(
        json.dumps(items, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


@router.get("/feedback", response_model=FeedbackListResponse)
async def get_feedback():
    """Return all feedback, newest first."""
    items = _read_feedback()
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

    items = _read_feedback()
    items.append(item)
    _write_feedback(items)

    return FeedbackItem(**item)
