from fastapi import APIRouter

from app.models import BufferStatus
from app.services.buffer_client import get_buffer_status


router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("/buffer/status", response_model=BufferStatus)
def buffer_status() -> BufferStatus:
    return get_buffer_status()
