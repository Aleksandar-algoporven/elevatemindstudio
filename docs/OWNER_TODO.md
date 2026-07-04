# Minimal Owner TODO

Only the external account/dashboard items below need your action.

## 1. Supabase Migration

Option A - easiest:

1. Open Supabase Dashboard.
2. Open the ElevateMindStudio project.
3. Go to SQL Editor.
4. Open local file `infra/supabase/migrations/20260704_0001_social_os_core.sql`.
5. Paste the full SQL into Supabase SQL Editor.
6. Click Run.
7. Tell Codex: `Supabase migracija izvrsena`.

Option B - if you want Codex to run it:

1. Open Supabase Dashboard -> Project Settings -> Database -> Connection string.
2. Copy the URI or Session pooler connection string.
3. Put it in `secrets/elevatemindstudio.local.env` as `DATABASE_URL`.
4. Do not send the password in chat.
5. Tell Codex: `DATABASE_URL dodat`.

Why: backend already has Supabase env on Railway and is ready, but the tables are not created yet.

## 2. Stripe Test Billing

1. Open Stripe Dashboard in test mode.
2. Create Product: `ElevateMindStudio MVP`.
3. Create recurring Price for the first plan.
4. Put the price id in `STRIPE_PRICE_ID`.
5. Put the test secret key in `STRIPE_SECRET_KEY`.
6. Open Developers -> Webhooks -> endpoint `https://app.elevatemindstudio.net/api/billing/webhook`.
7. Copy signing secret into `STRIPE_WEBHOOK_SECRET`.
8. Tell Codex: `Stripe billing vrednosti dodate`.

Why: checkout route is deployed, but intentionally returns 503 until Stripe key and price id exist.

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
