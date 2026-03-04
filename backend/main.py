import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
import openai
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.getenv("OPENAI_API_KEY")

class VideoRequest(BaseModel):
    url: str

def extract_video_id(url: str):
    video_id_match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
    if video_id_match:
        return video_id_match.group(1)
    return None

@app.post("/generate-notes")
async def generate_notes(request: VideoRequest):
    video_id = extract_video_id(request.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        # Get transcript
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        formatter = TextFormatter()
        transcript_text = formatter.format_transcript(transcript_list)
        
        # Limit transcript length for LLM (simplified chunking for MVP)
        transcript_text = transcript_text[:12000] 

        # Call OpenAI
        prompt = f"""
        You are an expert technical note-taker. Transform the following YouTube video transcript into structured, well-formatted study notes.
        The notes must be in JSON format with a list of "blocks".
        Each block should have a "type" (heading, paragraph, bullet, code, timestamp) and corresponding content.
        
        Transcript:
        {transcript_text}
        
        JSON Structure Example:
        {{
          "metadata": {{ "title": "...", "duration": "..." }},
          "blocks": [
            {{ "type": "heading", "content": "Topic Title" }},
            {{ "type": "paragraph", "content": "Detailed explanation..." }},
            {{ "type": "bullet", "items": ["Key point 1", "Key point 2"] }},
            {{ "type": "code", "language": "python", "content": "print('hello')" }},
            {{ "type": "timestamp", "time": "05:20", "topic": "Section name" }}
          ]
        }}
        """

        # Call OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-1106",
            messages=[
                {"role": "system", "content": "You are a professional educational assistant that generates high-quality structured notes."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )

        try:
            # OpenAI returns a JSON string; parse it safely
            parsed = json.loads(response.choices[0].message.content)
        except Exception as e:
            # If parsing fails, return the raw string for debugging
            parsed = {"raw": response.choices[0].message.content}

        return parsed

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
