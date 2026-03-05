from __future__ import annotations

from typing import Union, List, Optional, Dict, Any

from pydantic import BaseModel


class VideoRequest(BaseModel):
    url: str
    output_language: str = "english"


class NoteMetadata(BaseModel):
    title: str
    channel: str
    duration: str  # formatted as "14:32" or "1:02:45"


class HeadingBlock(BaseModel):
    type: str = "heading"
    content: str


class ParagraphBlock(BaseModel):
    type: str = "paragraph"
    content: str


class BulletBlock(BaseModel):
    type: str = "bullet"
    items: List[str]


class CodeBlock(BaseModel):
    type: str = "code"
    language: Optional[str] = None
    content: str


class TimestampBlock(BaseModel):
    type: str = "timestamp"
    time: str  # "02:15"
    topic: str


NoteBlock = Union[HeadingBlock, ParagraphBlock, BulletBlock, CodeBlock, TimestampBlock]


class GeneratedNotesResponse(BaseModel):
    metadata: NoteMetadata
    # Use dict for flexible block shapes while still validating metadata
    blocks: List[Dict[str, Any]]

