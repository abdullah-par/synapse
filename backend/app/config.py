from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
    notion_api_key: str
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()

