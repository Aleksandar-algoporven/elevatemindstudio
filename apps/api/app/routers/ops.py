from fastapi import APIRouter

from app.models import ReadinessCheck, ReadinessResponse
from app.services.buffer_client import get_buffer_status
from app.services.discord_client import get_discord_status
from app.services.linkedin_client import get_linkedin_status
from app.services.youtube_client import get_youtube_status
from app.settings import settings
from app.store import list_drafts, list_sources


router = APIRouter(prefix="/ops", tags=["ops"])


def check(key: str, label: str, state: str, detail: str, action: str = "") -> ReadinessCheck:
    return ReadinessCheck(key=key, label=label, state=state, detail=detail, action=action)  # type: ignore[arg-type]


@router.get("/readiness", response_model=ReadinessResponse)
def readiness() -> ReadinessResponse:
    drafts = list_drafts()
    sources = list_sources()
    buffer_status = get_buffer_status()
    discord_status = get_discord_status()
    linkedin_status = get_linkedin_status()
    youtube_status = get_youtube_status()

    checks = [
        check(
            "ai",
            "Claude AI",
            "ready" if settings.anthropic_api_key else "blocked",
            "Configured for live draft generation." if settings.anthropic_api_key else "ANTHROPIC_API_KEY is missing.",
            "" if settings.anthropic_api_key else "Add ANTHROPIC_API_KEY.",
        ),
        check(
            "database",
            "Supabase",
            "ready" if settings.database_configured else "blocked",
            "Backend can read/write persistent workspace data."
            if settings.database_configured
            else "Supabase service role key or URL is missing.",
            "" if settings.database_configured else "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        ),
        check(
            "sources",
            "Source memory",
            "ready" if sources else "watch",
            f"{len(sources)} sources available.",
            "" if sources else "Add at least one source.",
        ),
        check(
            "drafts",
            "Review queue",
            "ready" if drafts else "watch",
            f"{len(drafts)} drafts in workspace.",
            "" if drafts else "Generate or create a draft.",
        ),
        check(
            "buffer",
            "Buffer publishing",
            "ready" if buffer_status.connected and buffer_status.channels_count else "blocked",
            f"{buffer_status.channels_count} Buffer channels connected."
            if buffer_status.connected
            else "; ".join(buffer_status.notes[:2]) or "Buffer is not connected.",
            "" if buffer_status.connected else "Connect Buffer channel/token.",
        ),
        check(
            "discord",
            "Discord monitoring",
            "ready"
            if discord_status.connected and discord_status.guild_id_configured and discord_status.alerts_channel_id_configured
            else "watch",
            "Bot, server, and alerts channel are configured."
            if discord_status.connected and discord_status.guild_id_configured and discord_status.alerts_channel_id_configured
            else "; ".join(discord_status.notes[:2]) or "Discord setup is partial.",
            ""
            if discord_status.connected and discord_status.guild_id_configured and discord_status.alerts_channel_id_configured
            else "Add DISCORD_GUILD_ID and DISCORD_ALERTS_CHANNEL_ID.",
        ),
        check(
            "linkedin",
            "LinkedIn",
            "ready" if linkedin_status.connected else "watch",
            "Organization API connected." if linkedin_status.connected else "; ".join(linkedin_status.notes[:2]),
            "" if linkedin_status.connected else "Wait for/complete LinkedIn organization permissions.",
        ),
        check(
            "youtube",
            "YouTube",
            "ready" if youtube_status.connected else "watch",
            "YouTube channel connected." if youtube_status.connected else "; ".join(youtube_status.notes[:2]),
            "" if youtube_status.connected else "Complete OAuth refresh token if publishing video.",
        ),
    ]

    return ReadinessResponse(
        ready=sum(1 for item in checks if item.state == "ready"),
        watch=sum(1 for item in checks if item.state == "watch"),
        blocked=sum(1 for item in checks if item.state == "blocked"),
        checks=checks,
    )
