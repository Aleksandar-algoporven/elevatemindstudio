from typing import Optional
from datetime import datetime, timezone
import re
from uuid import uuid4

from fastapi import HTTPException
import httpx

from app.models import (
    ApprovalDecision,
    ApprovalRequest,
    ApprovalResult,
    Brand,
    ChannelConnection,
    ContentDraft,
    ContentDraftCreate,
    InboxMessage,
    SourceItem,
    SourceIngestRequest,
    SourceUpsertRequest,
)
from app.settings import settings


SUPABASE_TIMEOUT_SECONDS = 5.0


brand = Brand(
    id="brand-algoproven",
    name="AlgoProven",
    domain="algoproven.com",
    tone="Precise, evidence-backed, product-led, and operator-aware.",
    autonomy_level=1,
    prohibited_claims=[
        "guaranteed returns",
        "risk-free trading",
        "verified performance without source evidence",
    ],
)

drafts = [
    ContentDraft(
        id="draft-001",
        title="Product truth from changelog",
        pillar="Product truth",
        channel="linkedin",
        approval_state="needs_review",
        risk_level="medium",
        source_refs=["AlgoProven app changelog", "Risk system notes"],
        copy_text="A useful product update is not a slogan. It is a traceable change users can inspect, test, and trust.",
        scheduled_for="2026-06-30T09:00:00Z",
    ),
    ContentDraft(
        id="draft-002",
        title="Founder build-in-public thread",
        pillar="Founder/operator voice",
        channel="x",
        approval_state="draft",
        risk_level="low",
        source_refs=["Founder notes", "Roadmap v1"],
        copy_text="Building trading infrastructure teaches the same lesson every week: the boring controls are what keep the exciting parts alive.",
        scheduled_for="2026-06-30T14:30:00Z",
    ),
]

calendar = [
    {"day": "Mon", "posts": 3, "focus": "Product truth"},
    {"day": "Tue", "posts": 2, "focus": "Founder voice"},
    {"day": "Wed", "posts": 4, "focus": "Education"},
    {"day": "Thu", "posts": 2, "focus": "Trust"},
    {"day": "Fri", "posts": 1, "focus": "Recap"},
]

channels = [
    ChannelConnection(
        id="channel-linkedin-company",
        channel="linkedin",
        handle="AlgoProven",
        status="pending",
        scopes=["profile", "organization", "ugc_posts", "comments"],
        publishing_supported=True,
        monitoring_supported=True,
        notes="Requires LinkedIn app review before fully automated organization publishing.",
    ),
    ChannelConnection(
        id="channel-x-brand",
        channel="x",
        handle="@algoproven",
        status="pending",
        scopes=["tweet.read", "tweet.write", "users.read", "offline.access"],
        publishing_supported=True,
        monitoring_supported=True,
        notes="API tier and rate limits decide how much monitoring can be automated.",
    ),
    ChannelConnection(
        id="channel-instagram",
        channel="instagram",
        handle="@algoproven",
        status="manual",
        scopes=["instagram_basic", "instagram_content_publish", "pages_read_engagement"],
        publishing_supported=True,
        monitoring_supported=True,
        notes="Requires Meta Business account, connected Facebook Page, and app permissions.",
    ),
    ChannelConnection(
        id="channel-youtube",
        channel="youtube",
        handle="@algoproven",
        status="pending",
        scopes=["youtube.upload", "youtube.readonly", "youtube.force-ssl"],
        publishing_supported=True,
        monitoring_supported=True,
        notes="Uploads and comment moderation are possible after Google OAuth verification.",
    ),
    ChannelConnection(
        id="channel-discord",
        channel="discord",
        handle="AlgoProven Discord",
        status="ready",
        scopes=["bot", "applications.commands"],
        publishing_supported=True,
        monitoring_supported=True,
        notes="Best first fully automated community channel because bot permissions are direct.",
    ),
]

