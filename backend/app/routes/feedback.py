import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select

from app.schemas.feedback import FeedbackSubmitRequest, FeedbackItem, FeedbackListResponse
from app.db import engine, Feedback, get_session
from app.config import settings

router = APIRouter()

# ---------------------------------------------------------------------------
# Storage Configuration
# ---------------------------------------------------------------------------
_FEEDBACK_DIR = os.environ.get("FEEDBACK_DIR", "")
if _FEEDBACK_DIR:
    FEEDBACK_FILE = Path(_FEEDBACK_DIR) / "feedback.json"
else:
    FEEDBACK_FILE = Path(__file__).resolve().parent.parent.parent / "feedback.json"

# DB initialization is handled in app startup (main.py)


# ── JSON Fallback Helpers ────────────────────────────────────────────────
def _read_all_json() -> List[dict]:
    """Read feedback from disk every time — fallback for dev."""
    if not FEEDBACK_FILE.exists():
        return []
    try:
        data = json.loads(FEEDBACK_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _write_all_json(items: List[dict]) -> None:
    """Write feedback list to disk — fallback for dev."""
    try:
        FEEDBACK_FILE.parent.mkdir(parents=True, exist_ok=True)
        FEEDBACK_FILE.write_text(
            json.dumps(items, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
    except OSError:
        pass


# ── API Endpoints ───────────────────────────────────────────────────────
@router.get("/feedback", response_model=FeedbackListResponse)
async def get_feedback(session: Session = Depends(get_session)):
    """Return all feedback, newest first."""
    # Use Database IF configured
    if engine and session:
        try:
            statement = select(Feedback).order_by(Feedback.created_at.desc())
            results = session.exec(statement).all()
            return FeedbackListResponse(
                feedback=[FeedbackItem(**item.model_dump()) for item in results]
            )
        except Exception:
            # If DB fails, fallback to JSON
            pass

    # Default to JSON storage
    items = _read_all_json()
    return FeedbackListResponse(
        feedback=[FeedbackItem(**item) for item in reversed(items)]
    )


@router.post("/feedback", response_model=FeedbackItem)
async def submit_feedback(request: FeedbackSubmitRequest, session: Session = Depends(get_session)):
    """Submit a new piece of feedback."""
    if not request.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    item_data = {
        "id": str(uuid.uuid4()),
        "name": request.name.strip() or "Anonymous",
        "message": request.message.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Use Database IF configured
    if engine and session:
        try:
            db_item = Feedback(**item_data)
            session.add(db_item)
            session.commit()
            session.refresh(db_item)
            return FeedbackItem(**db_item.model_dump())
        except Exception:
            # If DB fails, fallback to JSON
            pass

    # Default to JSON storage
    items = _read_all_json()
    items.append(item_data)
    _write_all_json(items)

    return FeedbackItem(**item_data)
