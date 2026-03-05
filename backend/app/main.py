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
# Fixed origins we always trust
_origins = [
    "http://localhost:3000",
    "https://synapse-kappa-opal.vercel.app",
    "https://www.usesynapse.tech",
    "https://usesynapse.tech"
]
# Add whatever the deploy platform sets as FRONTEND_URL
if settings.frontend_url and settings.frontend_url not in _origins:
    _origins.append(settings.frontend_url)

# Filter out empty strings
_origins = [o for o in _origins if o]


def _allow_vercel_previews(origin: str) -> bool:
    """Allow any *.vercel.app preview deploy automatically."""
    return origin.endswith(".vercel.app")


app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # covers all Vercel preview deploys
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Register routers
app.include_router(health.router, tags=["Health"])
app.include_router(notes.router, tags=["Notes"])
app.include_router(notion.router, tags=["Notion"])
app.include_router(feedback.router, tags=["Feedback"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)

