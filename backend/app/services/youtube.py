from __future__ import annotations

import json
import re
from typing import Dict, Optional

import yt_dlp
from fastapi import HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)

from app.config import settings

# Build proxy dict for yt-dlp / httpx if configured
_PROXY_URL = settings.proxy_url.strip() if settings.proxy_url else ""
_YDL_PROXY = {"proxy": _PROXY_URL} if _PROXY_URL else {}
_HTTPX_PROXY = _PROXY_URL or None


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
            **_YDL_PROXY,
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


def _get_transcript_via_ytdlp(video_id: str) -> Optional[str]:
    """
    Fallback: extract subtitles using yt-dlp when youtube-transcript-api
    is blocked by YouTube's IP restrictions.

    Strategy 1: Download the json3 subtitle file directly via the URL
    returned in extract_info (avoids yt-dlp's own download logic which
    can also get 429'd).
    Strategy 2: Parse the subtitle URL from extract_info metadata.
    Returns raw subtitle text or None on failure.
    """
    import httpx

    try:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "writesubtitles": False,
            "writeautomaticsub": False,
            **_YDL_PROXY,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://www.youtube.com/watch?v={video_id}", download=False
            )

        # Look for English auto-captions or manual subs
        for subs_dict in [info.get("automatic_captions", {}), info.get("subtitles", {})]:
            for lang_key in ["en", "en-US", "en-GB", "en-orig", "en-IN", "hi", "hi-IN"]:
                formats = subs_dict.get(lang_key, [])
                # Prefer json3, then srv1, then vtt
                for preferred_ext in ["json3", "srv1", "vtt"]:
                    for fmt in formats:
                        if fmt.get("ext") == preferred_ext and fmt.get("url"):
                            text = _fetch_and_parse_subtitle(fmt["url"], preferred_ext)
                            if text:
                                return text
        return None
    except Exception:
        return None


def _fetch_and_parse_subtitle(url: str, ext: str) -> Optional[str]:
    """Download a subtitle URL and parse it into plain text."""
    import httpx

    try:
        resp = httpx.get(url, timeout=30, follow_redirects=True, proxy=_HTTPX_PROXY)
        resp.raise_for_status()
        content = resp.text

        if ext == "json3":
            data = json.loads(content)
            segments = []
            for event in data.get("events", []):
                for seg in event.get("segs", []):
                    text = seg.get("utf8", "")
                    if text and text.strip():
                        segments.append(text.strip())
            return " ".join(segments) if segments else None

        elif ext == "srv1":
            # srv1 is XML: <text start="..." dur="...">content</text>
            texts = re.findall(r"<text[^>]*>(.*?)</text>", content, re.DOTALL)
            # Unescape HTML entities
            from html import unescape
            cleaned = [unescape(t).strip() for t in texts if t.strip()]
            return " ".join(cleaned) if cleaned else None

        elif ext == "vtt":
            # Strip WebVTT headers and timestamp lines
            lines = []
            for line in content.splitlines():
                line = line.strip()
                if not line or line.startswith("WEBVTT") or line.startswith("Kind:") or line.startswith("Language:"):
                    continue
                if re.match(r"^\d{2}:\d{2}", line) or line.startswith("NOTE"):
                    continue
                if re.match(r"^\d+$", line):
                    continue
                lines.append(line)
            return " ".join(lines) if lines else None

        return None
    except Exception:
        return None


def get_transcript(video_id: str) -> str:
    """
    Fetch and clean transcript text.

    Cleaning steps:
    - Join all transcript segments into a single string
    - Remove [Music], [Applause], [Laughter] annotation tags
    - Normalize whitespace
    - Truncate to 40,000 characters (safe Claude context limit)
    """
    raw_text = None
    _ytt_error = None

    try:
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(video_id)
        raw_text = " ".join(snippet.text for snippet in transcript.snippets)
    except TranscriptsDisabled:
        _ytt_error = ("transcript_disabled", "Captions are disabled for this video. Try a video with auto-generated subtitles.")
    except NoTranscriptFound:
        _ytt_error = ("transcript_unavailable", "No English transcript found for this video.")
    except VideoUnavailable:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "video_unavailable",
                "message": "This video is unavailable or private.",
            },
        )
    except Exception:
        # Primary method failed (likely IP block) — will try yt-dlp next
        _ytt_error = ("transcript_error", "Primary transcript fetch failed.")

    # If youtube-transcript-api failed or returned nothing, try yt-dlp subtitles
    if not raw_text:
        raw_text = _get_transcript_via_ytdlp(video_id)

    if not raw_text:
        # Both methods failed — surface the original error or a generic one
        err_code, err_msg = _ytt_error or ("transcript_error", "Could not fetch transcript.")
        raise HTTPException(
            status_code=404 if err_code != "transcript_error" else 500,
            detail={
                "error": err_code,
                "message": err_msg + " (yt-dlp fallback also failed)",
            },
        )

    # Clean annotation tags like [Music], [Applause]
    clean_text = re.sub(r"\[.*?]", "", raw_text)

    # Normalize whitespace
    clean_text = " ".join(clean_text.split())

    # Truncate for Claude context window safety
    return clean_text[:40000]

