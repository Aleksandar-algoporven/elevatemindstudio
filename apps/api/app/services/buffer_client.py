from typing import Any, Dict, List, Optional

import httpx

from app.models import BufferChannel, BufferPublishRequest, BufferPublishResult, BufferPublishTarget, BufferStatus
from app.settings import settings


BUFFER_API_URL = "https://api.buffer.com"


ACCOUNT_QUERY = """
query BufferAccount {
  account {
    organizations {
      id
      name
    }
  }
}
"""


CHANNELS_QUERY = """
query BufferChannels($input: ChannelsInput!) {
  channels(input: $input) {
    id
    service
    name
    displayName
    descriptor
    type
    isDisconnected
    isLocked
    allowedActions
    products
  }
}
"""


BUFFER_SERVICE_BY_CHANNEL = {
    "instagram": "instagram",
    "youtube": "youtube",
    "x": "twitter",
}


class BufferClient:
    def __init__(
        self,
        access_token: str,
        organization_id: str = "",
        api_url: str = BUFFER_API_URL,
        timeout: float = 15.0,
    ) -> None:
        self.access_token = access_token
        self.organization_id = organization_id
        self.api_url = api_url
        self.timeout = timeout

    def status(self) -> BufferStatus:
        if not self.access_token:
            return BufferStatus(
                configured=False,
                connected=False,
                channels_count=0,
                channels=[],
                notes=["BUFFER_ACCESS_TOKEN is not set."],
            )

        try:
            account_data = self._graphql(ACCOUNT_QUERY)
            organizations = account_data.get("account", {}).get("organizations") or []
            organization = self._select_organization(organizations)
            if organization is None:
                return BufferStatus(
                    configured=True,
                    connected=False,
                    channels_count=0,
                    channels=[],
                    notes=["Buffer token is valid, but no organizations were returned."],
                )

            channels_data = self._graphql(
                CHANNELS_QUERY,
                variables={"input": {"organizationId": organization["id"]}},
            )
            channels = [self._to_channel(channel) for channel in channels_data.get("channels") or []]
            notes = []
            if not channels:
                notes.append("Buffer token is valid, but no channels are connected in this organization.")

            return BufferStatus(
                configured=True,
                connected=True,
                organization_id=organization["id"],
                organization_name=organization.get("name") or "",
                channels_count=len(channels),
                channels=channels,
                notes=notes,
            )
        except httpx.HTTPStatusError as exc:
            return BufferStatus(
                configured=True,
                connected=False,
                channels_count=0,
                channels=[],
                notes=[f"Buffer API returned HTTP {exc.response.status_code}."],
            )
        except (httpx.HTTPError, ValueError) as exc:
            return BufferStatus(
                configured=True,
                connected=False,
                channels_count=0,
                channels=[],
                notes=[f"Buffer API check failed: {exc.__class__.__name__}."],
            )

    def publish(self, request: BufferPublishRequest) -> BufferPublishResult:
        status = self.status()
        notes = list(status.notes)
        service = BUFFER_SERVICE_BY_CHANNEL.get(request.channel)
        if not service:
            return BufferPublishResult(
                accepted=False,
                dry_run=request.dry_run,
                channel=request.channel,
                scheduled_at=request.scheduled_at,
                text_length=len(request.text),
                notes=notes + [f"Buffer publishing is not mapped for channel '{request.channel}'."],
            )

        if not status.connected:
            return BufferPublishResult(
                accepted=False,
                dry_run=request.dry_run,
                channel=request.channel,
                scheduled_at=request.scheduled_at,
                text_length=len(request.text),
                notes=notes + ["Buffer is not connected."],
            )

        target = self._select_publish_channel(status.channels, service)
        if target is None:
            return BufferPublishResult(
                accepted=False,
                dry_run=request.dry_run,
                channel=request.channel,
                scheduled_at=request.scheduled_at,
                text_length=len(request.text),
                notes=notes + [f"No Buffer channel with publish access was found for service '{service}'."],
            )

        if not request.dry_run:
            return BufferPublishResult(
                accepted=False,
                dry_run=False,
                channel=request.channel,
                target=target,
                scheduled_at=request.scheduled_at,
                text_length=len(request.text),
                notes=notes + ["Real Buffer publishing is disabled until the dry-run workflow is approved."],
            )

        return BufferPublishResult(
            accepted=True,
            dry_run=True,
            channel=request.channel,
            target=target,
            scheduled_at=request.scheduled_at,
            text_length=len(request.text),
            notes=notes + ["Dry run only. No content was sent to Buffer."],
        )

    def _graphql(self, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                self.api_url,
                json={"query": query, "variables": variables or {}},
                headers={"Authorization": f"Bearer {self.access_token}"},
            )
            response.raise_for_status()
            payload = response.json()

        errors = payload.get("errors")
        if errors:
            first_error = errors[0].get("message", "Unknown Buffer GraphQL error")
            raise ValueError(first_error)

        data = payload.get("data")
        if not isinstance(data, dict):
            raise ValueError("Buffer API response did not include data.")
        return data

    def _select_organization(self, organizations: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if self.organization_id:
            for organization in organizations:
                if organization.get("id") == self.organization_id:
                    return organization
            return None
        return organizations[0] if organizations else None

    def _to_channel(self, channel: Dict[str, Any]) -> BufferChannel:
        return BufferChannel(
            id=channel.get("id", ""),
            service=channel.get("service") or "",
            name=channel.get("name") or "",
            display_name=channel.get("displayName") or channel.get("name") or "",
            descriptor=channel.get("descriptor") or "",
            channel_type=channel.get("type") or "",
            is_disconnected=bool(channel.get("isDisconnected")),
            is_locked=bool(channel.get("isLocked")),
            allowed_actions=channel.get("allowedActions") or [],
            products=channel.get("products") or [],
        )

    def _select_publish_channel(self, channels: List[BufferChannel], service: str) -> Optional[BufferPublishTarget]:
        for channel in channels:
            if channel.service != service:
                continue
            if channel.is_disconnected or channel.is_locked:
                continue
            if "publish" not in channel.products:
                continue
            return BufferPublishTarget(
                channel_id=channel.id,
                service=channel.service,
                name=channel.name,
                display_name=channel.display_name,
            )
        return None


def get_buffer_status() -> BufferStatus:
    return BufferClient(
        access_token=settings.buffer_access_token,
        organization_id=settings.buffer_organization_id,
    ).status()


def publish_to_buffer(request: BufferPublishRequest) -> BufferPublishResult:
    return BufferClient(
        access_token=settings.buffer_access_token,
        organization_id=settings.buffer_organization_id,
    ).publish(request)
