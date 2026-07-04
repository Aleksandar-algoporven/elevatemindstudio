# Minimal Owner TODO

Only external account/dashboard work remains here. Core app, API, Supabase, Railway deploy, workspace, AI draft generation, review gates, source intake, inbox triage, and readiness dashboard are already live.

## 1. Discord Server IDs

1. Finish Discord developer verification/document request if Discord still asks for it.
2. Open the target Discord server for ElevateMindStudio operations.
3. Enable Developer Mode in Discord.
4. Copy the server ID into `DISCORD_GUILD_ID`.
5. Create or choose an alerts channel.
6. Copy that channel ID into `DISCORD_ALERTS_CHANNEL_ID`.
7. Tell Codex: `Discord server i channel ID dodati`.

Why: bot credentials exist, but monitoring/alerts need the exact server and channel.

## 2. LinkedIn Organization Approval

1. Wait for LinkedIn Community Management API approval.
2. When approved, open the LinkedIn developer app.
3. Confirm scopes include `r_organization_social` and `w_organization_social`.
4. Use the workspace `LinkedIn OAuth` link or the API authorization URL.
5. Put refreshed token values in the secret file if needed.
6. Tell Codex: `LinkedIn odobren i token dodat`.

Why: without organization scopes, full company/page publishing and comment management stay limited.

## 3. YouTube Verification If Asked

1. Keep the Google OAuth app in External/Test mode unless Google requires verification.
2. Keep the AlgoProven YouTube account as a test user.
3. If Google asks for verification, use:
   - Homepage: `https://elevatemindstudio.net`
   - Privacy: `https://elevatemindstudio.net/privacy/`
   - Terms: `https://elevatemindstudio.net/terms/`
4. Tell Codex if Google requests a new verification step.

Why: YouTube OAuth is wired, but Google may still request app verification later.

## 4. Buffer Channels

1. Confirm every target social channel is connected inside Buffer.
2. Confirm Buffer has publish access for X/Twitter, Instagram, and YouTube where available.
3. Open `https://app.elevatemindstudio.net/workspace`.
4. Check `System readiness` and `Connectors`.
5. Tell Codex if Buffer shows missing channels.

Why: ElevateMindStudio validates publish routes through Buffer before any real posting is enabled.

## 5. Stripe Later

Stripe is intentionally skipped for now.

When billing becomes priority:

1. Create Stripe Product and recurring Price.
2. Add `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET`.
3. Tell Codex: `Stripe billing vrednosti dodate`.

## 6. Meta Later

Meta/Facebook/Instagram direct API setup stays paused until LinkedIn, Discord, Buffer, and the workspace workflow are stable.

Why: Meta review adds overhead and is not needed for the next MVP milestone while Buffer covers the first publishing bridge.
