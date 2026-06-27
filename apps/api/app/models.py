from typing import List, Literal, Optional

from pydantic import BaseModel, Field


Channel = Literal["linkedin", "x", "instagram", "youtube", "discord", "tiktok", "reddit", "bluesky", "substack"]
ApprovalState = Literal["draft", "needs_review", "approved", "scheduled", "published", "rejected"]
RiskLevel = Literal["low", "medium", "high"]
ConnectionStatus = Literal["ready", "manual", "pending", "blocked"]
SourceStatus = Literal["ready", "syncing", "manual", "pending"]
SourceType = Literal["website", "blog", "repo", "document", "feed", "manual"]
ApprovalDecision = Literal["approve", "reject", "request_changes"]
InboxPriority = Literal["low", "normal", "high", "urgent"]


class Brand(BaseModel):
    id: str
    name: str
    domain: str
    tone: str
    autonomy_level: int = Field(ge=0, le=4)
    prohibited_claims: List[str]


class ContentDraft(BaseModel):
    id: str
    title: str
    pillar: str
    channel: Channel
    approval_state: ApprovalState
    risk_level: RiskLevel
    source_refs: List[str]
    copy_text: str
    scheduled_for: Optional[str] = None


class ChannelConnection(BaseModel):
    id: str
    channel: Channel
    handle: str
    status: ConnectionStatus
    scopes: List[str]
    publishing_supported: bool
    monitoring_supported: bool
    notes: str


class SourceItem(BaseModel):
    id: str
    name: str
    source_type: SourceType
    status: SourceStatus
    url: Optional[str] = None
    item_count: int = Field(ge=0)
    last_ingested_at: Optional[str] = None


class ApprovalRequest(BaseModel):
    decision: ApprovalDecision
    reviewer: str = "Aleksandar"
    notes: str = ""


class ApprovalResult(BaseModel):
    draft_id: str
    previous_state: ApprovalState
    next_state: ApprovalState
    reviewer: str
    notes: str


class InboxMessage(BaseModel):
    id: str
    channel: Channel
    author: str
    text: str
    priority: InboxPriority
    sentiment: Literal["positive", "neutral", "negative", "question"]
    suggested_reply: str
    needs_human: bool


class DraftRequest(BaseModel):
    brand_name: str = "AlgoProven"
    pillar: str
    channel: Channel
    source_summary: str
    goal: str = "Generate a review-ready social post."


class GeneratedDraft(BaseModel):
    title: str
    channel: Channel
    pillar: str
    copy_text: str
    asset_brief: str
    risk_level: RiskLevel
    review_notes: List[str]


class HealthResponse(BaseModel):
    status: str
    app: str
    env: str
    ai_configured: bool
