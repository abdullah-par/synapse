from __future__ import annotations

from typing import Optional
from datetime import datetime

from pydantic import BaseModel


class FeedbackSubmitRequest(BaseModel):
    name: str = "Anonymous"
    message: str


class FeedbackItem(BaseModel):
    id: str
    name: str
    message: str
    created_at: str  # ISO 8601


class FeedbackListResponse(BaseModel):
    feedback: list[FeedbackItem]
