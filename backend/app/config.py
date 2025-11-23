from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    ENCRYPTION_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./app.db"
    GOOGLE_CLIENT_ID: str
    GOOGLE_SECRET_KEY: str
    SSL_BACKEND_CERT_PATH: Optional[str] = None
    SSL_BACKEND_KEY_PATH: Optional[str] = None
    SSL_KEY_PASSPHRASE: Optional[str] = None
    SSL_FRONTEND_CERT_PATH: Optional[str] = None
    SSL_FRONTEND_KEY_PATH: Optional[str] = None
    SSL_CA_CERT_PATH: Optional[str] = None

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
