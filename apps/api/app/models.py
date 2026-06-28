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


class BufferChannel(BaseModel):
    id: str
    service: str
    name: str
    display_name: str
    descriptor: str = ""
    channel_type: str = ""
    is_disconnected: bool
    is_locked: bool
    allowed_actions: List[str]
    products: List[str]


class BufferStatus(BaseModel):
    configured: bool
    connected: bool
    organization_id: Optional[str] = None
    organization_name: Optional[str] = None
    channels_count: int = Field(ge=0)
    channels: List[BufferChannel]
    notes: List[str]


class MetaAsset(BaseModel):
    id: str
    name: Optional[str] = None
    username: Optional[str] = None


class MetaStatus(BaseModel):
    configured: bool
    connected: bool
    graph_api_version: str
    app_configured: bool
    system_user_token_configured: bool
    business_id_configured: bool
    page_id_configured: bool
    instagram_business_account_id_configured: bool
    webhook_verify_token_configured: bool
    business: Optional[MetaAsset] = None
    page: Optional[MetaAsset] = None
    instagram_business_account: Optional[MetaAsset] = None
    notes: List[str]


class LinkedInOrganization(BaseModel):
    id: str
    name: Optional[str] = None
    vanity_name: Optional[str] = None


class LinkedInStatus(BaseModel):
    configured: bool
    connected: bool
    api_version: str
    app_configured: bool
    org_id_configured: bool
    redirect_uri_configured: bool
    access_token_configured: bool
    refresh_token_configured: bool
    organization: Optional[LinkedInOrganization] = None
    notes: List[str]


class LinkedInAuthorizationUrl(BaseModel):
    configured: bool
    authorization_url: Optional[str] = None
    state: Optional[str] = None
    scopes: List[str]
    notes: List[str]


class LinkedInOAuthCallbackResult(BaseModel):
    success: bool
    authorization_code_received: bool = False
    exchange_performed: bool = False
    access_token_received: bool
    refresh_token_received: bool
    expires_in: Optional[int] = None
    scope: Optional[str] = None
    token_type: Optional[str] = None
    notes: List[str]


class DiscordBot(BaseModel):
    id: str
    username: str


class DiscordGuild(BaseModel):
    id: str
    name: Optional[str] = None


class DiscordChannel(BaseModel):
    id: str
    name: Optional[str] = None
    channel_type: Optional[int] = None


class DiscordStatus(BaseModel):
    configured: bool
    connected: bool
    bot_token_configured: bool
    application_id_configured: bool
    public_key_configured: bool
    guild_id_configured: bool
    alerts_channel_id_configured: bool
    bot: Optional[DiscordBot] = None
    guild: Optional[DiscordGuild] = None
    alerts_channel: Optional[DiscordChannel] = None
    notes: List[str]


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
