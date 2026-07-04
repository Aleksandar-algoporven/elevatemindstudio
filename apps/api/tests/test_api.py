from fastapi.testclient import TestClient
from app.routers import approvals, drafts, integrations

from app.main import app
from app.models import BufferChannel, BufferPublishRequest, BufferPublishResult, BufferPublishTarget, BufferStatus, GeneratedDraft
from app.services.buffer_client import BufferClient
from app.services.discord_client import DiscordClient
from app.services.linkedin_client import LinkedInClient
from app.services.meta_client import MetaClient
from app.services.youtube_client import YouTubeClient


client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_drafts() -> None:
    response = client.get("/drafts")
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_channels_sources_and_inbox() -> None:
    channels = client.get("/channels")
    sources = client.get("/sources")
    inbox = client.get("/inbox")

    assert channels.status_code == 200
    assert sources.status_code == 200
    assert inbox.status_code == 200
    assert channels.json()[0]["publishing_supported"] is True
    assert sources.json()[0]["source_type"] == "website"
    assert inbox.json()[0]["needs_human"] is True


def test_create_source_and_mark_ingested() -> None:
    source_id = "source-test-api-notes"
    create_response = client.post(
        "/sources",
        json={
            "id": source_id,
            "name": "API notes for content testing",
            "source_type": "manual",
            "status": "manual",
            "item_count": 2,
        },
    )

    assert create_response.status_code == 200
    assert create_response.json()["id"] == source_id
    assert create_response.json()["item_count"] == 2

    ingest_response = client.post(
        f"/sources/{source_id}/ingest",
        json={"item_count_delta": 3, "status": "ready", "last_ingested_at": "2026-07-04T10:00:00Z"},
    )

    assert ingest_response.status_code == 200
    payload = ingest_response.json()
    assert payload["status"] == "ready"
    assert payload["item_count"] == 5
    assert payload["last_ingested_at"] == "2026-07-04T10:00:00Z"


