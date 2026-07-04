from fastapi import APIRouter

from app.models import Brand
from app.store import active_brand as get_active_brand

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("/active", response_model=Brand)
def active_brand() -> Brand:
    return get_active_brand()