sources = [
    SourceItem(
        id="source-site",
        name="AlgoProven marketing site",
        source_type="website",
        status="ready",
        url="https://www.algoproven.com",
        item_count=18,
        last_ingested_at="2026-06-27T09:00:00Z",
    ),
    SourceItem(
        id="source-app",
        name="AlgoProven app notes",
        source_type="manual",
        status="manual",
        url="https://app.algoproven.com",
        item_count=7,
        last_ingested_at="2026-06-26T18:30:00Z",
    ),
    SourceItem(
        id="source-platform-repo",
        name="algoproven-platform repository",
        source_type="repo",
        status="pending",
        url="https://github.com/Aleksandar-algoporven/algoproven-platform",
        item_count=0,
    ),
    SourceItem(
        id="source-rulegate-repo",
        name="algoproven-rulegate repository",
        source_type="repo",
        status="pending",
        url="https://github.com/Aleksandar-algoporven/algoproven-rulegate",
        item_count=0,
    ),
]

inbox_messages = [
    InboxMessage(
        id="inbox-001",
        channel="linkedin",
        author="Prop firm operator",
        text="Can AlgoProven separate verified performance from marketing claims?",
        priority="high",
        sentiment="question",
        suggested_reply="Yes. The product direction is to keep claim language tied to traceable source evidence and review gates before publishing.",
        needs_human=True,
    ),
    InboxMessage(
        id="inbox-002",
        channel="discord",
        author="beta-user",
        text="The approval workflow makes sense. Can we get weekly release notes?",
        priority="normal",
        sentiment="positive",
        suggested_reply="Good idea. We are shaping a weekly source-backed release note format for product, risk, and trust updates.",
        needs_human=False,
    ),
]


def _supabase_headers() -> dict[str, str]:
    return {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
    }


def _supabase_url(table: str) -> str:
    return f"{settings.supabase_url.rstrip('/')}/rest/v1/{table}"


def _supabase_get(table: str, params: Optional[dict[str, str]] = None) -> list[dict]:
    if not settings.database_configured:
        return []

    try:
        with httpx.Client(timeout=SUPABASE_TIMEOUT_SECONDS) as client:
            response = client.get(
                _supabase_url(table),
                headers=_supabase_headers(),
                params={"select": "*", **(params or {})},
            )
            response.raise_for_status()
            payload = response.json()
            if isinstance(payload, list):
                return payload
    except httpx.HTTPError:
        return []
    return []


def _supabase_patch(table: str, item_id: str, payload: dict) -> bool:
    if not settings.database_configured:
        return False

    try:
        with httpx.Client(timeout=SUPABASE_TIMEOUT_SECONDS) as client:
            response = client.patch(
                _supabase_url(table),
                headers={
                    **_supabase_headers(),
                    "Prefer": "return=minimal",
                },
                params={"id": f"eq.{item_id}"},
                json=payload,
            )
            response.raise_for_status()
            return True
    except httpx.HTTPError:
        return False


def _supabase_insert(table: str, payload: dict) -> bool:
    if not settings.database_configured:
        return False

    try:
        with httpx.Client(timeout=SUPABASE_TIMEOUT_SECONDS) as client:
            response = client.post(
                _supabase_url(table),
                headers={
                    **_supabase_headers(),
                    "Prefer": "return=minimal",
                },
                json=payload,
            )
            response.raise_for_status()
            return True
    except httpx.HTTPError:
        return False


def _supabase_upsert(table: str, payload: dict) -> Optional[dict]:
    if not settings.database_configured:
        return None

    try:
        with httpx.Client(timeout=SUPABASE_TIMEOUT_SECONDS) as client:
            response = client.post(
                _supabase_url(table),
                headers={
                    **_supabase_headers(),
                    "Prefer": "resolution=merge-duplicates,return=representation",
                },
                json=payload,
            )
            response.raise_for_status()
            rows = response.json()
            if isinstance(rows, list) and rows:
                return rows[0]
    except httpx.HTTPError:
        return None
    return None


