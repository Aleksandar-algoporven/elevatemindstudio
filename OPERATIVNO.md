# ElevateMindStudio - operativna mapa

Ovaj fajl je tvoj dnevni orijentir: gde su fajlovi, koje rute postoje, koje naloge otvaras i sta meni vracas.

## 1. Glavne lokacije

Project folder:

```txt
/Users/aleksandar/Library/CloudStorage/GoogleDrive-aleksandardj@gmail.com/My Drive/0. PROJEKTI/1. ELEVATE MIND STUDIO
```

Secret file:

```txt
/Users/aleksandar/Library/CloudStorage/GoogleDrive-aleksandardj@gmail.com/My Drive/0. PROJEKTI/1. ELEVATE MIND STUDIO/secrets/elevatemindstudio.local.env
```

Repo:

```txt
https://github.com/Aleksandar-algoporven/elevatemindstudio
```

## 2. Operativni fajlovi

- `OPERATIVNO.md` - ovaj fajl, kratka mapa za rad.
- `moji_zadatci.md` - detaljna lista naloga, API kljuceva, cena i redosleda setup-a.
- `codex_socialmedia_os.md` - velika strategija proizvoda, arhitektura, workflow-i, landing i saveti.
- `.env.example` - javni template varijabli, bez tajni.
- `secrets/elevatemindstudio.local.env` - lokalni tajni fajl koji punis tokenima.
- `docs/ARCHITECTURE.md` - tehnicka arhitektura.
- `docs/DEVELOPMENT.md` - lokalni development i API surface.
- `docs/BRAND_ASSETS.md` - finalni logo pack i pravila upotrebe.
- `docs/PRODUCTION_RUNBOOK.md` - live surfaces, deploy komande i safety gate.
- `docs/OWNER_TODO.md` - minimalni zadaci za Aleksandra, bez internog suma.
- `infra/railway.md` - Railway deploy beleske.
- `infra/vercel.md` - Vercel deploy beleske.

## 3. Kod i rute

Frontend:

```txt
apps/web
```

Backend API:

```txt
apps/api
```

Postojece backend rute:

- `GET /health`
- `GET /brands/active`
- `GET /drafts`
- `POST /drafts/generate`
- `GET /calendar`
- `GET /channels`
- `GET /sources`
- `GET /inbox`
- `POST /approvals/drafts/{draft_id}`

Railway backend root:

```txt
apps/api
```

Railway start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## 4. Nalozi - sta prvo otvaras

### Prvo zavrsi infrastrukturu

1. Railway
   - Otvori/povezi repo.
   - Service root mora biti `apps/api`.
   - U env dodaj `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `CORS_ORIGIN`, `APP_ENV`.
   - Meni vracas Railway generated backend URL.

2. Supabase
   - Napravi project.
   - Meni vracas `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_ID`.

3. Upstash
   - Napravi Redis bazu.
   - Meni vracas `UPSTASH_REDIS_REST_URL` i token ako nije kompletan.

4. Railway web service
   - Frontend service je aktivan kao `splendid-clarity`.
   - Service root ostavi prazan / repo root.
   - Ne stavljaj `apps/web` kao root, jer build mora da vidi `packages/shared`.
   - Build command: `npm install && npm run build --workspace apps/web`
   - Start command: `npm run start --workspace apps/web -- --hostname 0.0.0.0 --port 3000`
   - Koristimo ga za `app.elevatemindstudio.net`.

5. Vercel web deploy
   - Project: `elevatemindstudio-web`
   - Frontend root je `apps/web`.
   - Production alias: `https://elevatemindstudio-web.vercel.app`
   - Ako commit ne dira `apps/web`, koristi force deploy:
     `npx vercel deploy --prod --yes --force --with-cache --logs`

### Zatim social bridge

6. Buffer
   - Povezi prve kanale kroz Buffer.
   - Meni vracas client id/secret/refresh token ako ih Buffer da.

7. Meta Business + Instagram + Facebook Page
   - Napravi Meta Business setup.
   - Povezi Instagram professional account sa Facebook Page.
   - Meni vracas app id, business id, page id, Instagram business account id.

8. LinkedIn
   - Napravi company page ili potvrdi postojecu.
   - Napravi developer app.
   - Meni vracas client id, client secret, organization id.

9. YouTube / Google Cloud
   - Ukljuci YouTube Data API v3.
   - OAuth client vec imamo upisan.
   - Meni ce trebati refresh token i channel id.

10. X, Discord, Reddit, Substack
   - Radimo posle core infra + Buffer setup-a.
   - Discord mozemo ranije jer je najlaksi za bot/inbox alerts.

## 5. Sta je vec popunjeno u secret fajlu

Popunjeno je bez prikazivanja vrednosti:

- `ANTHROPIC_API_KEY`
- `GITHUB_TOKEN`
- `VERCEL_TOKEN`
- `SUPABASE_ANON_KEY`
- `UPSTASH_REDIS_REST_TOKEN`
- `BUFFER_ACCESS_TOKEN`
- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `LOOPIA_API_USERNAME`
- `LOOPIA_API_PASSWORD`
- `TELEGRAM_BOT_URL`
- `TELEGRAM_BOT_TOKEN`

## 6. Deployment status

Core deployment je aktivan:

- Loopia landing: `https://elevatemindstudio.net`
- Railway app: `https://app.elevatemindstudio.net`
- Railway API: `https://api.elevatemindstudio.net`
- Vercel app alias: `https://elevatemindstudio-web.vercel.app`

Napomena: Loopia static landing deploy koristi `FTP_HOST`, `FTP_USER` i `FTP_PASS` iz lokalnog secret fajla. Loopia DNS/API credential je odvojen.

Brand/logo:

- Final logo pack je u `apps/web/public/brand/elevatemind-final`.
- Dokumentovana kopija je u `docs/brand/elevatemind-final`.
- Pravila upotrebe su u `docs/BRAND_ASSETS.md`.

Backend service:

- Railway service: `elevatemindstudio`
- Root directory: `apps/api`
- Custom domain: `api.elevatemindstudio.net`

Frontend service:

- Railway service: `splendid-clarity`
- Root directory: repo root
- Custom domain: `app.elevatemindstudio.net`
- Vercel project: `elevatemindstudio-web`

## 7. Minimalni sledeci koraci za Aleksandra

Aktuelna kratka lista je u:

```txt
docs/OWNER_TODO.md
```

Trenutno su najvaznije stvari:

1. Novi validan `RAILWAY_TOKEN`.
2. LinkedIn Community Management API approval.
3. Discord verification + `DISCORD_GUILD_ID` + `DISCORD_ALERTS_CHANNEL_ID`.
4. Google/YouTube verification samo ako Google ponovo trazi.
5. Meta ostaje pauzirana.
