from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import health, notes, notion, feedback

app = FastAPI(
    title="Synapse API",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url=None,
)

# ── CORS ──────────────────────────────────────────────────────────────────
# Force-allow all origins without credentials. This is the most compatible 
# CORS configuration for cloud environments where headers might be stripped.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicit OPTIONS handler as a safety net for prelight requests
@app.options("/{path:path}")
async def preflight_handler():
    return {}




# Register routers
app.include_router(health.router, tags=["Health"])
app.include_router(notes.router, tags=["Notes"])
app.include_router(notion.router, tags=["Notion"])
app.include_router(feedback.router, tags=["Feedback"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)

