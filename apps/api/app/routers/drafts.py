from typing import List

from fastapi import APIRouter

from app.models import ContentDraft, ContentDraftCreate, DraftRequest, DraftScheduleRequest, GeneratedDraft
from app.services.anthropic_client import generate_draft
from app.store import create_draft, create_draft_from_generated, list_drafts as get_drafts, schedule_draft

router = APIRouter(prefix="/drafts", tags=["drafts"])


@router.get("", response_model=List[ContentDraft])
def list_drafts() -> List[ContentDraft]:
    return get_drafts()


@router.post("", response_model=ContentDraft)
def add_draft(request: ContentDraftCreate) -> ContentDraft:
    return create_draft(request)


@router.post("/{draft_id}/schedule", response_model=ContentDraft)
def schedule_existing_draft(draft_id: str, request: DraftScheduleRequest) -> ContentDraft:
    return schedule_draft(draft_id, request)


@router.post("/generate", response_model=GeneratedDraft)
def create_generated_draft(request: DraftRequest) -> GeneratedDraft:
    return generate_draft(request)


@router.post("/generate/save", response_model=ContentDraft)
def generate_and_save_draft(request: DraftRequest) -> ContentDraft:
    generated = generate_draft(request)
    return create_draft_from_generated(
        ContentDraftCreate(
            title=generated.title,
            pillar=generated.pillar,
            channel=generated.channel,
            risk_level=generated.risk_level,
            copy_text=generated.copy_text,
        ),
        request.source_summary,
    )
