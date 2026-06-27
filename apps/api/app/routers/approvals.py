from fastapi import APIRouter

from app.models import ApprovalRequest, ApprovalResult
from app.store import apply_approval


router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.post("/drafts/{draft_id}", response_model=ApprovalResult)
def review_draft(draft_id: str, request: ApprovalRequest) -> ApprovalResult:
    return apply_approval(draft_id, request)
