from fastapi.testclient import TestClient

from app.main import app


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
