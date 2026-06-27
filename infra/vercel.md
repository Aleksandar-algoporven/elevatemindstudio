# Vercel Deployment Notes

Project root: `apps/web`

Required variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `GA4_MEASUREMENT_ID`
- `GTM_CONTAINER_ID`

DNS stays in Loopia while building. Point:

- `www.elevatemindstudio.net` to the Vercel landing/admin target
- `app.elevatemindstudio.net` to the Vercel admin target if split later
