from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, notes, notion, feedback

app = FastAPI(title="Synapse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(notes.router)
app.include_router(notion.router)
app.include_router(feedback.router)
