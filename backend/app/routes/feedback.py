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
# Storage: prefer /tmp on cloud platforms (ephemeral but writable).
# On local dev, use the project-level feedback.json.
# ---------------------------------------------------------------------------
_FEEDBACK_DIR = os.environ.get("FEEDBACK_DIR", "")
if _FEEDBACK_DIR:
    FEEDBACK_FILE = Path(_FEEDBACK_DIR) / "feedback.json"
elif os.environ.get("RENDER", "") or os.environ.get("RAILWAY_ENVIRONMENT", ""):
    # Cloud platforms: /tmp is always writable
    FEEDBACK_FILE = Path("/tmp") / "feedback.json"
else:
    FEEDBACK_FILE = Path(__file__).resolve().parent.parent.parent / "feedback.json"

# In-memory cache — survives between requests even if the file vanishes
_feedback_cache: List[dict] = []
_cache_loaded = False


def _load_cache() -> None:
    """Load from disk into memory (once at startup)."""
    global _feedback_cache, _cache_loaded
    if _cache_loaded:
        return
    if FEEDBACK_FILE.exists():
        try:
            _feedback_cache = json.loads(FEEDBACK_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            _feedback_cache = []
    _cache_loaded = True


def _persist() -> None:
    """Best-effort write to disk — silently skip if filesystem is read-only."""
    try:
        FEEDBACK_FILE.parent.mkdir(parents=True, exist_ok=True)
        FEEDBACK_FILE.write_text(
            json.dumps(_feedback_cache, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
    except OSError:
        pass  # read-only FS on some cloud platforms — cache is still in memory


@router.get("/feedback", response_model=FeedbackListResponse)
async def get_feedback():
    """Return all feedback, newest first."""
    _load_cache()
    return FeedbackListResponse(
        feedback=[FeedbackItem(**item) for item in reversed(_feedback_cache)]
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

    _load_cache()
    _feedback_cache.append(item)
    _persist()

    return FeedbackItem(**item)
