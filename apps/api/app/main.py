from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import approvals, brands, calendar, channels, drafts, health, inbox, integrations, ops, sources
from app.settings import settings

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(brands.router)
app.include_router(drafts.router)
app.include_router(calendar.router)
app.include_router(channels.router)
app.include_router(sources.router)
app.include_router(inbox.router)
app.include_router(approvals.router)
app.include_router(integrations.router)
app.include_router(ops.router)
