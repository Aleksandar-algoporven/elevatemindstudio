from typing import List

from fastapi import APIRouter

from app.models import InboxMessage, InboxResolveRequest, InboxResolveResult
from app.store import list_inbox_messages as get_inbox_messages, resolve_inbox_message


router = APIRouter(prefix="/inbox", tags=["inbox"])


@router.get("", response_model=List[InboxMessage])
def list_inbox_messages() -> List[InboxMessage]:
    return get_inbox_messages()


@router.post("/{message_id}/resolve", response_model=InboxResolveResult)
def resolve_message(message_id: str, request: InboxResolveRequest) -> InboxResolveResult:
    return resolve_inbox_message(message_id, request)
