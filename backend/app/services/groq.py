import json
import re
from typing import Dict, List

from groq import Groq
from fastapi import HTTPException
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings
from app.services.youtube import chunk_transcript


client = Groq(api_key=settings.groq_api_key)

# Groq model — llama-3.3-70b-versatile has large context and strong JSON output
MODEL = "llama-3.3-70b-versatile"

# ── System prompts ────────────────────────────────────────────────────────

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

CHUNK_SYSTEM_PROMPT = """You are an expert educational content synthesizer.
You are processing ONE SECTION of a longer video transcript.
You ALWAYS respond with valid JSON only — no markdown, no explanation, no code fences.

Rules:
- Remove ALL verbal filler: um, uh, you know, like, basically, literally, right, okay
- Rewrite conversational language into clear, concise prose
- Preserve all technical accuracy — never simplify technical terms
- Detect and preserve any code that appears in the transcript
"""

MERGE_SYSTEM_PROMPT = """You are an expert educational content editor.
You merge and clean notes that were generated from multiple sections of a long video.
You ALWAYS respond with valid JSON only — no markdown, no explanation, no code fences.

Rules:
- Remove duplicate or near-duplicate content
- Ensure a smooth logical flow from section to section
- Add an overview heading at the top
- Add a key takeaways bullet block at the end
"""


# ── Helpers ───────────────────────────────────────────────────────────────

def _build_language_instruction(output_language: str) -> str:
    if output_language.lower() == "english":
        return ""
    return f"""

CRITICAL LANGUAGE INSTRUCTION:
Generate ALL notes in {output_language.upper()} language.
Every heading, paragraph, bullet point, and timestamp topic must be written in {output_language}.
Only code blocks should remain in their original programming language.
The metadata title and channel should stay as-is (original language).
"""


def _build_full_prompt(
    title: str, channel: str, duration: str,
    transcript: str, output_language: str = "english",
) -> str:
    return f"""
Video Title: {title}
Channel: {channel}
Duration: {duration}

Transcript:
{transcript}

Transform this transcript into structured study notes using this EXACT JSON schema.
Do not add any fields. Do not remove any fields. Match the schema exactly.
{_build_language_instruction(output_language)}
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


def _build_chunk_prompt(
    title: str, channel: str, duration: str,
    chunk: str, chunk_index: int, total_chunks: int,
    output_language: str,
) -> str:
    return f"""
This is Part {chunk_index + 1} of {total_chunks} of a longer video transcript.
Video Title: {title}
Channel: {channel}
Duration: {duration}

Transcript section:
{chunk}

Generate structured notes for THIS SECTION ONLY using this JSON schema:
{_build_language_instruction(output_language)}
{{
  "blocks": [
    {{ "type": "heading", "content": "Section Title" }},
    {{ "type": "paragraph", "content": "Explanation..." }},
    {{ "type": "bullet", "items": ["Point one", "Point two"] }},
    {{ "type": "code", "language": "python", "content": "code here" }},
    {{ "type": "timestamp", "time": "MM:SS", "topic": "Topic" }}
  ]
}}

Important:
- Do NOT add an overview or conclusion — just note the content from this section
- Use 4-12 blocks for this section
- Include timestamps relative to this part of the video
- If no code appears, use zero code blocks
"""


def _build_merge_prompt(
    title: str, channel: str, duration: str,
    all_blocks: List[Dict], output_language: str,
) -> str:
    # Limit serialized blocks to avoid context overflow
    blocks_json = json.dumps(all_blocks, ensure_ascii=False)
    if len(blocks_json) > 30000:
        blocks_json = blocks_json[:30000] + "..."

    return f"""
Video: {title} by {channel} ({duration})

Here are all the note blocks collected from processing the full transcript in sections:
{blocks_json}

Create a final clean JSON response:
{_build_language_instruction(output_language)}
{{
  "metadata": {{
    "title": "{title}",
    "channel": "{channel}",
    "duration": "{duration}"
  }},
  "blocks": [ ... ]
}}

Rules:
- Add an overview heading + paragraph at the very top
- Keep all unique content blocks in chronological order
- Remove duplicate or near-duplicate headings/paragraphs
- Add a "key takeaways" bullet block at the very end
- Minimum 15 blocks, maximum 40 blocks
- Preserve ALL code blocks exactly as they are
"""


# ── Groq API call ─────────────────────────────────────────────────────────

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=5))
def _call_groq(system_prompt: str, user_prompt: str) -> Dict:
    """Single Groq API call — extracted for reuse across single/chunked flows."""
    try:
        chat_completion = client.chat.completions.create(
            model=MODEL,
            max_tokens=4096,
            temperature=0.3,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        raw_text = chat_completion.choices[0].message.content.strip()

        # Strip any accidental markdown code fences
        raw_text = re.sub(r"^```json\s*", "", raw_text)
        raw_text = re.sub(r"^```\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)

        return json.loads(raw_text)

    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ai_parse_error",
                "message": "AI response could not be parsed. Please try again.",
                "detail": str(exc),
            },
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ai_error",
                "message": "Note generation failed. Please try again.",
                "detail": str(exc),
            },
        ) from exc


# ── Public API ────────────────────────────────────────────────────────────

def generate_notes(
    title: str,
    channel: str,
    duration: str,
    transcript: str,
    output_language: str = "english",
) -> Dict:
    """
    Main entry point for note generation via Groq.
    Short transcripts (<= 35k chars) → single API call.
    Long transcripts → chunk, process each, then merge.
    """
    if len(transcript) <= 35000:
        return _single_generation(title, channel, duration, transcript, output_language)
    return _chunked_generation(title, channel, duration, transcript, output_language)


def _single_generation(
    title: str, channel: str, duration: str,
    transcript: str, output_language: str,
) -> Dict:
    """Process a short transcript in one API call."""
    parsed = _call_groq(
        SYSTEM_PROMPT,
        _build_full_prompt(title, channel, duration, transcript, output_language),
    )

    if "blocks" not in parsed:
        raise ValueError("AI response missing 'blocks' field")
    if "metadata" not in parsed:
        raise ValueError("AI response missing 'metadata' field")

    return parsed


def _chunked_generation(
    title: str, channel: str, duration: str,
    transcript: str, output_language: str,
) -> Dict:
    """
    For long videos:
    1. Split transcript into overlapping chunks
    2. Process each chunk independently via Groq
    3. Merge all blocks into a single coherent response
    """
    chunks = chunk_transcript(transcript)
    all_blocks: List[Dict] = []

    for i, chunk in enumerate(chunks):
        prompt = _build_chunk_prompt(
            title, channel, duration,
            chunk, i, len(chunks),
            output_language,
        )
        result = _call_groq(CHUNK_SYSTEM_PROMPT, prompt)

        if result and "blocks" in result:
            all_blocks.extend(result["blocks"])

    if not all_blocks:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "ai_error",
                "message": "Could not generate notes from any transcript chunk.",
            },
        )

    # Merge pass — deduplicate, add overview + takeaways
    merge_prompt = _build_merge_prompt(
        title, channel, duration, all_blocks, output_language,
    )
    merged = _call_groq(MERGE_SYSTEM_PROMPT, merge_prompt)

    if "blocks" not in merged:
        # Fallback: return unmerged blocks with metadata
        merged = {
            "metadata": {"title": title, "channel": channel, "duration": duration},
            "blocks": all_blocks,
        }
    if "metadata" not in merged:
        merged["metadata"] = {"title": title, "channel": channel, "duration": duration}

    return merged
