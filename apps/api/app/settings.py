import os
from dataclasses import dataclass


DEFAULT_LINKEDIN_SCOPES = "openid profile email w_member_social r_organization_social w_organization_social"
DEFAULT_YOUTUBE_SCOPES = (
    "https://www.googleapis.com/auth/youtube.readonly "
    "https://www.googleapis.com/auth/youtube.upload "
    "https://www.googleapis.com/auth/youtube.force-ssl"
)


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
    linkedin_api_version: str = os.getenv("LINKEDIN_API_VERSION", "202606")
    linkedin_scopes: str = os.getenv("LINKEDIN_SCOPES", DEFAULT_LINKEDIN_SCOPES)
    linkedin_client_id: str = os.getenv("LINKEDIN_CLIENT_ID", "")
    linkedin_client_secret: str = os.getenv("LINKEDIN_CLIENT_SECRET", "")
    linkedin_org_id: str = os.getenv("LINKEDIN_ORG_ID", "")
    linkedin_redirect_uri: str = os.getenv("LINKEDIN_REDIRECT_URI", "")
    linkedin_access_token: str = os.getenv("LINKEDIN_ACCESS_TOKEN", "")
    linkedin_refresh_token: str = os.getenv("LINKEDIN_REFRESH_TOKEN", "")
    discord_bot_token: str = os.getenv("DISCORD_BOT_TOKEN", "")
    discord_application_id: str = os.getenv("DISCORD_APPLICATION_ID", "")
    discord_public_key: str = os.getenv("DISCORD_PUBLIC_KEY", "")
    discord_guild_id: str = os.getenv("DISCORD_GUILD_ID", "")
    discord_alerts_channel_id: str = os.getenv("DISCORD_ALERTS_CHANNEL_ID", "")
    youtube_client_id: str = os.getenv("YOUTUBE_CLIENT_ID", "")
    youtube_client_secret: str = os.getenv("YOUTUBE_CLIENT_SECRET", "")
    youtube_refresh_token: str = os.getenv("YOUTUBE_REFRESH_TOKEN", "")
    youtube_channel_id: str = os.getenv("YOUTUBE_CHANNEL_ID", "")
    youtube_redirect_uri: str = os.getenv("YOUTUBE_REDIRECT_URI", "")
    youtube_scopes: str = os.getenv("YOUTUBE_SCOPES", DEFAULT_YOUTUBE_SCOPES)
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    @property
    def linkedin_scope_list(self) -> list[str]:
        return [scope for scope in self.linkedin_scopes.replace(",", " ").split() if scope]

    @property
    def youtube_scope_list(self) -> list[str]:
        return [scope for scope in self.youtube_scopes.replace(",", " ").split() if scope]

    @property
    def database_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)


settings = Settings()
