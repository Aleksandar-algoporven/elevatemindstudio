# Minimal Owner TODO

Only the external account items below need your action.

## 1. Loopia Static Upload

1. Open Loopia control panel.
2. Find or create the FTP/web-hosting login for `elevatemindstudio.net`.
3. Either upload `loopia-landing/dist` to `public_html` in the panel, or put the FTP username/password into the secret file as temporary local values.
4. Do not send the password in chat.
5. Tell Codex: `Loopia FTP je dodat` or `Loopia landing je uploadovan`.

Why: the Loopia DNS/API credential is not accepted by FTP, so the root domain still needs the new static landing upload.

## 2. Railway Token

1. Open Railway account settings.
2. Create a new account token.
3. Put it in `secrets/elevatemindstudio.local.env` as `RAILWAY_TOKEN`.
4. Do not send the token in chat.
5. Tell Codex: `Railway token je dodat`.

Why: the current token is not accepted by Railway CLI, so env updates cannot be automated.

## 3. LinkedIn Approval

1. Wait for LinkedIn Community Management API approval.
2. When approved, open the LinkedIn developer app.
3. Confirm scopes include `r_organization_social` and `w_organization_social`.
4. Generate/refresh the OAuth token for the AlgoProven page.
5. Put token values in the secret file.
6. Tell Codex: `LinkedIn odobren i token dodat`.

Why: without organization scopes, backend will continue to reject company/page publishing.

## 4. Discord Verification

1. Finish Discord developer verification/document request.
2. Open the target Discord server for ElevateMindStudio operations.
3. Copy the server ID into `DISCORD_GUILD_ID`.
4. Create or choose an alerts channel.
5. Copy the channel ID into `DISCORD_ALERTS_CHANNEL_ID`.
6. Tell Codex: `Discord server i channel ID dodati`.

Why: bot token is not enough; the backend also needs the server and alert channel.

## 5. Google / YouTube

1. Keep the Google OAuth app in External/Test mode until verification is required.
2. Keep the AlgoProven YouTube account as a test user.
3. If Google asks for verification, use:
   - Homepage: `https://elevatemindstudio.net`
   - Privacy: `https://elevatemindstudio.net/privacy/`
   - Terms: `https://elevatemindstudio.net/terms/`
4. Tell Codex if Google requests a new verification step.

## 6. Meta

1. Do nothing for now.
2. Keep Meta/Facebook/Instagram paused until LinkedIn, Discord, and the workspace workflow are stable.

Why: Meta setup adds review overhead and is not needed for the next MVP milestone.
