from typing import List

from fastapi import APIRouter

from app.models import SourceIngestRequest, SourceItem, SourceUpsertRequest
from app.store import list_sources as get_sources, mark_source_ingested, upsert_source


router = APIRouter(prefix="/sources", tags=["sources"])


@router.get("", response_model=List[SourceItem])
def list_sources() -> List[SourceItem]:
    return get_sources()


@router.post("", response_model=SourceItem)
def save_source(request: SourceUpsertRequest) -> SourceItem:
    return upsert_source(request)


@router.post("/{source_id}/ingest", response_model=SourceItem)
def ingest_source(source_id: str, request: SourceIngestRequest) -> SourceItem:
    return mark_source_ingested(source_id, request)
