import secrets
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

import httpx

from app.models import LinkedInAuthorizationUrl, LinkedInOAuthCallbackResult, LinkedInOrganization, LinkedInStatus
from app.settings import settings


LINKEDIN_API_BASE_URL = "https://api.linkedin.com"
LINKEDIN_AUTHORIZATION_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_DEFAULT_SCOPES = [
    "openid",
    "profile",
    "email",
    "w_member_social",
    "r_organization_social",
    "w_organization_social",
]


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
        scopes: Optional[List[str]] = None,
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
        self.scopes = scopes or LINKEDIN_DEFAULT_SCOPES
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

    def authorization_url(self) -> LinkedInAuthorizationUrl:
        notes = []
        if not self.client_id:
            notes.append("LINKEDIN_CLIENT_ID is not set.")
        if not self.redirect_uri:
            notes.append("LINKEDIN_REDIRECT_URI is not set.")
        if notes:
            return LinkedInAuthorizationUrl(
                configured=False,
                authorization_url=None,
                state=None,
                scopes=self.scopes,
                notes=notes,
            )

        state = secrets.token_urlsafe(24)
        query = urlencode(
            {
                "response_type": "code",
                "client_id": self.client_id,
                "redirect_uri": self.redirect_uri,
                "state": state,
                "scope": " ".join(self.scopes),
            }
        )
        return LinkedInAuthorizationUrl(
            configured=True,
            authorization_url=f"{LINKEDIN_AUTHORIZATION_URL}?{query}",
            state=state,
            scopes=self.scopes,
            notes=["Open this URL to authorize the LinkedIn app. The callback response will not expose token values."],
        )

    def exchange_code(self, code: str) -> LinkedInOAuthCallbackResult:
        missing = []
        if not self.client_id:
            missing.append("LINKEDIN_CLIENT_ID is not set.")
        if not self.client_secret:
            missing.append("LINKEDIN_CLIENT_SECRET is not set.")
        if not self.redirect_uri:
            missing.append("LINKEDIN_REDIRECT_URI is not set.")
        if missing:
            return LinkedInOAuthCallbackResult(
                success=False,
                exchange_performed=True,
                access_token_received=False,
                refresh_token_received=False,
                notes=missing,
            )

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(
                    LINKEDIN_TOKEN_URL,
                    data={
                        "grant_type": "authorization_code",
                        "code": code,
                        "redirect_uri": self.redirect_uri,
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )
                response.raise_for_status()
                payload = response.json()
        except httpx.HTTPStatusError as exc:
            return LinkedInOAuthCallbackResult(
                success=False,
                exchange_performed=True,
                access_token_received=False,
                refresh_token_received=False,
                notes=[f"LinkedIn token exchange returned HTTP {exc.response.status_code}."],
            )
        except (httpx.HTTPError, ValueError) as exc:
            return LinkedInOAuthCallbackResult(
                success=False,
                exchange_performed=True,
                access_token_received=False,
                refresh_token_received=False,
                notes=[f"LinkedIn token exchange failed: {exc.__class__.__name__}."],
            )

        return LinkedInOAuthCallbackResult(
            success=bool(payload.get("access_token")),
            authorization_code_received=True,
            exchange_performed=True,
            access_token_received=bool(payload.get("access_token")),
            refresh_token_received=bool(payload.get("refresh_token")),
            expires_in=payload.get("expires_in"),
            scope=payload.get("scope"),
            token_type=payload.get("token_type"),
            notes=[
                "Token exchange succeeded. Token values are intentionally not returned by this endpoint.",
                "Use the temporary local exchange workflow if you need Codex to write LINKEDIN_ACCESS_TOKEN into the secret file.",
            ],
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
        scopes=settings.linkedin_scope_list,
    ).status()


def get_linkedin_authorization_url() -> LinkedInAuthorizationUrl:
    return LinkedInClient(
        api_version=settings.linkedin_api_version,
        client_id=settings.linkedin_client_id,
        client_secret=settings.linkedin_client_secret,
        org_id=settings.linkedin_org_id,
        redirect_uri=settings.linkedin_redirect_uri,
        access_token=settings.linkedin_access_token,
        refresh_token=settings.linkedin_refresh_token,
        scopes=settings.linkedin_scope_list,
    ).authorization_url()


def exchange_linkedin_code(code: str) -> LinkedInOAuthCallbackResult:
    return LinkedInClient(
        api_version=settings.linkedin_api_version,
        client_id=settings.linkedin_client_id,
        client_secret=settings.linkedin_client_secret,
        org_id=settings.linkedin_org_id,
        redirect_uri=settings.linkedin_redirect_uri,
        access_token=settings.linkedin_access_token,
        refresh_token=settings.linkedin_refresh_token,
        scopes=settings.linkedin_scope_list,
    ).exchange_code(code)