def _slug_id(prefix: str, value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    slug = slug[:48] or "item"
    return f"{prefix}-{slug}-{uuid4().hex[:8]}"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def active_brand() -> Brand:
    rows = _supabase_get("brands", {"limit": "1"})
    if rows:
        return Brand.model_validate(rows[0])
    return brand


def list_drafts() -> list[ContentDraft]:
    rows = _supabase_get("content_drafts", {"order": "scheduled_for.asc.nullslast"})
    if rows:
        return [ContentDraft.model_validate(row) for row in rows]
    return drafts


def list_calendar() -> list[dict]:
    rows = _supabase_get("calendar_items", {"order": "sort_order.asc"})
    if rows:
        return [{"day": row["day"], "posts": row["posts"], "focus": row["focus"]} for row in rows]
    return calendar


def list_channels() -> list[ChannelConnection]:
    rows = _supabase_get("channel_connections", {"order": "id.asc"})
    if rows:
        return [ChannelConnection.model_validate(row) for row in rows]
    return channels


def list_sources() -> list[SourceItem]:
    rows = _supabase_get("content_sources", {"order": "id.asc"})
    if rows:
        return [SourceItem.model_validate(row) for row in rows]
    return sources


def upsert_source(request: SourceUpsertRequest) -> SourceItem:
    payload = request.model_dump()
    payload["id"] = request.id or _slug_id("source", request.name)
    row = _supabase_upsert("content_sources", payload)
    if row:
        return SourceItem.model_validate(row)

    source = SourceItem.model_validate(payload)
    for index, existing in enumerate(sources):
        if existing.id == source.id:
            sources[index] = source
            return source
    sources.append(source)
    return source


def mark_source_ingested(source_id: str, request: SourceIngestRequest) -> SourceItem:
    source = None
    for item in list_sources():
        if item.id == source_id:
            source = item
            break
    if source is None:
        raise HTTPException(status_code=404, detail="Source not found")

    payload = {
        "status": request.status,
        "item_count": source.item_count + request.item_count_delta,
        "last_ingested_at": request.last_ingested_at or _now_iso(),
    }
    _supabase_patch("content_sources", source.id, payload)
    updated = source.model_copy(update=payload)

    for index, existing in enumerate(sources):
        if existing.id == source.id:
            sources[index] = updated
            break
    return updated


def list_inbox_messages() -> list[InboxMessage]:
    rows = _supabase_get("inbox_messages", {"order": "created_at.desc"})
    if rows:
        return [InboxMessage.model_validate(row) for row in rows]
    return inbox_messages


def find_draft(draft_id: str) -> ContentDraft:
    for draft in list_drafts():
        if draft.id == draft_id:
            return draft
    raise HTTPException(status_code=404, detail="Draft not found")


def create_draft(request: ContentDraftCreate) -> ContentDraft:
    payload = request.model_dump()
    payload["id"] = request.id or _slug_id("draft", request.title)
    row = _supabase_upsert("content_drafts", payload)
    if row:
        return ContentDraft.model_validate(row)

    draft = ContentDraft.model_validate(payload)
    for index, existing in enumerate(drafts):
        if existing.id == draft.id:
            drafts[index] = draft
            return draft
    drafts.append(draft)
    return draft


def next_approval_state(decision: ApprovalDecision) -> str:
    if decision == "approve":
        return "approved"
    if decision == "reject":
        return "rejected"
    return "needs_review"


def apply_approval(draft_id: str, request: ApprovalRequest) -> ApprovalResult:
    draft = find_draft(draft_id)
    previous_state = draft.approval_state
    next_state = next_approval_state(request.decision)
    draft.approval_state = next_state
    _supabase_patch("content_drafts", draft.id, {"approval_state": next_state})
    _supabase_insert(
        "approval_events",
        {
            "draft_id": draft.id,
            "previous_state": previous_state,
            "next_state": next_state,
            "reviewer": request.reviewer,
            "notes": request.notes,
        },
    )

    return ApprovalResult(
        draft_id=draft.id,
        previous_state=previous_state,
        next_state=next_state,
        reviewer=request.reviewer,
        notes=request.notes,
    )
