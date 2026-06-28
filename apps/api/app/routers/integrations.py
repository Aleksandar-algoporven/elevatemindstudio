from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import PlainTextResponse

from app.models import (
    BufferPublishRequest,
    BufferPublishResult,
    BufferStatus,
    DiscordStatus,
    LinkedInAuthorizationUrl,
    LinkedInOAuthCallbackResult,
    LinkedInStatus,
    MetaStatus,
    YouTubeAuthorizationUrl,
    YouTubeOAuthCallbackResult,
    YouTubeStatus,
)
from app.services.buffer_client import get_buffer_status, publish_to_buffer
from app.services.discord_client import get_discord_status
from app.services.linkedin_client import get_linkedin_authorization_url, get_linkedin_status
from app.services.meta_client import get_meta_status
from app.services.youtube_client import get_youtube_authorization_url, get_youtube_status
from app.settings import settings


router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("/buffer/status", response_model=BufferStatus)
def buffer_status() -> BufferStatus:
    return get_buffer_status()


@router.post("/buffer/publish", response_model=BufferPublishResult)
def buffer_publish(request: BufferPublishRequest) -> BufferPublishResult:
    return publish_to_buffer(request)


@router.get("/meta/status", response_model=MetaStatus)
def meta_status() -> MetaStatus:
    return get_meta_status()


@router.get("/meta/webhook", response_class=PlainTextResponse)
def meta_webhook_verify(
    hub_mode: Optional[str] = Query(default=None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(default=None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(default=None, alias="hub.challenge"),
) -> PlainTextResponse:
    if hub_mode != "subscribe" or not hub_challenge:
        raise HTTPException(status_code=400, detail="Invalid Meta webhook verification request.")
    if not settings.meta_webhook_verify_token:
        raise HTTPException(status_code=503, detail="META_WEBHOOK_VERIFY_TOKEN is not configured.")
    if hub_verify_token != settings.meta_webhook_verify_token:
        raise HTTPException(status_code=403, detail="Invalid Meta webhook verify token.")
    return PlainTextResponse(hub_challenge)


@router.post("/meta/webhook")
def meta_webhook_receive() -> dict[str, bool]:
    return {"received": True}


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


@router.get("/youtube/status", response_model=YouTubeStatus)
def youtube_status() -> YouTubeStatus:
    return get_youtube_status()


@router.get("/youtube/oauth/authorize", response_model=YouTubeAuthorizationUrl)
def youtube_authorize() -> YouTubeAuthorizationUrl:
    return get_youtube_authorization_url()


@router.get("/youtube/oauth/callback", response_model=YouTubeOAuthCallbackResult)
def youtube_oauth_callback(
    code: Optional[str] = Query(default=None),
    error: Optional[str] = Query(default=None),
    error_description: Optional[str] = Query(default=None),
) -> YouTubeOAuthCallbackResult:
    if error:
        raise HTTPException(status_code=400, detail={"error": error, "error_description": error_description})
    if not code:
        raise HTTPException(status_code=400, detail="Missing YouTube OAuth code.")
    return YouTubeOAuthCallbackResult(
        success=True,
        authorization_code_received=True,
        exchange_performed=False,
        access_token_received=False,
        refresh_token_received=False,
        notes=[
            "YouTube authorization code was received. Token exchange was intentionally not performed here.",
            "Copy the code query parameter from the browser address bar so Codex can exchange it locally and write tokens without displaying them.",
        ],
    )


@router.get("/discord/status", response_model=DiscordStatus)
def discord_status() -> DiscordStatus:
    return get_discord_status()
