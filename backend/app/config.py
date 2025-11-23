from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    SECRET_KEY: str
    ENCRYPTION_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./app.db"
    GOOGLE_CLIENT_ID: str
    GOOGLE_SECRET_KEY: str

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
