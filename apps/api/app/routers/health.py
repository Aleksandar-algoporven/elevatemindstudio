from fastapi import APIRouter

from app.models import HealthResponse
from app.settings import settings

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        env=settings.app_env,
        ai_configured=bool(settings.anthropic_api_key),
    )
