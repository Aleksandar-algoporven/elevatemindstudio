from typing import List

from fastapi import APIRouter

from app.models import SourceItem
from app.store import sources


router = APIRouter(prefix="/sources", tags=["sources"])


@router.get("", response_model=List[SourceItem])
def list_sources() -> List[SourceItem]:
    return sources
