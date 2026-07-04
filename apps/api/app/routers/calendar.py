from typing import List

from fastapi import APIRouter

from app.store import list_calendar

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("")
def publishing_calendar() -> List[dict]:
    return list_calendar()
