from fastapi import APIRouter

from app.models import ApprovalRequest, ApprovalResult, BufferPublishRequest, DraftPublishPlan
from app.services.buffer_client import publish_to_buffer
from app.store import apply_approval, find_draft, queue_draft


router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.post("/drafts/{draft_id}", response_model=ApprovalResult)
def review_draft(draft_id: str, request: ApprovalRequest) -> ApprovalResult:
    return apply_approval(draft_id, request)


@router.post("/drafts/{draft_id}/publish-plan", response_model=DraftPublishPlan)
def draft_publish_plan(draft_id: str) -> DraftPublishPlan:
    draft = find_draft(draft_id)
    if draft.approval_state not in {"approved", "scheduled"}:
        return DraftPublishPlan(
            draft_id=draft.id,
            channel=draft.channel,
            approved=False,
            gate_state="blocked",
            blockers=[f"Draft is {draft.approval_state.replace('_', ' ')}. Approval is required before publishing."],
        )

    buffer_plan = publish_to_buffer(
        BufferPublishRequest(
            channel=draft.channel,
            text=draft.copy_text,
            scheduled_at=draft.scheduled_for,
            dry_run=True,
        )
    )
    blockers = [] if buffer_plan.accepted else buffer_plan.notes
    return DraftPublishPlan(
        draft_id=draft.id,
        channel=draft.channel,
        approved=True,
        gate_state="ready" if buffer_plan.accepted else "waiting_connector",
        blockers=blockers,
        buffer=buffer_plan,
    )


@router.post("/drafts/{draft_id}/queue", response_model=DraftPublishPlan)
def queue_draft_for_publishing(draft_id: str) -> DraftPublishPlan:
    draft = find_draft(draft_id)
    if draft.approval_state not in {"approved", "scheduled"}:
        return DraftPublishPlan(
            draft_id=draft.id,
            channel=draft.channel,
            approved=False,
            gate_state="blocked",
            blockers=["Draft must be approved before queueing."],
        )
    if not draft.scheduled_for:
        return DraftPublishPlan(
            draft_id=draft.id,
            channel=draft.channel,
            approved=True,
            gate_state="blocked",
            blockers=["Draft needs scheduled_for before queueing."],
        )

    buffer_plan = publish_to_buffer(
        BufferPublishRequest(
            channel=draft.channel,
            text=draft.copy_text,
            scheduled_at=draft.scheduled_for,
            dry_run=True,
        )
    )
    blockers = [] if buffer_plan.accepted else buffer_plan.notes
    if buffer_plan.accepted:
        draft = queue_draft(draft_id)

    return DraftPublishPlan(
        draft_id=draft.id,
        channel=draft.channel,
        approved=True,
        gate_state="ready" if buffer_plan.accepted else "waiting_connector",
        blockers=blockers,
        buffer=buffer_plan,
    )
