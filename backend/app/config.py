import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "Life Memory AI"
    APP_ENV: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    SECRET_KEY: str = "life-memory-ai-super-secret-key-for-local-development-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Database: Async SQLite default with easy PostgreSQL pgvector connection
    DATABASE_URL: str = "sqlite+aiosqlite:///./lifememory.db"

    # AI Config
    AI_PROVIDER: str = "local" # "openai", "gemini", "local"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # Memory Engine
    MEMORY_CONFIDENCE_THRESHOLD: float = 0.75
    MEMORY_AUTO_EXTRACT: bool = True
    MAX_RELEVANT_MEMORIES: int = 5

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