def test_create_draft() -> None:
    draft_id = "draft-test-api-create"
    response = client.post(
        "/drafts",
        json={
            "id": draft_id,
            "title": "Manual source insight",
            "pillar": "Education",
            "channel": "linkedin",
            "risk_level": "low",
            "source_refs": ["API notes for content testing"],
            "copy_text": "A source-backed note can become a review-ready post before it becomes a scheduled post.",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == draft_id
    assert payload["approval_state"] == "draft"
    assert payload["source_refs"] == ["API notes for content testing"]


def test_generate_and_save_draft(monkeypatch) -> None:
    def fake_generate(request):
        return GeneratedDraft(
            title="Generated trust post",
            channel=request.channel,
            pillar=request.pillar,
            copy_text="Generated source-backed copy for review.",
            asset_brief="Simple product evidence card.",
            risk_level="low",
            review_notes=["Human approval required."],
        )

    monkeypatch.setattr(drafts, "generate_draft", fake_generate)

    response = client.post(
        "/drafts/generate/save",
        json={
            "brand_name": "AlgoProven",
            "pillar": "Trust",
            "channel": "linkedin",
            "source_summary": "Source backed product update with approval workflow.",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["title"] == "Generated trust post"
    assert payload["approval_state"] == "needs_review"
    assert payload["source_refs"] == ["Source backed product update with approval workflow."]


def test_schedule_draft_keeps_unapproved_state() -> None:
    draft_id = "draft-test-schedule"
    client.post(
        "/drafts",
        json={
            "id": draft_id,
            "title": "Schedule without approval",
            "pillar": "Operations",
            "channel": "linkedin",
            "copy_text": "Scheduling should not bypass the approval gate.",
        },
    )

    response = client.post(
        f"/drafts/{draft_id}/schedule",
        json={"scheduled_for": "2026-07-05T09:00:00Z"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["scheduled_for"] == "2026-07-05T09:00:00Z"
    assert payload["approval_state"] == "draft"


def test_queue_draft_requires_approval() -> None:
    response = client.post("/approvals/drafts/draft-002/queue")

    assert response.status_code == 200
    payload = response.json()
    assert payload["gate_state"] == "blocked"
    assert payload["approved"] is False
    assert "approved" in payload["blockers"][0]


def test_resolve_inbox_message() -> None:
    response = client.post(
        "/inbox/inbox-001/resolve",
        json={"responder": "Test reviewer", "notes": "Handled in test."},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["message_id"] == "inbox-001"
    assert payload["previous_needs_human"] is True
    assert payload["next_needs_human"] is False
    assert payload["responder"] == "Test reviewer"


def test_buffer_status_route() -> None:
    response = client.get("/integrations/buffer/status")

    assert response.status_code == 200
    payload = response.json()
    assert "configured" in payload
    assert "channels_count" in payload
    assert isinstance(payload["channels"], list)


def test_buffer_client_without_token() -> None:
    status = BufferClient(access_token="").status()

    assert status.configured is False
    assert status.connected is False
    assert status.channels_count == 0


def test_buffer_publish_dry_run_selects_channel() -> None:
    buffer_client = BufferClient(access_token="token")
    buffer_client.status = lambda: BufferStatus(
        configured=True,
        connected=True,
        channels_count=1,
        channels=[
            BufferChannel(
                id="channel-1",
                service="twitter",
                name="AlgoProven",
                display_name="AlgoProven",
                is_disconnected=False,
                is_locked=False,
                allowed_actions=[],
                products=["publish"],
            )
        ],
        notes=[],
    )

    result = buffer_client.publish(BufferPublishRequest(channel="x", text="Approved draft", dry_run=True))

    assert result.accepted is True
    assert result.dry_run is True
    assert result.target is not None
    assert result.target.channel_id == "channel-1"


def test_buffer_publish_real_publish_is_disabled() -> None:
    buffer_client = BufferClient(access_token="token")
    buffer_client.status = lambda: BufferStatus(
        configured=True,
        connected=True,
        channels_count=1,
        channels=[
            BufferChannel(
                id="channel-1",
                service="instagram",
                name="algoproven",
                display_name="algoproven",
                is_disconnected=False,
                is_locked=False,
                allowed_actions=[],
                products=["publish"],
            )
        ],
        notes=[],
    )

    result = buffer_client.publish(BufferPublishRequest(channel="instagram", text="Approved draft", dry_run=False))

    assert result.accepted is False
    assert result.dry_run is False
    assert result.target is not None
    assert "disabled" in result.notes[-1]


def test_meta_status_route() -> None:
    response = client.get("/integrations/meta/status")

    assert response.status_code == 200
    payload = response.json()
    assert "configured" in payload
    assert "graph_api_version" in payload
    assert isinstance(payload["notes"], list)


def test_meta_client_without_token() -> None:
    status = MetaClient(graph_api_version="v25.0").status()

    assert status.configured is False
    assert status.connected is False
    assert status.system_user_token_configured is False


def test_meta_webhook_verification() -> None:
    original_token = integrations.settings.meta_webhook_verify_token
    object.__setattr__(integrations.settings, "meta_webhook_verify_token", "verify-token")
    try:
        response = client.get(
            "/integrations/meta/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "verify-token",
                "hub.challenge": "challenge-123",
            },
        )
    finally:
        object.__setattr__(integrations.settings, "meta_webhook_verify_token", original_token)

    assert response.status_code == 200
    assert response.text == "challenge-123"


def test_meta_webhook_rejects_invalid_token() -> None:
    original_token = integrations.settings.meta_webhook_verify_token
    object.__setattr__(integrations.settings, "meta_webhook_verify_token", "verify-token")
    try:
        response = client.get(
            "/integrations/meta/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "wrong-token",
                "hub.challenge": "challenge-123",
            },
        )
    finally:
        object.__setattr__(integrations.settings, "meta_webhook_verify_token", original_token)

    assert response.status_code == 403


def test_linkedin_status_route() -> None:
    response = client.get("/integrations/linkedin/status")

    assert response.status_code == 200
    payload = response.json()
    assert "configured" in payload
    assert "api_version" in payload
    assert isinstance(payload["notes"], list)


def test_linkedin_authorize_route() -> None:
    response = client.get("/integrations/linkedin/oauth/authorize")

    assert response.status_code == 200
    payload = response.json()
    assert "configured" in payload
    assert "scopes" in payload
    assert "w_member_social" in payload["scopes"]


def test_linkedin_authorize_uses_custom_scopes() -> None:
    result = LinkedInClient(
        api_version="202606",
        client_id="client-id",
        redirect_uri="https://example.com/callback",
        scopes=["r_organization_social", "w_organization_social"],
    ).authorization_url()

    assert result.configured is True
    assert result.scopes == ["r_organization_social", "w_organization_social"]
    assert result.authorization_url is not None
    assert "scope=r_organization_social+w_organization_social" in result.authorization_url


def test_linkedin_callback_requires_code() -> None:
    response = client.get("/integrations/linkedin/oauth/callback")

    assert response.status_code == 400


def test_linkedin_client_without_token() -> None:
    status = LinkedInClient(api_version="202606").status()

    assert status.configured is False
    assert status.connected is False
    assert status.access_token_configured is False


def test_discord_status_route() -> None:
    response = client.get("/integrations/discord/status")

    assert response.status_code == 200
    payload = response.json()
    assert "configured" in payload
    assert "bot_token_configured" in payload
    assert isinstance(payload["notes"], list)


def test_discord_client_without_token() -> None:
    status = DiscordClient().status()

    assert status.configured is False
    assert status.connected is False
    assert status.bot_token_configured is False


def test_youtube_status_route() -> None:
    response = client.get("/integrations/youtube/status")

    assert response.status_code == 200
    payload = response.json()
    assert "configured" in payload
    assert "client_configured" in payload
    assert isinstance(payload["notes"], list)


def test_youtube_authorize_route() -> None:
    response = client.get("/integrations/youtube/oauth/authorize")

    assert response.status_code == 200
    payload = response.json()
    assert "configured" in payload
    assert "scopes" in payload
    assert "https://www.googleapis.com/auth/youtube.upload" in payload["scopes"]


def test_youtube_authorize_uses_custom_scopes() -> None:
    result = YouTubeClient(
        client_id="client-id",
        redirect_uri="https://example.com/callback",
        scopes=["https://www.googleapis.com/auth/youtube.readonly"],
    ).authorization_url()

    assert result.configured is True
    assert result.scopes == ["https://www.googleapis.com/auth/youtube.readonly"]
    assert result.authorization_url is not None
    assert "access_type=offline" in result.authorization_url
    assert "prompt=consent" in result.authorization_url


def test_youtube_callback_requires_code() -> None:
    response = client.get("/integrations/youtube/oauth/callback")

    assert response.status_code == 400


def test_youtube_client_without_refresh_token() -> None:
    status = YouTubeClient(client_id="client-id", client_secret="client-secret").status()

    assert status.configured is True
    assert status.connected is False
    assert status.client_configured is True
    assert status.refresh_token_configured is False


def test_generate_draft_without_key() -> None:
    response = client.post(
        "/drafts/generate",
        json={
            "brand_name": "AlgoProven",
            "pillar": "Product truth",
            "channel": "linkedin",
            "source_summary": "A new approval workflow was added.",
        },
    )
    assert response.status_code == 200
    assert response.json()["channel"] == "linkedin"


def test_approval_updates_draft_state() -> None:
    response = client.post(
        "/approvals/drafts/draft-002",
        json={"decision": "approve", "reviewer": "Aleksandar", "notes": "Looks good."},
    )

    assert response.status_code == 200
    assert response.json()["previous_state"] == "draft"
    assert response.json()["next_state"] == "approved"

    drafts = client.get("/drafts").json()
    updated = next(draft for draft in drafts if draft["id"] == "draft-002")
    assert updated["approval_state"] == "approved"


def test_publish_plan_blocks_unapproved_draft() -> None:
    response = client.post("/approvals/drafts/draft-001/publish-plan")

    assert response.status_code == 200
    payload = response.json()
    assert payload["approved"] is False
    assert payload["gate_state"] == "blocked"
    assert "Approval is required" in payload["blockers"][0]


def test_publish_plan_uses_buffer_for_approved_draft(monkeypatch) -> None:
    client.post(
        "/approvals/drafts/draft-002",
        json={"decision": "approve", "reviewer": "Aleksandar", "notes": "Ready for dry-run."},
    )

    def fake_publish(request: BufferPublishRequest) -> BufferPublishResult:
        assert request.channel == "x"
        assert request.dry_run is True
        return BufferPublishResult(
            accepted=True,
            dry_run=True,
            channel=request.channel,
            target=BufferPublishTarget(
                channel_id="channel-x",
                service="twitter",
                name="AlgoProven",
                display_name="AlgoProven",
            ),
            scheduled_at=request.scheduled_at,
            text_length=len(request.text),
            notes=["Dry run only. No content was sent to Buffer."],
        )

    monkeypatch.setattr(approvals, "publish_to_buffer", fake_publish)
    response = client.post("/approvals/drafts/draft-002/publish-plan")

    assert response.status_code == 200
    payload = response.json()
    assert payload["approved"] is True
    assert payload["gate_state"] == "ready"
    assert payload["buffer"]["accepted"] is True
    assert payload["buffer"]["target"]["service"] == "twitter"
