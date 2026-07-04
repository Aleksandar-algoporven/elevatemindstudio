from typing import List

from fastapi import APIRouter

from app.models import ChannelConnection
from app.store import list_channels as get_channels


router = APIRouter(prefix="/channels", tags=["channels"])


@router.get("", response_model=List[ChannelConnection])
def list_channels() -> List[ChannelConnection]:
    return get_channels()
