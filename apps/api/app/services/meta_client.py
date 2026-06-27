from typing import Any, Dict, List, Optional

import httpx

from app.models import MetaAsset, MetaStatus
from app.settings import settings


META_GRAPH_BASE_URL = "https://graph.facebook.com"


class MetaClient:
    def __init__(
        self,
        graph_api_version: str,
        app_id: str = "",
        app_secret: str = "",
        system_user_access_token: str = "",
        business_id: str = "",
        page_id: str = "",
        instagram_business_account_id: str = "",
        webhook_verify_token: str = "",
        base_url: str = META_GRAPH_BASE_URL,
        timeout: float = 15.0,
    ) -> None:
        self.graph_api_version = graph_api_version
        self.app_id = app_id
        self.app_secret = app_secret
        self.system_user_access_token = system_user_access_token
        self.business_id = business_id
        self.page_id = page_id
        self.instagram_business_account_id = instagram_business_account_id
        self.webhook_verify_token = webhook_verify_token
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def status(self) -> MetaStatus:
        notes = self._missing_notes()
        configured = any(
            [
                self.app_id,
                self.app_secret,
                self.system_user_access_token,
                self.business_id,
                self.page_id,
                self.instagram_business_account_id,
                self.webhook_verify_token,
            ]
        )

        if not self.system_user_access_token:
            return self._status(configured=configured, connected=False, notes=notes)

        try:
            business = self._asset(self.business_id, "id,name") if self.business_id else None
            page = self._asset(self.page_id, "id,name,username") if self.page_id else None
            instagram = (
                self._asset(self.instagram_business_account_id, "id,name,username")
                if self.instagram_business_account_id
                else None
            )

            if self.page_id and not self.instagram_business_account_id:
                linked_instagram = self._linked_instagram_asset(self.page_id)
                if linked_instagram:
                    instagram = linked_instagram
                    notes.append("Facebook Page has a linked Instagram Business Account; copy its id into META_IG_BUSINESS_ACCOUNT_ID.")

            return self._status(
                configured=True,
                connected=True,
                business=business,
                page=page,
                instagram_business_account=instagram,
                notes=notes,
            )
        except httpx.HTTPStatusError as exc:
            return self._status(
                configured=True,
                connected=False,
                notes=notes + [f"Meta Graph API returned HTTP {exc.response.status_code}."],
            )
        except (httpx.HTTPError, ValueError) as exc:
            return self._status(
                configured=True,
                connected=False,
                notes=notes + [f"Meta Graph API check failed: {exc.__class__.__name__}."],
            )

    def _asset(self, asset_id: str, fields: str) -> MetaAsset:
        payload = self._get(asset_id, fields)
        return MetaAsset(
            id=payload.get("id", asset_id),
            name=payload.get("name"),
            username=payload.get("username"),
        )

    def _linked_instagram_asset(self, page_id: str) -> Optional[MetaAsset]:
        payload = self._get(page_id, "instagram_business_account{id,name,username}")
        instagram = payload.get("instagram_business_account")
        if not isinstance(instagram, dict):
            return None
        return MetaAsset(
            id=instagram.get("id", ""),
            name=instagram.get("name"),
            username=instagram.get("username"),
        )

    def _get(self, path: str, fields: str) -> Dict[str, Any]:
        with httpx.Client(timeout=self.timeout) as client:
            response = client.get(
                f"{self.base_url}/{self.graph_api_version}/{path}",
                params={"fields": fields},
                headers={"Authorization": f"Bearer {self.system_user_access_token}"},
            )
            response.raise_for_status()
            payload = response.json()

        error = payload.get("error")
        if error:
            raise ValueError(error.get("message", "Unknown Meta Graph API error"))
        return payload

    def _missing_notes(self) -> List[str]:
        required = [
            ("META_APP_ID", self.app_id),
            ("META_APP_SECRET", self.app_secret),
            ("META_SYSTEM_USER_ACCESS_TOKEN", self.system_user_access_token),
            ("META_BUSINESS_ID", self.business_id),
            ("META_PAGE_ID", self.page_id),
            ("META_IG_BUSINESS_ACCOUNT_ID", self.instagram_business_account_id),
            ("META_WEBHOOK_VERIFY_TOKEN", self.webhook_verify_token),
        ]
        return [f"{key} is not set." for key, value in required if not value]

    def _status(
        self,
        configured: bool,
        connected: bool,
        notes: List[str],
        business: Optional[MetaAsset] = None,
        page: Optional[MetaAsset] = None,
        instagram_business_account: Optional[MetaAsset] = None,
    ) -> MetaStatus:
        return MetaStatus(
            configured=configured,
            connected=connected,
            graph_api_version=self.graph_api_version,
            app_configured=bool(self.app_id and self.app_secret),
            system_user_token_configured=bool(self.system_user_access_token),
            business_id_configured=bool(self.business_id),
            page_id_configured=bool(self.page_id),
            instagram_business_account_id_configured=bool(self.instagram_business_account_id),
            webhook_verify_token_configured=bool(self.webhook_verify_token),
            business=business,
            page=page,
            instagram_business_account=instagram_business_account,
            notes=notes,
        )


def get_meta_status() -> MetaStatus:
    return MetaClient(
        graph_api_version=settings.meta_graph_api_version,
        app_id=settings.meta_app_id,
        app_secret=settings.meta_app_secret,
        system_user_access_token=settings.meta_system_user_access_token,
        business_id=settings.meta_business_id,
        page_id=settings.meta_page_id,
        instagram_business_account_id=settings.meta_ig_business_account_id,
        webhook_verify_token=settings.meta_webhook_verify_token,
    ).status()
