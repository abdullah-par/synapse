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


class DefinitionBlock(BaseModel):
    """A new term introduced in the video with its full definition."""
    type: str = "definition"
    term: str
    explanation: str


class QuestionBlock(BaseModel):
    """A self-test review question at the end of the notes."""
    type: str = "question"
    number: int
    text: str


NoteBlock = Union[
    HeadingBlock,
    ParagraphBlock,
    BulletBlock,
    CodeBlock,
    TimestampBlock,
    DefinitionBlock,
    QuestionBlock,
]


class GeneratedNotesResponse(BaseModel):
    metadata: NoteMetadata
    # Use dict for flexible block shapes while still validating metadata
    blocks: List[Dict[str, Any]]
    # "captions" = YouTube captions, "assemblyai" = AssemblyAI audio transcription
    transcript_source: str = "captions"

