FROM python:3.11-slim

# Install ffmpeg for yt-dlp/audio extraction
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

# Railway sets PORT dynamically; uvicorn will use the env var
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
