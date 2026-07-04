from typing import List

from fastapi import APIRouter

from app.models import ContentDraft, ContentDraftCreate, DraftRequest, GeneratedDraft
from app.services.anthropic_client import generate_draft
from app.store import create_draft, list_drafts as get_drafts

router = APIRouter(prefix="/drafts", tags=["drafts"])


@router.get("", response_model=List[ContentDraft])
def list_drafts() -> List[ContentDraft]:
    return get_drafts()


@router.post("", response_model=ContentDraft)
def add_draft(request: ContentDraftCreate) -> ContentDraft:
    return create_draft(request)


@router.post("/generate", response_model=GeneratedDraft)
def create_generated_draft(request: DraftRequest) -> GeneratedDraft:
    return generate_draft(request)
