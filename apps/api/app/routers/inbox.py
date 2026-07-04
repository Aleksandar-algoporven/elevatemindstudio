from typing import List

from fastapi import APIRouter

from app.models import InboxMessage
from app.store import list_inbox_messages as get_inbox_messages


router = APIRouter(prefix="/inbox", tags=["inbox"])


@router.get("", response_model=List[InboxMessage])
def list_inbox_messages() -> List[InboxMessage]:
    return get_inbox_messages()
