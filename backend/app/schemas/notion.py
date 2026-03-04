from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class NotionSaveRequest(BaseModel):
    url: str  # original YouTube URL
    metadata: Dict[str, Any]  # title, channel, duration
    blocks: List[Dict[str, Any]]  # the generated blocks


class NotionSaveResponse(BaseModel):
    success: bool
    notion_page_url: Optional[str] = None
    error: Optional[str] = None

