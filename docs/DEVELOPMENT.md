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

## Known Build Note

`npm run typecheck --workspace apps/web` and `npm run lint --workspace apps/web` pass. `npm run build --workspace apps/web` is currently blocked by a Next/React dependency mismatch introduced while trying to update Next to a patched audit-safe version. Finish by installing a clean Next patch line, then rerun build and `npm audit`.

## Secrets

Use `secrets/elevatemindstudio.local.env` locally. Never commit it. Rotate the current development `ANTHROPIC_API_KEY` before the first public deploy.
