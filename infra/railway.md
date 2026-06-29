# Railway Deployment Notes

Production services:

- Backend service: `elevatemindstudio`
- Frontend service: `splendid-clarity`

Service commands:

- API: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` from `apps/api`
- Web: `npm run start --workspace apps/web -- --hostname 0.0.0.0 --port 3000` from repo root
- `worker`: `python apps/worker/worker.py`

Production domains:

- API: `https://api.elevatemindstudio.net`
- Web app: `https://app.elevatemindstudio.net`

Required API variables:

- `APP_ENV`
- `BACKEND_BASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `CORS_ORIGIN=https://app.elevatemindstudio.net`
- Supabase variables when persistence is added
- Upstash variables when queue/locks are added

Required web variables:

- `NEXT_PUBLIC_APP_URL=https://app.elevatemindstudio.net`
- `NEXT_PUBLIC_API_BASE_URL=https://api.elevatemindstudio.net`

Frontend service root: leave empty / repo root. Do not set it to `apps/web`,
because the app depends on `packages/shared`.
