from fastapi import APIRouter

from app.models import Brand
from app.store import brand

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("/active", response_model=Brand)
def active_brand() -> Brand:
    return brand
