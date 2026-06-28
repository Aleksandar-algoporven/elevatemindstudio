# Development Notes

## First Milestone

The first milestone is not full social publishing. It is a working control room with:

- brand memory shell
- source overview
- draft generation endpoint
- channel/source/inbox/approval endpoints
- approval queue UI
- publishing calendar UI
- worker placeholders
- safe env handling

## Local Commands

```bash
npm install
npm run dev --workspace apps/web
```

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## API Smoke Tests

```bash
cd apps/api
python3 -m pytest
```

## MVP API Surface

- `GET /health`
- `GET /brands/active`
- `GET /drafts`
- `POST /drafts/generate`
- `GET /calendar`
- `GET /channels`
- `GET /sources`
- `GET /inbox`
- `POST /approvals/drafts/{draft_id}`
- `GET /integrations/buffer/status`
- `POST /integrations/buffer/publish`
- `GET /integrations/youtube/status`
- `GET /integrations/discord/status`
- `GET /integrations/linkedin/status`
- `GET /integrations/meta/status`

## Web Routes

- `/`: public product site.
- `/workspace`: operator control room.
- `/privacy`: Privacy Policy.
- `/terms`: Terms of Service.

## Current Build Note

`npm run typecheck`, `npm run lint`, and `npm run build` should pass before every deploy. API tests should be run from `apps/api` with `.venv/bin/python -m pytest tests`.

## Secrets

Use `secrets/elevatemindstudio.local.env` locally. Never commit it. Rotate the current development `ANTHROPIC_API_KEY` before the first public deploy.
