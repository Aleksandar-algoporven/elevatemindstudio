import secrets
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

import httpx

from app.models import YouTubeAuthorizationUrl, YouTubeChannel, YouTubeOAuthCallbackResult, YouTubeStatus
from app.settings import settings


YOUTUBE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token"
YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3"
YOUTUBE_DEFAULT_SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]


class YouTubeClient:
    def __init__(
        self,
        client_id: str = "",
        client_secret: str = "",
        refresh_token: str = "",
        channel_id: str = "",
        redirect_uri: str = "",
        scopes: Optional[List[str]] = None,
        timeout: float = 15.0,
    ) -> None:
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.channel_id = channel_id
        self.redirect_uri = redirect_uri
        self.scopes = scopes or YOUTUBE_DEFAULT_SCOPES
        self.timeout = timeout

    def status(self) -> YouTubeStatus:
        notes = self._missing_notes()
        configured = any(
            [
                self.client_id,
                self.client_secret,
                self.refresh_token,
                self.channel_id,
                self.redirect_uri,
            ]
        )

        if not (self.client_id and self.client_secret and self.refresh_token):
            return self._status(configured=configured, connected=False, notes=notes)

        try:
            access_token = self._access_token()
            channel = self._channel(access_token)
            return self._status(configured=True, connected=True, channel=channel, notes=notes)
        except httpx.HTTPStatusError as exc:
            return self._status(
                configured=True,
                connected=False,
                notes=notes + [f"YouTube API returned HTTP {exc.response.status_code}."],
            )
        except (httpx.HTTPError, ValueError) as exc:
            return self._status(
                configured=True,
                connected=False,
                notes=notes + [f"YouTube API check failed: {exc.__class__.__name__}."],
            )

    def authorization_url(self) -> YouTubeAuthorizationUrl:
        notes = []
        if not self.client_id:
            notes.append("YOUTUBE_CLIENT_ID is not set.")
        if not self.redirect_uri:
            notes.append("YOUTUBE_REDIRECT_URI is not set.")
        if notes:
            return YouTubeAuthorizationUrl(
                configured=False,
                authorization_url=None,
                state=None,
                scopes=self.scopes,
                notes=notes,
            )

        state = secrets.token_urlsafe(24)
        query = urlencode(
            {
                "client_id": self.client_id,
                "redirect_uri": self.redirect_uri,
                "response_type": "code",
                "scope": " ".join(self.scopes),
                "access_type": "offline",
                "prompt": "consent",
                "include_granted_scopes": "true",
                "state": state,
            }
        )
        return YouTubeAuthorizationUrl(
            configured=True,
            authorization_url=f"{YOUTUBE_AUTHORIZATION_URL}?{query}",
            state=state,
            scopes=self.scopes,
            notes=["Open this URL to authorize YouTube. The callback response will not expose token values."],
        )

    def exchange_code(self, code: str) -> YouTubeOAuthCallbackResult:
        missing = []
        if not self.client_id:
            missing.append("YOUTUBE_CLIENT_ID is not set.")
        if not self.client_secret:
            missing.append("YOUTUBE_CLIENT_SECRET is not set.")
        if not self.redirect_uri:
            missing.append("YOUTUBE_REDIRECT_URI is not set.")
        if missing:
            return YouTubeOAuthCallbackResult(
                success=False,
                exchange_performed=True,
                access_token_received=False,
                refresh_token_received=False,
                notes=missing,
            )

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(
                    YOUTUBE_TOKEN_URL,
                    data={
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": self.redirect_uri,
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )
                response.raise_for_status()
                payload = response.json()
        except httpx.HTTPStatusError as exc:
            return YouTubeOAuthCallbackResult(
                success=False,
                exchange_performed=True,
                access_token_received=False,
                refresh_token_received=False,
                notes=[f"YouTube token exchange returned HTTP {exc.response.status_code}."],
            )
        except (httpx.HTTPError, ValueError) as exc:
            return YouTubeOAuthCallbackResult(
                success=False,
                exchange_performed=True,
                access_token_received=False,
                refresh_token_received=False,
                notes=[f"YouTube token exchange failed: {exc.__class__.__name__}."],
            )

        return YouTubeOAuthCallbackResult(
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
                "Use a local exchange workflow to write YOUTUBE_REFRESH_TOKEN without displaying it.",
            ],
        )

    def _access_token(self) -> str:
        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                YOUTUBE_TOKEN_URL,
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "refresh_token": self.refresh_token,
                    "grant_type": "refresh_token",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            payload = response.json()

        access_token = payload.get("access_token")
        if not isinstance(access_token, str) or not access_token:
            raise ValueError("YouTube token response did not include an access token.")
        return access_token

    def _channel(self, access_token: str) -> YouTubeChannel:
        params: Dict[str, str] = {"part": "snippet"}
        if self.channel_id:
            params["id"] = self.channel_id
        else:
            params["mine"] = "true"

        payload = self._get("/channels", access_token, params)
        items = payload.get("items")
        if not isinstance(items, list) or not items:
            raise ValueError("YouTube channel was not found.")

        item = items[0]
        snippet = item.get("snippet") if isinstance(item, dict) else {}
        if not isinstance(snippet, dict):
            snippet = {}
        return YouTubeChannel(
            id=str(item.get("id") or self.channel_id),
            title=snippet.get("title"),
            custom_url=snippet.get("customUrl"),
        )

    def _get(self, path: str, access_token: str, params: Dict[str, str]) -> Dict[str, Any]:
        with httpx.Client(timeout=self.timeout) as client:
            response = client.get(
                f"{YOUTUBE_API_BASE_URL}{path}",
                params=params,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            payload = response.json()

        if not isinstance(payload, dict):
            raise ValueError("YouTube API response was not an object.")
        return payload

    def _missing_notes(self) -> List[str]:
        required = [
            ("YOUTUBE_CLIENT_ID", self.client_id),
            ("YOUTUBE_CLIENT_SECRET", self.client_secret),
            ("YOUTUBE_REFRESH_TOKEN", self.refresh_token),
            ("YOUTUBE_CHANNEL_ID", self.channel_id),
        ]
        return [f"{key} is not set." for key, value in required if not value]

    def _status(
        self,
        configured: bool,
        connected: bool,
        notes: List[str],
        channel: Optional[YouTubeChannel] = None,
    ) -> YouTubeStatus:
        return YouTubeStatus(
            configured=configured,
            connected=connected,
            client_configured=bool(self.client_id and self.client_secret),
            refresh_token_configured=bool(self.refresh_token),
            channel_id_configured=bool(self.channel_id),
            redirect_uri_configured=bool(self.redirect_uri),
            channel=channel,
            notes=notes,
        )


def get_youtube_status() -> YouTubeStatus:
    return YouTubeClient(
        client_id=settings.youtube_client_id,
        client_secret=settings.youtube_client_secret,
        refresh_token=settings.youtube_refresh_token,
        channel_id=settings.youtube_channel_id,
        redirect_uri=settings.youtube_redirect_uri,
        scopes=settings.youtube_scope_list,
    ).status()


def get_youtube_authorization_url() -> YouTubeAuthorizationUrl:
    return YouTubeClient(
        client_id=settings.youtube_client_id,
        client_secret=settings.youtube_client_secret,
        refresh_token=settings.youtube_refresh_token,
        channel_id=settings.youtube_channel_id,
        redirect_uri=settings.youtube_redirect_uri,
        scopes=settings.youtube_scope_list,
    ).authorization_url()


def exchange_youtube_code(code: str) -> YouTubeOAuthCallbackResult:
    return YouTubeClient(
        client_id=settings.youtube_client_id,
        client_secret=settings.youtube_client_secret,
        refresh_token=settings.youtube_refresh_token,
        channel_id=settings.youtube_channel_id,
        redirect_uri=settings.youtube_redirect_uri,
        scopes=settings.youtube_scope_list,
    ).exchange_code(code)
