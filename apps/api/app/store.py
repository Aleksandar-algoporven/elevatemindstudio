from fastapi import HTTPException

from app.models import (
    ApprovalDecision,
    ApprovalRequest,
    ApprovalResult,
    Brand,
    ChannelConnection,
    ContentDraft,
    InboxMessage,
    SourceItem,
)


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


def find_draft(draft_id: str) -> ContentDraft:
    for draft in drafts:
        if draft.id == draft_id:
            return draft
    raise HTTPException(status_code=404, detail="Draft not found")


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

    return ApprovalResult(
        draft_id=draft.id,
        previous_state=previous_state,
        next_state=next_state,
        reviewer=request.reviewer,
        notes=request.notes,
    )
