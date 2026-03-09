from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    groq_api_key: str = ""  # Required at runtime — set via GROQ_API_KEY env var
    database_url: str = ""  # PostgreSQL URL for persistent feedback storage
    notion_api_key: str = ""  # Optional — only needed if using Notion sync
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"
    proxy_url: str = ""  # Optional HTTPS proxy for YouTube requests (e.g. socks5://...)
    port: int = 8000  # PORT env var on Render
    assemblyai_api_key: str = ""  # Optional — fallback STT when YouTube captions are unavailable


settings = Settings()

