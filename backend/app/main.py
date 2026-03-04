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

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://synapse-33byajnx2-abdullah-pars-projects.vercel.app",
        "https://synapse-kappa-opal.vercel.app",
        "https://usesynapse.tech",
        settings.frontend_url,
    ],
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

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

