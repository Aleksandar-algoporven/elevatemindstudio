# Railway Deployment Notes

Planned services:

- `api`: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` from `apps/api`
- `web`: `npm run start -- --hostname 0.0.0.0 --port $PORT` from `apps/web`
- `worker`: `python apps/worker/worker.py`

Required variables:

- `APP_ENV`
- `BACKEND_BASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- Supabase variables when persistence is added
- Upstash variables when queue/locks are added

Temporary frontend hosting:

- Use Railway for `apps/web` until Vercel account/token is active.
- Service root: `apps/web`
- Public domain target: `app.elevatemindstudio.net`
- Required variables:
  - `NEXT_PUBLIC_APP_URL=https://app.elevatemindstudio.net`
  - `NEXT_PUBLIC_API_BASE_URL=https://api.elevatemindstudio.net`
