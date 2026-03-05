from fastapi import APIRouter

from app.schemas.notes import VideoRequest
from app.services.groq import generate_notes
from app.services.youtube import extract_video_id, get_video_metadata, get_transcript

router = APIRouter()


@router.post("/generate-notes")
async def generate_notes_endpoint(request: VideoRequest):
    """
    Main pipeline:
    1. Parse and validate YouTube URL
    2. Extract video ID
    3. Fetch metadata (title, channel, duration) via yt-dlp
    4. Fetch and clean transcript via YouTube Transcript API
    5. Send to Groq for structured note generation (with chunking for long videos)
    6. Return the parsed blocks to the frontend
    """

    # Step 1: Extract video ID (raises 422 if invalid URL)
    video_id = extract_video_id(request.url)

    # Step 2: Fetch metadata (never blocks — returns fallbacks on failure)
    metadata = get_video_metadata(video_id)

    # Step 3: Fetch transcript (raises 404 if unavailable)
    transcript = get_transcript(video_id)

    # Step 4: Generate notes with Groq (auto-chunks long transcripts)
    result = generate_notes(
        title=metadata["title"],
        channel=metadata["channel"],
        duration=metadata["duration"],
        transcript=transcript,
        output_language=request.output_language,
    )

    # Step 5: Ensure metadata in response matches what we fetched
    # (AI may hallucinate different metadata — override with real values)
    result["metadata"] = metadata

    return result

