from typing import List

from fastapi import APIRouter

from app.models import ContentDraft, DraftRequest, GeneratedDraft
from app.services.anthropic_client import generate_draft
from app.store import drafts

router = APIRouter(prefix="/drafts", tags=["drafts"])


@router.get("", response_model=List[ContentDraft])
def list_drafts() -> List[ContentDraft]:
    return drafts


@router.post("/generate", response_model=GeneratedDraft)
def create_generated_draft(request: DraftRequest) -> GeneratedDraft:
    return generate_draft(request)
