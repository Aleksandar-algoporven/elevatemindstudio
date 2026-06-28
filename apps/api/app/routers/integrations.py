from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.models import (
    BufferStatus,
    DiscordStatus,
    LinkedInAuthorizationUrl,
    LinkedInOAuthCallbackResult,
    LinkedInStatus,
    MetaStatus,
)
from app.services.buffer_client import get_buffer_status
from app.services.discord_client import get_discord_status
from app.services.linkedin_client import get_linkedin_authorization_url, get_linkedin_status
from app.services.meta_client import get_meta_status


router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("/buffer/status", response_model=BufferStatus)
def buffer_status() -> BufferStatus:
    return get_buffer_status()


@router.get("/meta/status", response_model=MetaStatus)
def meta_status() -> MetaStatus:
    return get_meta_status()


@router.get("/linkedin/status", response_model=LinkedInStatus)
def linkedin_status() -> LinkedInStatus:
    return get_linkedin_status()


@router.get("/linkedin/oauth/authorize", response_model=LinkedInAuthorizationUrl)
def linkedin_authorize() -> LinkedInAuthorizationUrl:
    return get_linkedin_authorization_url()


@router.get("/linkedin/oauth/callback", response_model=LinkedInOAuthCallbackResult)
def linkedin_oauth_callback(
    code: Optional[str] = Query(default=None),
    error: Optional[str] = Query(default=None),
    error_description: Optional[str] = Query(default=None),
) -> LinkedInOAuthCallbackResult:
    if error:
        raise HTTPException(status_code=400, detail={"error": error, "error_description": error_description})
    if not code:
        raise HTTPException(status_code=400, detail="Missing LinkedIn OAuth code.")
    return LinkedInOAuthCallbackResult(
        success=True,
        authorization_code_received=True,
        exchange_performed=False,
        access_token_received=False,
        refresh_token_received=False,
        notes=[
            "LinkedIn authorization code was received. Token exchange was intentionally not performed here.",
            "Copy the code query parameter from the browser address bar so Codex can exchange it locally and write tokens without displaying them.",
        ],
    )


@router.get("/discord/status", response_model=DiscordStatus)
def discord_status() -> DiscordStatus:
    return get_discord_status()
