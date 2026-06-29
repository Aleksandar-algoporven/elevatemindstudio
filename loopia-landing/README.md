# Loopia landing

Static public landing for `elevatemindstudio.net`.

The dynamic workspace remains on Railway, with Vercel also deployed as a web
production alias:

- `https://app.elevatemindstudio.net/workspace`
- `https://api.elevatemindstudio.net`
- `https://elevatemindstudio-web.vercel.app`

Deploy:

```sh
FTP_HOST=ftpcluster.loopia.se FTP_USER=... FTP_PASS=... node loopia-landing/scripts/deploy.mjs
```

The deploy clears `/public_html` before upload.

Do not upload a custom `.htaccess` unless it has been tested on Loopia first.
The static landing works without one, and unsupported directives can produce
HTTP 500 on the Loopia front end.
