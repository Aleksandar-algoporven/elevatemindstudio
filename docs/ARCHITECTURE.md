# Architecture

## Product Shape

ElevateMindStudio is a control room for AI-assisted social media operations. It keeps a brand memory, ingests trusted sources, proposes campaign-ready content, routes drafts through approval, publishes through connectors, and learns from analytics.

## Runtime Pieces

- `apps/web`: admin UI for brand setup, sources, drafts, calendar, inbox, analytics, and connector settings.
- `apps/api`: FastAPI service for domain models, AI generation, connector orchestration, approvals, and analytics snapshots.
- `apps/worker`: scheduled/background jobs for inbox sync, publishing retries, analytics backfill, and source refresh.
- `packages/shared`: shared frontend TypeScript types.

## Current Build Assumptions

- Domain and DNS stay on Loopia while building.
- Vercel runs the web app.
- Railway runs API and worker services.
- Supabase will become the durable Postgres/Auth/Storage layer.
- Upstash Redis will handle rate limits, locks, and queue metadata.
- Anthropic Claude is the AI provider inside the product, accessed only through `ANTHROPIC_API_KEY`.
- Buffer is the first publishing bridge while direct connectors are validated.

## Safety Model

The initial autonomy level is `1`: AI proposes, humans approve, system publishes after approval. Low-risk reply automation comes later, only after source references, claim policies, and escalation rules are stable.
