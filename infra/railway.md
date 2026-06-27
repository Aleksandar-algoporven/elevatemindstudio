# Railway Deployment Notes

Planned services:

- `api`: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` from `apps/api`
- `web`: `npm run start --workspace apps/web -- --hostname 0.0.0.0 --port 3000` from repo root
- `worker`: `python apps/worker/worker.py`

Required variables:

- `APP_ENV`
- `BACKEND_BASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- Supabase variables when persistence is added
- Upstash variables when queue/locks are added

Temporary frontend hosting:

- Use Railway for the web app until Vercel account/token is active.
- Service root: leave empty / repo root. Do not set it to `apps/web`, because the app depends on `packages/shared`.
- Build command: `npm install && npm run build --workspace apps/web`
- Start command: `npm run start --workspace apps/web -- --hostname 0.0.0.0 --port 3000`
- Public domain target: `app.elevatemindstudio.net`
- Required variables:
  - `NEXT_PUBLIC_APP_URL=https://app.elevatemindstudio.net`
  - `NEXT_PUBLIC_API_BASE_URL=https://api.elevatemindstudio.net`
