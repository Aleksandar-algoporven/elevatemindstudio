from fastapi import APIRouter

from app.models import BufferStatus, MetaStatus
from app.services.buffer_client import get_buffer_status
from app.services.meta_client import get_meta_status


router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("/buffer/status", response_model=BufferStatus)
def buffer_status() -> BufferStatus:
    return get_buffer_status()


@router.get("/meta/status", response_model=MetaStatus)
def meta_status() -> MetaStatus:
    return get_meta_status()
