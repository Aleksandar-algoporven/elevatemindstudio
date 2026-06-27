import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "ElevateMindStudio")
    app_env: str = os.getenv("APP_ENV", "development")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    anthropic_model: str = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
    cors_origin: str = os.getenv("CORS_ORIGIN", os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"))
    buffer_access_token: str = os.getenv("BUFFER_ACCESS_TOKEN", "")
    buffer_organization_id: str = os.getenv("BUFFER_ORGANIZATION_ID", "")
    meta_graph_api_version: str = os.getenv("META_GRAPH_API_VERSION", "v25.0")
    meta_app_id: str = os.getenv("META_APP_ID", "")
    meta_app_secret: str = os.getenv("META_APP_SECRET", "")
    meta_system_user_access_token: str = os.getenv("META_SYSTEM_USER_ACCESS_TOKEN", "")
    meta_business_id: str = os.getenv("META_BUSINESS_ID", "")
    meta_page_id: str = os.getenv("META_PAGE_ID", "")
    meta_ig_business_account_id: str = os.getenv("META_IG_BUSINESS_ACCOUNT_ID", "")
    meta_webhook_verify_token: str = os.getenv("META_WEBHOOK_VERIFY_TOKEN", "")


settings = Settings()
