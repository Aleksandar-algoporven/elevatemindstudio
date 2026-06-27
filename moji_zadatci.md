# Moji zadatci - ElevateMindStudio setup

## 0. Kratka odluka o imenu i domenu

`elevatemindstudio.net` je dobar izbor za odvojen projekat.

Zasto mi se svidja:
- dovoljno je odvojen od `AlgoProven`, pa proizvod moze da preraste u zaseban SaaS
- ime zvuci kao umbrella brand za AI, content, automation i studio rad
- moze da nosi i "done-for-you" i "software" pozicioniranje

Sta treba paziti:
- ime je malo sire i kreativnije nego strogo B2B/infra ime
- zato landing mora odmah da objasni: `AI social media operating system`, ne "creative studio" u generickom smislu

Moja preporuka:
- koristi `elevatemindstudio.net`
- postavi `AlgoProven` kao prvi flagship case / lighthouse klijent
- nemoj mesati product branding sa `algoproven.com`; linkuj ih, ali drzi ih kao 2 odvojena brenda

## 1. Stack koji preporucujem

Da ne ostane previse apstraktno, vodio bih setup ovim redom:

- domen i DNS za sada: [LoopiaDNS](https://www.loopia.com/loopiadns/)
- frontend app i landing: [Vercel Dashboard](https://vercel.com/dashboard)
- backend API + background workers: [Railway Dashboard](https://railway.com/dashboard)
- baza i auth: [Supabase Dashboard](https://supabase.com/dashboard)
- Redis / rate limit / kratki job lockovi: [Upstash Console](https://console.upstash.com/)
- repos i source control: [GitHub](https://github.com/)
- AI modeli: [Anthropic Console](https://console.anthropic.com/settings/keys)
- social connector bridge za MVP: [Buffer Developers](https://developers.buffer.com/)
- analytics: [Google Analytics](https://analytics.google.com/analytics/web/)
- optional kasnije: `Cloudflare` tek kad budemo hteli WAF, proxy, edge rules ili agresivniju DNS automatizaciju

Ovo je moj "najmanje bola / najvise brzine" setup.

## 2. Redosled otvaranja naloga

Nemoj otvarati sve random. Ako krenes bez redosleda, zaglavices se na app review zavisnostima i tokenima.

### Faza A - osnova i infrastruktura

1. Loopia
   Link: [https://www.loopia.com/loopiadns/](https://www.loopia.com/loopiadns/)

   Uradi:
   - zadrzi `elevatemindstudio.net` na Loopia za sada
   - proveri da imas pristup Loopia control panelu i `LoopiaDNS`
   - nemoj jos menjati nameservere dok ne zavrsimo prve deploy targete
   - cim budemo imali Vercel i Railway targete, unesi DNS zapise za:
     - `www`
     - `app`
     - `api`
     - `assets`
   - preporuceni subdomain plan:
     - `www.elevatemindstudio.net` -> landing
     - `app.elevatemindstudio.net` -> admin aplikacija
     - `api.elevatemindstudio.net` -> backend API
     - `assets.elevatemindstudio.net` -> static/generated assets

   Zapisi:
   - `PRIMARY_DOMAIN=elevatemindstudio.net`
   - `DNS_PROVIDER=loopia`

   Napomena:
   - za ovaj rani build ti ne treba poseban Loopia API credential blok
   - DNS mozes mirno voditi rucno dok ne stabilizujemo infrastrukturu

2. GitHub
   Link: [https://github.com/](https://github.com/)

   Repo:
   [Aleksandar-algoporven/elevatemindstudio](https://github.com/Aleksandar-algoporven/elevatemindstudio)

   Uradi:
   - koristi ovaj repo kao glavni codebase za proizvod
   - proveri branch protection i osnovna repo podesavanja
   - ubaci osnovnu strukturu app-a kad krenemo build
   - napravi jedan fine-grained token ako zelis CI ili deploy integracije

   Link za PAT:
   [https://github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens)

   Zapisi:
   - `GITHUB_TOKEN`
   - `GITHUB_OWNER`
   - `GITHUB_REPO`

3. Vercel
   Link: [https://vercel.com/dashboard](https://vercel.com/dashboard)

   Uradi:
   - login preko GitHub-a
   - importuj repo
   - reserve domain connection za `elevatemindstudio.net`
   - ostavi frontend app ovde

   Zapisi:
   - `VERCEL_TOKEN`
   - `NEXT_PUBLIC_APP_URL`

4. Railway
   Link: [https://railway.com/dashboard](https://railway.com/dashboard)

   Uradi:
   - napravi project za backend i worker procese
   - plan je da ovde zive:
     - API server
     - cron / scheduled jobs
     - ingestion jobs
     - publishing workers

   Zapisi:
   - `RAILWAY_TOKEN`
   - `BACKEND_BASE_URL`

5. Supabase
   Link: [https://supabase.com/dashboard](https://supabase.com/dashboard)

   Uradi:
   - napravi novi projekat
   - ukljuci Postgres
   - Auth moze da ostane email magic link za admin tim
   - napravi storage bucket za generated assets ako ne idemo odmah na R2

   Zapisi:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_DB_PASSWORD`
   - `SUPABASE_PROJECT_ID`

6. Upstash
   Link: [https://console.upstash.com/](https://console.upstash.com/)

   Uradi:
   - napravi Redis bazu
   - koristimo za:
     - rate limit
     - kratkotrajne lockove
     - queue metadata
     - retry guard

   Zapisi:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Faza B - AI i observability

7. Claude / Anthropic
   Link: [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

   Uradi:
   - napravi API key za development
   - napravi odvojen key za production kasnije
   - ukljuci usage alerts
   - postavi `Claude` kao primarni model layer za:
     - strategiju
     - copy generation
     - reply suggestions
     - compliance/risk pass

   Zapisi:
   - `ANTHROPIC_API_KEY`

8. Sentry
   Link: [https://sentry.io/](https://sentry.io/)

   Uradi:
   - napravi project za frontend
   - napravi project za backend

   Zapisi:
   - `SENTRY_DSN_WEB`
   - `SENTRY_DSN_API`
   - `SENTRY_AUTH_TOKEN`

### Faza C - content source i analytics

9. Google Analytics 4
   Link: [https://analytics.google.com/analytics/web/](https://analytics.google.com/analytics/web/)

   Uradi:
   - napravi GA4 property za `elevatemindstudio.net`
   - povezi sa Vercel sajtom
   - definisi evente:
     - signup_started
     - signup_completed
     - demo_requested
     - channel_connected
     - post_approved
     - post_published

   Zapisi:
   - `GA4_MEASUREMENT_ID`

10. Google Tag Manager
    Link: [https://tagmanager.google.com/](https://tagmanager.google.com/)

    Uradi:
    - napravi GTM container
    - koristi ako budemo dodavali vise analytics vendor-a kasnije

    Zapisi:
    - `GTM_CONTAINER_ID`

11. Source-of-truth sadrzaj

    Izaberi jedan glavni izvor za znanje:
    - opcija A: GitHub markdown + docs
    - opcija B: Notion knowledge base
    - opcija C: oba, ali GitHub je source-of-truth za "public truth"

    Moja preporuka:
    - `AlgoProven site/app/blog/docs` kao primary content source
    - GitHub release notes i changelog kao "proof source"
    - kasnije dodati Notion samo za marketing plan i editorial briefs

### Faza D - social media nalozi i app review zavisnosti

12. Buffer za MVP publishing layer
    Link: [https://developers.buffer.com/](https://developers.buffer.com/)

    Uradi:
    - otvori Buffer nalog
    - povezi prve kanale
    - koristi ga kao MVP connector bridge
    - ne oslanjaj se da zauvek ostane jedini connector layer; kasnije radimo direct konektore gde vredi

    Zapisi:
    - `BUFFER_ACCESS_TOKEN`
    - `BUFFER_REFRESH_TOKEN`
    - `BUFFER_CLIENT_ID`
    - `BUFFER_CLIENT_SECRET`

13. Meta Business + Instagram + Facebook Page
    Linkovi:
    - [Meta Developers Apps](https://developers.facebook.com/apps/)
    - [Instagram Content Publishing docs](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/content-publishing/)

    Uradi:
    - otvori ili ocisti Meta Business setup
    - napravi Facebook Page za brand
    - prebaci Instagram na professional account
    - povezi Instagram sa Facebook Page
    - napravi Meta app
    - pripremi app review za potrebne permission-e

    Bitno:
    - bez ovoga nema ozbiljnog Instagram publishing flow-a
    - nemoj graditi browser automation za login/posting; idi samo preko zvanicnih API tokova

    Zapisi:
    - `META_APP_ID`
    - `META_APP_SECRET`
    - `META_SYSTEM_USER_ACCESS_TOKEN`
    - `META_BUSINESS_ID`
    - `META_PAGE_ID`
    - `META_IG_BUSINESS_ACCOUNT_ID`
    - `META_WEBHOOK_VERIFY_TOKEN`

14. LinkedIn
    Link:
    [LinkedIn Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-06&viewFallbackFrom=li-lms-2025-05)

    Uradi:
    - napravi ili spremi company page
    - potvrdi ko je admin
    - otvori developer app
    - prodji OAuth setup
    - proveri koje scope-ove dobijas za organization posting

    Zapisi:
    - `LINKEDIN_CLIENT_ID`
    - `LINKEDIN_CLIENT_SECRET`
    - `LINKEDIN_ORG_ID`
    - `LINKEDIN_REDIRECT_URI`

15. YouTube
    Linkovi:
    - [YouTube upload API](https://developers.google.com/youtube/v3/docs/videos/insert)
    - [YouTube comments API](https://developers.google.com/youtube/v3/docs/commentThreads/list)

    Uradi:
    - napravi brand channel ili odvojen kanal za ElevateMindStudio
    - napravi Google Cloud project
    - ukljuci YouTube Data API v3
    - podesi OAuth consent screen
    - pripremi audit ako bude trebalo za siri production access

    Zapisi:
    - `YOUTUBE_CLIENT_ID`
    - `YOUTUBE_CLIENT_SECRET`
    - `YOUTUBE_REFRESH_TOKEN`
    - `YOUTUBE_CHANNEL_ID`

16. X
    Link:
    [X create post API](https://docs.x.com/x-api/posts/create-post)

    Uradi:
    - otvori X developer account
    - proveri koji paid tier daje minimum koji ti treba
    - napravi app
    - podesi OAuth
    - prvo koristi samo posting + reading replies

    Napomena:
    - deo feature-a je plan-limited
    - neke napredne stvari mogu traziti visi tier

    Zapisi:
    - `X_CLIENT_ID`
    - `X_CLIENT_SECRET`
    - `X_BEARER_TOKEN`
    - `X_API_KEY`
    - `X_API_KEY_SECRET`
    - `X_ACCESS_TOKEN`
    - `X_ACCESS_TOKEN_SECRET`
    - `X_USER_ID`

17. TikTok
    Link:
    [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started)

    Uradi:
    - otvori TikTok Developer app
    - proveri da li zelis creator ili business account flow
    - podesi OAuth
    - procitaj visibility i review ogranicenja za unaudited app

    Zapisi:
    - `TIKTOK_CLIENT_KEY`
    - `TIKTOK_CLIENT_SECRET`
    - `TIKTOK_REDIRECT_URI`

18. Discord
    Link:
    [Discord Developers Intro](https://docs.discord.com/developers/intro)

    Uradi:
    - napravi Discord server za brand/community
    - napravi bot application
    - podesi permissions samo koliko treba
    - koristi Discord kao community + alerts + internal review lane

    Zapisi:
    - `DISCORD_BOT_TOKEN`
    - `DISCORD_APPLICATION_ID`
    - `DISCORD_PUBLIC_KEY`
    - `DISCORD_GUILD_ID`
    - `DISCORD_ALERTS_CHANNEL_ID`

19. Reddit
    Link:
    [Reddit developer platform access policy](https://support.reddithelp.com/hc/en-us/articles/14945211791892-Developer-Platform-Accessing-Reddit-Data)

    Uradi:
    - napravi Reddit app samo ako zaista hoces monitoring / assisted drafting
    - nemoj kretati sa full automation posting-om

    Napomena:
    - Reddit je osetljiv za commercial use
    - ovo bih drzao kao monitoring + draft + manual approval kanal dok ne potvrdis policy fit

    Zapisi:
    - `REDDIT_CLIENT_ID`
    - `REDDIT_CLIENT_SECRET`
    - `REDDIT_USERNAME`
    - `REDDIT_PASSWORD`
    - `REDDIT_USER_AGENT`

20. Bluesky
    Link:
    [AT Protocol / Bluesky docs](https://docs.bsky.app/docs/get-started)

    Uradi:
    - rezervisi handle rano
    - tretiraj kao bonus kanal za tech / founder publiku

    Zapisi:
    - `BLUESKY_IDENTIFIER`
    - `BLUESKY_APP_PASSWORD`

### Faza E - optional, ali vrlo korisno

21. Canva ili Figma
    - Canva ako hoces brz social asset workflow
    - Figma ako hoces ozbiljniji design system i landing design

22. Substack
    - napravi publication rano zbog handle-a
    - tretiraj kao newsletter / long-form kanal
    - ne bih ga vezao kao "core API publishing lane" u prvoj fazi

## 3. Jedan secret file koji punis

Predlazem da lokalno koristis jedan fajl:

`secrets/elevatemindstudio.local.env`

Nikad ga ne commitujes.

Dodaj ga u `.gitignore` kad budemo pravili kod:

```gitignore
secrets/
.env
.env.*
```

### Template za secret file

```bash
APP_NAME=ElevateMindStudio
APP_ENV=development
PRIMARY_DOMAIN=elevatemindstudio.net
DNS_PROVIDER=loopia
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:8000

GITHUB_OWNER=
GITHUB_REPO=elevatemindstudio
GITHUB_TOKEN=

ANTHROPIC_API_KEY=

VERCEL_TOKEN=
RAILWAY_TOKEN=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_PASSWORD=
SUPABASE_PROJECT_ID=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

GA4_MEASUREMENT_ID=
GTM_CONTAINER_ID=

SENTRY_DSN_WEB=
SENTRY_DSN_API=
SENTRY_AUTH_TOKEN=

BUFFER_CLIENT_ID=
BUFFER_CLIENT_SECRET=
BUFFER_ACCESS_TOKEN=
BUFFER_REFRESH_TOKEN=

META_APP_ID=
META_APP_SECRET=
META_SYSTEM_USER_ACCESS_TOKEN=
META_BUSINESS_ID=
META_PAGE_ID=
META_IG_BUSINESS_ACCOUNT_ID=
META_WEBHOOK_VERIFY_TOKEN=

LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_ORG_ID=
LINKEDIN_REDIRECT_URI=

YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=
YOUTUBE_CHANNEL_ID=

X_CLIENT_ID=
X_CLIENT_SECRET=
X_BEARER_TOKEN=
X_API_KEY=
X_API_KEY_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
X_USER_ID=

TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=

DISCORD_BOT_TOKEN=
DISCORD_APPLICATION_ID=
DISCORD_PUBLIC_KEY=
DISCORD_GUILD_ID=
DISCORD_ALERTS_CHANNEL_ID=

REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USERNAME=
REDDIT_PASSWORD=
REDDIT_USER_AGENT=

BLUESKY_IDENTIFIER=
BLUESKY_APP_PASSWORD=
```

## 4. Kako da popunjavas secret file

Pravilo:
- prvo upisi samo ono sto si stvarno otvorio
- prazne stvari ostavi prazne
- ne izmisljaj placeholder vrednosti kad nisi siguran

Moj redosled punjenja:

1. infrastrukturni kljucevi
   `Loopia`, `Vercel`, `Railway`, `Supabase`, `Upstash`

2. AI i observability
   `Anthropic`, `Sentry`, `GA4`

3. publishing bridge
   `Buffer`

4. direct channel konektori
   `Meta`, `LinkedIn`, `YouTube`, `X`, `TikTok`, `Discord`

5. bonus / oprezni kanali
   `Reddit`, `Bluesky`, `Substack`

## 5. Sta da ne radis

- nemoj stavljati produkcijske kljuceve u repo
- nemoj koristiti isti Anthropic key za dev i prod
- nemoj dirati DNS na Loopia pre nego sto stvarno znas na koje targete pokazujes
- nemoj praviti Instagram/X/LinkedIn browser automation za posting ako postoji zvanicni API put
- nemoj odmah kretati sa "full autopilot replies" bez approval sloja
- nemoj gurati Reddit kao automatski kanal u prvoj fazi

## 6. Prvih 7 dana rada

### Dan 1

- Loopia
- GitHub
- Vercel
- Railway
- Supabase
- Upstash
- Claude / Anthropic

### Dan 2

- brand handles rezervacija
- Buffer
- GA4
- GTM
- osnovni logo, bio, linkovi, visual direction

### Dan 3

- Meta Business
- LinkedIn Page
- YouTube channel
- Discord server

### Dan 4

- X developer
- TikTok developer
- pocetak OAuth testiranja

### Dan 5

- content source mapping
- knowledge base struktura
- categories i post archetypes

### Dan 6

- approval workflow
- calendar workflow
- publishing dry run na test nalozima

### Dan 7

- pravi launch sa 3-5 postova
- prati replies, DMs, comments
- ispravi tone, cadence i approvals

## 7. Minimalni MVP milestone

MVP je spreman kad imas ovo:

- `elevatemindstudio.net` live
- landing + admin app skeleton
- jedan centralni knowledge base
- jedan centralni calendar
- `Buffer` kao publishing bridge
- bar `LinkedIn`, `X`, `Instagram`, `YouTube`, `Discord` povezani
- approval queue radi
- post results se vracaju u analytics

## 8. Moj savet za sledeci korak

Kad zavrsis ovaj account-setup sloj, sledeci pametan korak je:

1. da napravimo repo i folder strukturu
2. da napravimo `.env.example`
3. da napravimo prvu admin aplikaciju
4. da povezemo `AlgoProven` kao prvi content source

## 9. Breakdown cena servisa

Provereno i azurirano prema zvanicnim pricing stranicama 27. juna 2026. Gde je servis usage-based ili custom, to jasno naglasavam.

### 9.1 Obavezni build stack

- `Loopia`
  - uloga: registrar + DNS dok gradimo
  - link: [LoopiaDNS](https://www.loopia.com/loopiadns/)
  - cena: `0` novog build troska ako domen vec imas aktivan; `LoopiaDNS` je predstavljen kao free control panel
  - napomena: obnova domena, hosting i mail zavise od tvog postojeceg Loopia paketa i TLD-a

- `Vercel`
  - uloga: landing + admin frontend
  - link: [Vercel pricing](https://vercel.com/pricing)
  - cena: `Hobby = 0 USD`, `Pro = 20 USD po clanu / mesecno`, `Enterprise = custom`
  - napomena: `Pro` ukljucuje `20 USD` usage kredita; za cist pocetak mozes na `Hobby`, ali za ozbiljniji timski rad racunaj `Pro`

- `Railway`
  - uloga: backend API + workers + cron
  - link: [Railway pricing](https://railway.com/pricing)
  - cena: `Free Trial = 5 USD` jednokratnog kredita, `Hobby = 5 USD / mesecno`, `Pro = 20 USD po clanu / mesecno`, `Enterprise = custom`
  - napomena: CPU, memory, disk, egress i object storage se naplacuju usage-based povrh plana

- `Supabase`
  - uloga: Postgres + auth + storage
  - link: [Supabase pricing](https://supabase.com/pricing)
  - cena: `Free = 0 USD`, `Pro = od 25 USD / mesecno`, `Team = od 599 USD / mesecno`, `Enterprise = custom`
  - napomena: compute ide posebno po projektu; `Micro = 10 USD / mesecno`, `Small = 15 USD / mesecno`, a `Pro` i `Team` ukljucuju `10 USD` compute kredita

- `Upstash Redis`
  - uloga: rate limits, lockovi, queue metadata
  - link: [Upstash Redis pricing](https://upstash.com/pricing/redis)
  - cena: `Free = 0 USD`, `PAYG = 0.20 USD / 100K komandi`, `Fixed 250 MB = 10 USD / mesecno`, `1 GB = 20 USD / mesecno`
  - napomena: za rani MVP je sasvim realno krenuti sa `Free` ili `PAYG`

- `GitHub`
  - uloga: repo, CI, source control
  - link: [GitHub pricing](https://github.com/pricing)
  - cena: `Free = 0 USD`, `Team = 4 USD po korisniku / mesecno`, `Enterprise = 21 USD po korisniku / mesecno`
  - napomena: za privatni repo i mali tim `Free` ili `Team` je dovoljno

- `Claude / Anthropic API`
  - uloga: strategija, generisanje postova, reply suggestions, compliance passes
  - link: [Claude pricing](https://claude.com/pricing)
  - cena za chat planove: `Free = 0 USD`, `Pro = 17 USD / mesecno godisnje ili 20 USD mesecno`, `Max = 100 USD ili 200 USD / mesecno`, `Team = 25 USD po clanu / mesecno ili 20 USD po clanu / mesecno godisnje`, `Enterprise = custom`
  - cena za API: `Sonnet 4.5 = 3 USD / MTok input i 15 USD / MTok output`; `Opus 4.7 = 5 USD / MTok input i 25 USD / MTok output`
  - napomena: za proizvod ti je bitniji `API` trosak nego chat pretplata; chat plan uzmi samo ako zelis dodatni ljudski workspace van same aplikacije

- `Buffer`
  - uloga: MVP publishing bridge
  - link: [Buffer pricing](https://buffer.com/pricing)
  - cena: `Free` plan sa `3` kanala i `10` scheduled postova po kanalu; `Essentials = 5 USD po kanalu / mesecno` (`60 USD` godisnje), `Team = 10 USD po kanalu / mesecno` (`120 USD` godisnje)
  - napomena: ovo su cene koje Buffer trenutno prikazuje za godisnje obracunatu varijantu; `Team` ti je realniji izbor ako hoces approval workflow i timski rad

- `Sentry`
  - uloga: error tracking i observability
  - link: [Sentry pricing](https://sentry.io/pricing/)
  - cena: `Developer = 0 USD`, `Team = 26 USD / mesecno po korisniku uz annual billing`, `Business = 80 USD / mesecno po korisniku uz annual billing`, `Enterprise = custom`
  - napomena: za start mozes bez problema na `Developer`

- `GA4`
  - uloga: web/app analytics
  - link: [Google Analytics](https://analytics.google.com/analytics/web/)
  - cena: `0 USD` za standardni GA4 setup

- `GTM`
  - uloga: analytics tag orchestration
  - link: [Google Tag Manager](https://tagmanager.google.com/)
  - cena: `0 USD` za standardni GTM setup

### 9.2 Kanal-specifik trosak i ogranicenja

- `Meta / Instagram / Facebook`
  - link: [Meta Developers](https://developers.facebook.com/apps/)
  - cena platforme: nema obaveznog zasebnog SaaS troska za samo otvaranje app-a
  - realni trosak: vreme za app review, permissions i eventualni ads spend

- `LinkedIn`
  - link: [LinkedIn Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-06&viewFallbackFrom=li-lms-2025-05)
  - cena platforme: nema zasebne pretplate za samo developer app otvaranje
  - realni trosak: org admin setup, OAuth i permission odobrenja

- `YouTube`
  - link: [YouTube Data API](https://developers.google.com/youtube/v3/docs/videos/insert)
  - cena platforme: nema dodatnog software plana za sam API pristup na osnovnom nivou
  - realni trosak: quotas, audit ako siris pristup, plus produkcija videa

- `X`
  - link: [X developer products](https://developer.x.com/en/portal/products)
  - cena platforme: racunaj da je developer pristup tier-gated i potencijalno placen
  - napomena: trenutni products/pricing prikaz je iza login flow-a, pa tacan iznos proveri na dan kupovine u samom developer portalu

- `TikTok`
  - link: [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started)
  - cena platforme: nema tipican SaaS fee za samo otvaranje developer app-a
  - realni trosak: account eligibility, review i content ops

- `Discord`
  - link: [Discord Developers](https://docs.discord.com/developers/intro)
  - cena platforme: `0 USD` za bot/app setup na osnovnom nivou

- `Reddit`
  - link: [Reddit developer access policy](https://support.reddithelp.com/hc/en-us/articles/14945211791892-Developer-Platform-Accessing-Reddit-Data)
  - cena platforme: zavisi od use-case-a i komercijalnog pristupa; za ovaj projekat ga drzim kao monitoring/manual-first kanal

- `Bluesky`
  - link: [AT Protocol docs](https://docs.bsky.app/docs/get-started)
  - cena platforme: nema obavezan dodatni SaaS trosak za osnovni account/app-password flow

- `Substack`
  - cena platforme: `0 USD` da otvoris publication; monetizacija kasnije vuce revenue-share i payment fees
  - napomena: nije core publishing lane u v1

### 9.3 Praktican mesecni budzet za start

- `Lean internal build`
  - `Loopia = 0` novog troska
  - `Vercel Hobby = 0`
  - `Railway Hobby = 5`
  - `Supabase Free ili Pro = 0 do 25`
  - `Upstash = 0 do 10`
  - `GitHub = 0 do 4 po osobi`
  - `Buffer = 0 do 10+` zavisno od broja kanala
  - `Sentry = 0`
  - `Anthropic API = usage-based`
  - realan range: otprilike `30 do 80 USD / mesecno + Claude API usage`

- `Ozbiljniji MVP sa approval workflow-om`
  - `Vercel Pro = 20`
  - `Railway Hobby ili Pro = 5 do 20+`
  - `Supabase Pro = 25`
  - `Upstash = 0 do 10`
  - `GitHub Team = 4 po osobi`
  - `Buffer Team = 10 USD po kanalu / mesecno`
  - `Sentry Team = 26 po korisniku`
  - `Anthropic API = usage-based`
  - realan range bez video produkcije i ads spend-a: otprilike `140 do 320 USD / mesecno + Claude API usage + X tier ako ga aktiviras`
