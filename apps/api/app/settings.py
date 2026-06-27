import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "ElevateMindStudio")
    app_env: str = os.getenv("APP_ENV", "development")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    anthropic_model: str = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
    cors_origin: str = os.getenv("CORS_ORIGIN", os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"))


settings = Settings()
