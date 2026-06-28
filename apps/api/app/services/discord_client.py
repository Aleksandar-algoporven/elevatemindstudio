from typing import Any, Dict, List, Optional

import httpx

from app.models import DiscordBot, DiscordChannel, DiscordGuild, DiscordStatus
from app.settings import settings


DISCORD_API_BASE_URL = "https://discord.com/api/v10"


class DiscordClient:
    def __init__(
        self,
        bot_token: str = "",
        application_id: str = "",
        public_key: str = "",
        guild_id: str = "",
        alerts_channel_id: str = "",
        base_url: str = DISCORD_API_BASE_URL,
        timeout: float = 15.0,
    ) -> None:
        self.bot_token = bot_token
        self.application_id = application_id
        self.public_key = public_key
        self.guild_id = guild_id
        self.alerts_channel_id = alerts_channel_id
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def status(self) -> DiscordStatus:
        notes = self._missing_notes()
        configured = any(
            [
                self.bot_token,
                self.application_id,
                self.public_key,
                self.guild_id,
                self.alerts_channel_id,
            ]
        )

        if not self.bot_token:
            return self._status(configured=configured, connected=False, notes=notes)

        try:
            bot_payload = self._get("/users/@me")
            bot = DiscordBot(id=bot_payload.get("id", ""), username=bot_payload.get("username", ""))

            guild = self._guild(self.guild_id) if self.guild_id else None
            alerts_channel = self._channel(self.alerts_channel_id) if self.alerts_channel_id else None

            if self.guild_id and guild is None:
                notes.append("Bot token is valid, but the configured guild could not be read.")
            if self.alerts_channel_id and alerts_channel is None:
                notes.append("Bot token is valid, but the configured alerts channel could not be read.")

            return self._status(
                configured=True,
                connected=True,
                bot=bot,
                guild=guild,
                alerts_channel=alerts_channel,
                notes=notes,
            )
        except httpx.HTTPStatusError as exc:
            return self._status(
                configured=True,
                connected=False,
                notes=notes + [f"Discord API returned HTTP {exc.response.status_code}."],
            )
        except (httpx.HTTPError, ValueError) as exc:
            return self._status(
                configured=True,
                connected=False,
                notes=notes + [f"Discord API check failed: {exc.__class__.__name__}."],
            )

    def _guild(self, guild_id: str) -> Optional[DiscordGuild]:
        payload = self._get(f"/guilds/{guild_id}")
        return DiscordGuild(id=payload.get("id", guild_id), name=payload.get("name"))

    def _channel(self, channel_id: str) -> Optional[DiscordChannel]:
        payload = self._get(f"/channels/{channel_id}")
        return DiscordChannel(
            id=payload.get("id", channel_id),
            name=payload.get("name"),
            channel_type=payload.get("type"),
        )

    def _get(self, path: str) -> Dict[str, Any]:
        with httpx.Client(timeout=self.timeout) as client:
            response = client.get(
                f"{self.base_url}{path}",
                headers={"Authorization": f"Bot {self.bot_token}"},
            )
            response.raise_for_status()
            payload = response.json()

        if not isinstance(payload, dict):
            raise ValueError("Discord API response was not an object.")
        return payload

    def _missing_notes(self) -> List[str]:
        required = [
            ("DISCORD_BOT_TOKEN", self.bot_token),
            ("DISCORD_APPLICATION_ID", self.application_id),
            ("DISCORD_PUBLIC_KEY", self.public_key),
            ("DISCORD_GUILD_ID", self.guild_id),
            ("DISCORD_ALERTS_CHANNEL_ID", self.alerts_channel_id),
        ]
        return [f"{key} is not set." for key, value in required if not value]

    def _status(
        self,
        configured: bool,
        connected: bool,
        notes: List[str],
        bot: Optional[DiscordBot] = None,
        guild: Optional[DiscordGuild] = None,
        alerts_channel: Optional[DiscordChannel] = None,
    ) -> DiscordStatus:
        return DiscordStatus(
            configured=configured,
            connected=connected,
            bot_token_configured=bool(self.bot_token),
            application_id_configured=bool(self.application_id),
            public_key_configured=bool(self.public_key),
            guild_id_configured=bool(self.guild_id),
            alerts_channel_id_configured=bool(self.alerts_channel_id),
            bot=bot,
            guild=guild,
            alerts_channel=alerts_channel,
            notes=notes,
        )


def get_discord_status() -> DiscordStatus:
    return DiscordClient(
        bot_token=settings.discord_bot_token,
        application_id=settings.discord_application_id,
        public_key=settings.discord_public_key,
        guild_id=settings.discord_guild_id,
        alerts_channel_id=settings.discord_alerts_channel_id,
    ).status()
