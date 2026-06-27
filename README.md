# ElevateMindStudio

AI-native social media operating system for brand memory, source ingestion, campaign planning, approval-first publishing, inbox handling, and performance learning.

## What Is In This Repo

- `apps/web` - Next.js admin control room
- `apps/api` - FastAPI backend and Claude integration
- `apps/worker` - background worker skeleton for scheduled jobs
- `packages/shared` - shared TypeScript domain types
- `docs` - architecture and development notes
- `infra` - deployment notes/config stubs

## Local Development

1. Install JavaScript dependencies:

```bash
npm install
```

2. Create local secrets:

```bash
cp .env.example secrets/elevatemindstudio.local.env
```

3. Fill only the values you actually have. Keep `ANTHROPIC_API_KEY` local and rotate it before production.

4. Start the API:

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

5. Start the web app:

```bash
npm run dev --workspace apps/web
```

Open `http://localhost:3000`.

## Current MVP Scope

- Brand control room UI
- Source and content pipeline overview
- Draft queue and publishing calendar mock data
- FastAPI health, brand, draft, calendar, channels, sources, inbox, approval, and AI generation endpoints
- Claude API adapter behind `ANTHROPIC_API_KEY`
- Safe fallback response when the API key is not configured

## Current Development Note

Frontend `typecheck` and `lint` pass, and API tests pass. Production `next build` currently needs the Next/React dependency line cleaned up after the blocked package update; use the dev server while this is being resolved.

## Safety Rules

- Never commit `secrets/`, `.env`, or real API keys.
- Use approval-first publishing until direct social connector policy is verified.
- Keep Reddit manual-first until commercial automation rules are confirmed.
- Rotate the current development Anthropic key before any public deploy.
