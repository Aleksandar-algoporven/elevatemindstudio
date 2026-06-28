from typing import Any, Dict, List, Optional

import httpx

from app.models import LinkedInOrganization, LinkedInStatus
from app.settings import settings


LINKEDIN_API_BASE_URL = "https://api.linkedin.com"


class LinkedInClient:
    def __init__(
        self,
        api_version: str,
        client_id: str = "",
        client_secret: str = "",
        org_id: str = "",
        redirect_uri: str = "",
        access_token: str = "",
        refresh_token: str = "",
        base_url: str = LINKEDIN_API_BASE_URL,
        timeout: float = 15.0,
    ) -> None:
        self.api_version = api_version
        self.client_id = client_id
        self.client_secret = client_secret
        self.org_id = org_id
        self.redirect_uri = redirect_uri
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def status(self) -> LinkedInStatus:
        notes = self._missing_notes()
        configured = any(
            [
                self.client_id,
                self.client_secret,
                self.org_id,
                self.redirect_uri,
                self.access_token,
                self.refresh_token,
            ]
        )

        if not self.access_token:
            return self._status(configured=configured, connected=False, notes=notes)

        try:
            organization = self._organization(self.org_id) if self.org_id else None
            if not self.org_id:
                notes.append("LINKEDIN_ORG_ID is required before organization publishing can be validated.")

            return self._status(
                configured=True,
                connected=True,
                organization=organization,
                notes=notes,
            )
        except httpx.HTTPStatusError as exc:
            return self._status(
                configured=True,
                connected=False,
                notes=notes + [f"LinkedIn API returned HTTP {exc.response.status_code}."],
            )
        except (httpx.HTTPError, ValueError) as exc:
            return self._status(
                configured=True,
                connected=False,
                notes=notes + [f"LinkedIn API check failed: {exc.__class__.__name__}."],
            )

    def _organization(self, org_id: str) -> LinkedInOrganization:
        payload = self._get(f"/rest/organizations/{org_id}")
        localized_name = payload.get("localizedName") or payload.get("name")
        return LinkedInOrganization(
            id=str(payload.get("id") or org_id),
            name=localized_name,
            vanity_name=payload.get("vanityName"),
        )

    def _get(self, path: str) -> Dict[str, Any]:
        with httpx.Client(timeout=self.timeout) as client:
            response = client.get(
                f"{self.base_url}{path}",
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "LinkedIn-Version": self.api_version,
                    "X-Restli-Protocol-Version": "2.0.0",
                },
            )
            response.raise_for_status()
            payload = response.json()

        if not isinstance(payload, dict):
            raise ValueError("LinkedIn API response was not an object.")
        return payload

    def _missing_notes(self) -> List[str]:
        required = [
            ("LINKEDIN_CLIENT_ID", self.client_id),
            ("LINKEDIN_CLIENT_SECRET", self.client_secret),
            ("LINKEDIN_ORG_ID", self.org_id),
            ("LINKEDIN_REDIRECT_URI", self.redirect_uri),
            ("LINKEDIN_ACCESS_TOKEN", self.access_token),
        ]
        return [f"{key} is not set." for key, value in required if not value]

    def _status(
        self,
        configured: bool,
        connected: bool,
        notes: List[str],
        organization: Optional[LinkedInOrganization] = None,
    ) -> LinkedInStatus:
        return LinkedInStatus(
            configured=configured,
            connected=connected,
            api_version=self.api_version,
            app_configured=bool(self.client_id and self.client_secret),
            org_id_configured=bool(self.org_id),
            redirect_uri_configured=bool(self.redirect_uri),
            access_token_configured=bool(self.access_token),
            refresh_token_configured=bool(self.refresh_token),
            organization=organization,
            notes=notes,
        )


def get_linkedin_status() -> LinkedInStatus:
    return LinkedInClient(
        api_version=settings.linkedin_api_version,
        client_id=settings.linkedin_client_id,
        client_secret=settings.linkedin_client_secret,
        org_id=settings.linkedin_org_id,
        redirect_uri=settings.linkedin_redirect_uri,
        access_token=settings.linkedin_access_token,
        refresh_token=settings.linkedin_refresh_token,
    ).status()
