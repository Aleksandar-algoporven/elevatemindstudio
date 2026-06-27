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

4. Railway web service, privremeno umesto Vercel
   - Napravi drugi Railway service iz istog repo-a.
   - Service root ostavi prazan / repo root.
   - Ne stavljaj `apps/web` kao root, jer build mora da vidi `packages/shared`.
   - Build command: `npm install && npm run build --workspace apps/web`
   - Start command: `npm run start --workspace apps/web -- --hostname 0.0.0.0 --port $PORT`
   - Koristimo ga za `app.elevatemindstudio.net` dok Vercel nalog/token ne bude aktivan.
   - Meni vracas Railway generated frontend URL.

5. Vercel, kasnije
   - Import repo za frontend kada token/account bude spreman.
   - Frontend root ce biti `apps/web`.
   - Ovo nije blokator za MVP dok Railway hostuje web.

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

## 6. Sledeci konkretan zadatak za tebe

Otvori Railway project i podesi backend service:

- Repository: `Aleksandar-algoporven/elevatemindstudio`
- Root directory: `apps/api`
- Env:
  - `APP_NAME=ElevateMindStudio`
  - `APP_ENV=production`
  - `PRIMARY_DOMAIN=elevatemindstudio.net`
  - `ANTHROPIC_API_KEY=<iz secret fajla>`
  - `ANTHROPIC_MODEL=claude-sonnet-4-6`
  - `CORS_ORIGIN=https://app.elevatemindstudio.net`

Kada Railway deploy prodje, meni posalji backend URL.

Zatim napravi Railway web service:

- Repository: `Aleksandar-algoporven/elevatemindstudio`
- Root directory: ostavi prazno / repo root
- Build command: `npm install && npm run build --workspace apps/web`
- Start command: `npm run start --workspace apps/web -- --hostname 0.0.0.0 --port $PORT`
- Env:
  - `NEXT_PUBLIC_APP_URL=https://app.elevatemindstudio.net`
  - `NEXT_PUBLIC_API_BASE_URL=https://api.elevatemindstudio.net`

Kada web deploy prodje, meni posalji frontend Railway URL.
