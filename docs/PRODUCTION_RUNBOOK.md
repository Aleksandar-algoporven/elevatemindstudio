# ElevateMindStudio Production Runbook

## Live Surfaces

- Public landing: `https://elevatemindstudio.net`
- Legal pages: `https://elevatemindstudio.net/privacy/`, `https://elevatemindstudio.net/terms/`
- Operator workspace: `https://app.elevatemindstudio.net/workspace`
- API health: `https://api.elevatemindstudio.net/health`
- API readiness: `https://api.elevatemindstudio.net/ops/readiness`
- Vercel alias: `https://elevatemindstudio-web.vercel.app`

## Hosting Map

- Loopia serves the static public root site.
- Railway serves the production API and the current app workspace.
- Vercel serves a production web alias and can replace the Railway frontend later.
- GitHub `main` is the deployment source.

## DNS Map

- `elevatemindstudio.net` -> Loopia web hosting
- `app.elevatemindstudio.net` -> Railway frontend service
- `api.elevatemindstudio.net` -> Railway backend service

Do not change root, `www`, or mail DNS records without explicit confirmation.

## Deploy Commands

Run the full local check before publishing:

```bash
npm run typecheck
npm run lint
npm run build
npm run test:api
```

Deploy Vercel alias when needed:

```bash
npx vercel deploy --prod --yes --force --with-cache --logs
```

Deploy Loopia static landing after changing `loopia-landing/dist`:

```bash
FTP_HOST=ftpcluster.loopia.se \
FTP_USER="..." \
FTP_PASS="..." \
node loopia-landing/scripts/deploy.mjs
```

Use Loopia FTP/web-hosting credentials here. Loopia DNS/API credentials are used for DNS automation, not necessarily for file upload.

Current note: Loopia static upload uses `FTP_HOST`, `FTP_USER`, and `FTP_PASS` from the local secret file. The DNS/API credentials are separate and should not be assumed to work for file upload.

Railway CLI is usable with the local `RAILWAY_TOKEN` in the secret file.

## Current Connector State

- Buffer: connected as MVP publishing bridge; real publishing remains gated.
- YouTube: OAuth/channel flow is wired for AlgoProven.
- LinkedIn: waiting for Community Management API approval.
- Discord: bot credentials are wired; guild/channel IDs depend on verification/server setup.
- Meta/Facebook/Instagram: intentionally paused for now.

## Current Product Surface

- Brand guardrails editor.
- Source intake.
- Manual draft composer.
- Claude draft generation saved to Supabase as `needs_review`.
- Review controls: approve, request changes, reject.
- Scheduling controls.
- Queue dry-run gate through Buffer.
- Inbox triage with suggested replies and handled state.
- Operational readiness dashboard.

## Safety Gate

Autonomy level remains `1`:

- AI drafts content.
- Human approves content.
- System validates a publish route.
- Real publishing stays disabled until we explicitly accept the workflow.
