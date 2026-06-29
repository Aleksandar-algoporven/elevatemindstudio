# Vercel Deployment Notes

Project: `elevatemindstudio-web`

Production alias: `https://elevatemindstudio-web.vercel.app`

Project root: `apps/web`

Required variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `GA4_MEASUREMENT_ID`
- `GTM_CONTAINER_ID`

Current required public variables:

- `NEXT_PUBLIC_APP_URL=https://app.elevatemindstudio.net`
- `NEXT_PUBLIC_API_BASE_URL=https://api.elevatemindstudio.net`

Deploy:

```bash
npx vercel deploy --prod --yes --force --with-cache --logs
```

Use `--force` when a commit does not touch `apps/web`, because Vercel's
monorepo "skip unaffected projects" setting cancels those deployments.

DNS remains in Loopia:

- `elevatemindstudio.net` and `www.elevatemindstudio.net` serve the static Loopia landing.
- `app.elevatemindstudio.net` currently points to the Railway web service.
- Keep `elevatemindstudio-web.vercel.app` as the Vercel production alias unless the app domain is intentionally moved from Railway to Vercel.
