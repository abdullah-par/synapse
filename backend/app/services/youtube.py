import re
from typing import Dict

import yt_dlp
from fastapi import HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)


def extract_video_id(url: str) -> str:
    """
    Extract a YouTube video ID from common URL formats.

    Supports:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/shorts/VIDEO_ID
    - https://youtube.com/watch?v=VIDEO_ID&t=30s
    """
    patterns = [
        r"(?:v=)([0-9A-Za-z_-]{11})",
        r"(?:youtu\.be/)([0-9A-Za-z_-]{11})",
        r"(?:shorts/)([0-9A-Za-z_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    raise HTTPException(
        status_code=422,
        detail={
            "error": "invalid_url",
            "message": "Please enter a valid YouTube URL.",
        },
    )


def format_duration(seconds: int) -> str:
    """Convert seconds to HH:MM:SS or MM:SS string."""
    if seconds >= 3600:
        h = seconds // 3600
        m = (seconds % 3600) // 60
        s = seconds % 60
        return f"{h}:{m:02d}:{s:02d}"
    m = seconds // 60
    s = seconds % 60
    return f"{m}:{s:02d}"


def get_video_metadata(video_id: str) -> Dict[str, str]:
    """
    Fetch title, channel, and duration using yt-dlp.
    Returns safe fallbacks if metadata is unavailable.
    """
    try:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "extract_flat": False,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://www.youtube.com/watch?v={video_id}",
                download=False,
            )
            duration_seconds = int(info.get("duration", 0) or 0)
            return {
                "title": info.get("title", "YouTube Video") or "YouTube Video",
                "channel": info.get("uploader", "Unknown Channel") or "Unknown Channel",
                "duration": format_duration(duration_seconds) if duration_seconds else "—",
            }
    except Exception:
        # Return safe fallbacks — do not block note generation
        return {
            "title": "YouTube Video",
            "channel": "Unknown Channel",
            "duration": "—",
        }


def get_transcript(video_id: str) -> str:
    """
    Fetch and clean transcript text.

    Cleaning steps:
    - Join all transcript segments into a single string
    - Remove [Music], [Applause], [Laughter] annotation tags
    - Normalize whitespace
    - Truncate to 40,000 characters (safe Claude context limit)
    """
    try:
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(video_id)
        raw_text = " ".join(snippet.text for snippet in transcript.snippets)
    except TranscriptsDisabled:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "transcript_disabled",
                "message": "Captions are disabled for this video. Try a video with auto-generated subtitles.",
            },
        )
    except NoTranscriptFound:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "transcript_unavailable",
                "message": "No transcript found for this video.",
            },
        )
    except VideoUnavailable:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "video_unavailable",
                "message": "This video is unavailable or private.",
            },
        )
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(
            status_code=500,
            detail={
                "error": "transcript_error",
                "message": f"Failed to fetch transcript: {exc}",
            },
        ) from exc

    # Clean annotation tags like [Music], [Applause]
    clean_text = re.sub(r"\[.*?]", "", raw_text)

    # Normalize whitespace
    clean_text = " ".join(clean_text.split())

    # Truncate for Claude context window safety
    return clean_text[:40000]

