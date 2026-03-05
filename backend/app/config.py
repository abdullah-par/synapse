from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
    database_url: str = ""  # PostgreSQL URL for persistent feedback storage
    notion_api_key: str = ""  # Optional — only needed if using Notion sync
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"
    proxy_url: str = ""  # Optional HTTPS proxy for YouTube requests (e.g. socks5://...)
    port: int = 8000  # PORT env var on Render

    class Config:
        env_file = ".env"


settings = Settings()

