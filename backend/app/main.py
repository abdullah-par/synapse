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
# Clean, explicit origins for production.
# Wildcards with credentials are often blocked by browsers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://www.usesynaps.tech",
        "https://usesynaps.tech",
        "https://www.usesynapse.tech",
        "https://usesynapse.tech",
        "https://synapse-kappa-opal.vercel.app",
        "https://synapse-production-9c44.up.railway.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.usesynaps\.tech|https://.*\.usesynapse\.tech",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, tags=["Health"])
app.include_router(notes.router, tags=["Notes"])
app.include_router(notion.router, tags=["Notion"])
app.include_router(feedback.router, tags=["Feedback"])



if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)

