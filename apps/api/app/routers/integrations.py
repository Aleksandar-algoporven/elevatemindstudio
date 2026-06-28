from fastapi import APIRouter

from app.models import BufferStatus, LinkedInStatus, MetaStatus
from app.services.buffer_client import get_buffer_status
from app.services.linkedin_client import get_linkedin_status
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
