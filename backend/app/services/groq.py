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

SYSTEM_PROMPT = """You are an expert study note generator for students.
Your job is to convert a video transcript into complete, detailed study notes.
The student should be able to learn EVERYTHING from your notes without watching the video.

You ALWAYS respond with valid JSON only.
No markdown. No explanation. No code fences. Just the raw JSON object.

Your notes MUST include:
- A brief overview (2-3 sentences) of what the video teaches
- Every concept explained in full, not just named
- All definitions of new terms introduced
- Every example, analogy, and demonstration explained
- All code shown or explained, in proper code blocks
- Step-by-step breakdowns of any processes or tutorials
- Timestamps for every major topic change
- A Key Takeaways section at the end
- 5 review questions a student can use to test themselves

NEVER:
- Skip content because it seems minor or repetitive
- Write vague summaries like 'the speaker explains X'
- Omit examples or analogies from the transcript
"""

CHUNK_SYSTEM_PROMPT = """You are an expert study note generator for students.
You are processing ONE SECTION of a longer video transcript.
You ALWAYS respond with valid JSON only — no markdown, no explanation, no code fences.

For this section you MUST:
- Explain every concept introduced in full detail
- Include every example, analogy, and demonstration
- Capture all code shown or described (in code blocks)
- Define every new term that appears
- NEVER write vague summaries like 'the speaker explains X'
"""

MERGE_SYSTEM_PROMPT = """You are an expert study note editor for students.
You merge notes generated from multiple sections of a long video into a single,
complete set of student-grade study notes.
You ALWAYS respond with valid JSON only — no markdown, no explanation, no code fences.

Rules:
- Remove duplicate or near-duplicate content
- Ensure logical, chronological flow from section to section
- Add a 2-3 sentence overview paragraph at the very top
- Consolidate ALL definitions into a single Definitions section near the end
- Add a Key Takeaways bullet block (5-7 points) near the end
- Add exactly 5 review questions as question blocks at the very end
- Preserve ALL code blocks exactly as they are
- NEVER skip content or write vague summaries
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

Transform this transcript into complete student-grade study notes using this EXACT JSON schema.
Do not add any fields. Do not remove any fields. Match the schema exactly.
{_build_language_instruction(output_language)}
{{
  "metadata": {{
    "title": "exact video title",
    "channel": "channel name",
    "duration": "duration as given"
  }},
  "blocks": [
    // HEADING — for major topic sections
    {{ "type": "heading", "content": "Section Title" }},

    // PARAGRAPH — full explanations (3-5 sentences, not summaries)
    {{ "type": "paragraph", "content": "Detailed explanation of the concept with all nuances..." }},

    // BULLET — steps, key points, comparisons (3-8 items per block)
    {{ "type": "bullet", "items": ["Point one with full detail", "Point two", "Point three"] }},

    // CODE — every snippet shown or described in the video
    {{ "type": "code", "language": "python", "content": "def hello():\\n    print('hello')" }},

    // TIMESTAMP — one per major topic change (include 4-8 total)
    {{ "type": "timestamp", "time": "02:15", "topic": "Topic being discussed at this time" }},

    // DEFINITION — every new term introduced must be defined
    {{ "type": "definition", "term": "API", "explanation": "A set of rules that allows one program to talk to another..." }},

    // QUESTION — exactly 5 self-test questions at the end
    {{ "type": "question", "number": 1, "text": "What is X and why does it matter?" }}
  ]
}}

Required structure (in order):
1. An "overview" paragraph block (2-3 sentences summarising what the video teaches)
2. Topic sections: for each major topic — heading → timestamp → paragraphs → bullets → code → definitions
3. A heading called "Key Takeaways" followed by one bullet block with 5-7 items
4. A heading called "Review Questions" followed by exactly 5 question blocks (numbered 1-5)

Minimum 20 blocks total. Capture EVERY concept, example, analogy, and code snippet.
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

Generate complete student-grade notes for THIS SECTION ONLY using this JSON schema:
{_build_language_instruction(output_language)}
{{
  "blocks": [
    {{ "type": "heading", "content": "Section Title" }},
    {{ "type": "paragraph", "content": "Full explanation — not a summary..." }},
    {{ "type": "bullet", "items": ["Detailed point one", "Detailed point two"] }},
    {{ "type": "code", "language": "python", "content": "code here" }},
    {{ "type": "timestamp", "time": "MM:SS", "topic": "Topic" }},
    {{ "type": "definition", "term": "Term", "explanation": "Full definition..." }}
  ]
}}

Rules:
- Explain every concept in full — do NOT just name it or write 'the speaker explains X'
- Include every example, analogy, and demonstration from the transcript
- Capture every code snippet shown or described
- Add a definition block for every new term introduced
- Do NOT add overview or review questions — those go in the final merge
- Use 8-20 blocks for this section
- Include timestamps relative to this part of the video
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

Create a final clean, student-grade JSON response:
{_build_language_instruction(output_language)}
{{
  "metadata": {{
    "title": "{title}",
    "channel": "{channel}",
    "duration": "{duration}"
  }},
  "blocks": [ ... ]
}}

Required structure (in this order):
1. A paragraph block with a 2-3 sentence overview of what the video teaches
2. All topic sections in chronological order (heading → timestamp → paragraphs → bullets → code)
3. A heading "Definitions" followed by all definition blocks from all sections (deduplicated)
4. A heading "Key Takeaways" followed by one bullet block with 5-7 items
5. A heading "Review Questions" followed by exactly 5 question blocks:
   {{ "type": "question", "number": 1, "text": "What is X and why does it matter?" }}

Additional rules:
- Preserve ALL code blocks exactly
- Remove duplicate or near-duplicate headings/paragraphs
- Total blocks: minimum 20, maximum 50
- NEVER write vague summaries like 'the speaker explains X'
"""



# ── Groq API call ─────────────────────────────────────────────────────────

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=5))
def _call_groq(system_prompt: str, user_prompt: str) -> Dict:
    """Single Groq API call — extracted for reuse across single/chunked flows."""
    try:
        chat_completion = client.chat.completions.create(
            model=MODEL,
            max_tokens=8192,
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
