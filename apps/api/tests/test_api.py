from fastapi.testclient import TestClient

from app.main import app
from app.services.buffer_client import BufferClient
from app.services.discord_client import DiscordClient
from app.services.linkedin_client import LinkedInClient
from app.services.meta_client import MetaClient


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
