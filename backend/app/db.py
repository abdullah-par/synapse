from sqlmodel import create_engine, Session, SQLModel, Field
from typing import Generator, Optional
from datetime import datetime, timezone
import uuid
from app.config import settings

# Database setup
# Using pool_pre_ping=True to handle disconnected connections on cloud providers
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=(settings.environment == "development")
) if settings.database_url else None

def get_session() -> Generator[Optional[Session], None, None]:
    if not engine:
        yield None
        return
    with Session(engine) as session:
        yield session

def init_db():
    if engine:
        SQLModel.metadata.create_all(engine)

# Database Table
class Feedback(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(default="Anonymous")
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    class Config:
        table_name = "feedback"
