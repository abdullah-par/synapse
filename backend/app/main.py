from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.routes import health, notes, notion, feedback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("synapse")

app = FastAPI(
    title="Synapse API",
    version="1.0.0",
)

# CORS configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://usesynaps.tech",
    "https://www.usesynaps.tech",
    "synapse-kappa-opal.vercel.app", # Vercel domain fallback
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router)
app.include_router(notes.router)
app.include_router(notion.router)
app.include_router(feedback.router)

@app.on_event("startup")
async def startup_event():
    logger.info("Synapse API is starting up...")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
