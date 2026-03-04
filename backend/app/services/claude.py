import json
import re
from typing import Dict

from groq import Groq
from fastapi import HTTPException
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings


client = Groq(api_key=settings.groq_api_key)

# Groq model — llama-3.3-70b-versatile has large context and strong JSON output
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are an expert educational content synthesizer. 
Your job is to transform raw YouTube video transcripts into structured, 
professional study notes.

You ALWAYS respond with valid JSON only. 
No markdown. No explanation. No code fences. Just the raw JSON object.

Rules for your output:
- Remove ALL verbal filler: um, uh, you know, like, basically, literally, right, okay
- Rewrite conversational language into clear, concise prose
- Preserve all technical accuracy — never simplify technical terms
- Detect and preserve any code that appears in the transcript
- Estimate timestamps based on position in transcript (beginning = ~0:00, middle = ~50% of duration, etc.)
"""


def build_prompt(title: str, channel: str, duration: str, transcript: str) -> str:
    return f"""
Video Title: {title}
Channel: {channel}
Duration: {duration}

Transcript:
{transcript}

Transform this transcript into structured study notes using this EXACT JSON schema.
Do not add any fields. Do not remove any fields. Match the schema exactly.

{{
  "metadata": {{
    "title": "exact video title",
    "channel": "channel name",
    "duration": "duration as given"
  }},
  "blocks": [
    // Use these block types in natural order as they appear in the content:
    
    // HEADING — for major topic sections (use 4-8 headings total)
    {{ "type": "heading", "content": "Section Title" }},
    
    // PARAGRAPH — for explanations and concepts (2-4 sentences each)
    {{ "type": "paragraph", "content": "Detailed explanation of the concept..." }},
    
    // BULLET — for lists, steps, key points (3-6 items per bullet block)
    {{ "type": "bullet", "items": ["Point one", "Point two", "Point three"] }},
    
    // CODE — only when actual code appears in the transcript
    {{ "type": "code", "language": "python", "content": "def hello():\\n    print('hello')" }},
    
    // TIMESTAMP — for key moments (include 4-8 timestamps)
    {{ "type": "timestamp", "time": "02:15", "topic": "Topic being discussed at this time" }}
  ]
}}

Important:
- Start with a "heading" block for an Overview section
- End with a "bullet" block summarizing key takeaways
- Include timestamps distributed throughout (not all at the end)
- If no code appears in the transcript, include zero code blocks
- Minimum 12 blocks total, maximum 30 blocks
"""


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=5),
)
def generate_notes_with_claude(
    title: str,
    channel: str,
    duration: str,
    transcript: str,
) -> Dict:
    """
    Call Groq API and return parsed notes dict.
    Retries up to 3 times on failure with exponential backoff.
    """
    try:
        chat_completion = client.chat.completions.create(
            model=MODEL,
            max_tokens=4096,
            temperature=0.3,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": build_prompt(title, channel, duration, transcript),
                },
            ],
        )

        raw_text = chat_completion.choices[0].message.content.strip()

        # Strip any accidental markdown code fences the model might add
        raw_text = re.sub(r"^```json\s*", "", raw_text)
        raw_text = re.sub(r"^```\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)

        parsed = json.loads(raw_text)

        # Basic structure validation
        if "blocks" not in parsed:
            raise ValueError("AI response missing 'blocks' field")
        if "metadata" not in parsed:
            raise ValueError("AI response missing 'metadata' field")

        return parsed

    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ai_parse_error",
                "message": "AI response could not be parsed. Please try again.",
                "detail": str(exc),
            },
        ) from exc
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ai_error",
                "message": "Note generation failed. Please try again.",
                "detail": str(exc),
            },
        ) from exc

