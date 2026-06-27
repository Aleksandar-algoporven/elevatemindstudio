# Railway Deployment Notes

Planned services:

- `api`: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` from `apps/api`
- `worker`: `python apps/worker/worker.py`

Required variables:

- `APP_ENV`
- `BACKEND_BASE_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- Supabase variables when persistence is added
- Upstash variables when queue/locks are added
