# ElevateMindStudio Architecture

## Product Shape

ElevateMindStudio is a control room for AI-assisted social media operations. It keeps a brand memory, ingests trusted sources, proposes campaign-ready content, routes drafts through approval, publishes through connectors, and learns from analytics.

The first production workspace is AlgoProven. ElevateMindStudio is the platform/app layer; AlgoProven is the first managed brand.

## Runtime Pieces

- `apps/web`: public website, legal pages, and operator workspace.
  - `/`: public product site and registration-safe initial link.
  - `/privacy`: Privacy Policy for platform approvals.
  - `/terms`: Terms of Service for platform approvals.
  - `/workspace`: live control room for brand operations and connector status.
- `apps/api`: FastAPI service for domain models, AI generation, connector orchestration, approvals, OAuth helpers, webhooks, and publish planning.
- `apps/worker`: scheduled/background jobs for inbox sync, publishing retries, analytics backfill, and source refresh.
- `packages/shared`: shared frontend TypeScript types.

## Control Plane

The MVP works as a review-first publishing system:

1. Sources define what the brand is allowed to say.
2. AI generates draft candidates from source context.
3. A human approves, rejects, or requests changes.
4. Approved content is routed to a connector.
5. Buffer is the first publishing bridge; direct connectors are added as platform approvals land.

Current API surface includes:

- Health and product data: `/health`, `/brands/active`, `/drafts`, `/calendar`, `/channels`, `/sources`, `/inbox`.
- Review workflow: `/drafts/generate`, `/approvals/drafts/{draft_id}`.
- Integration status: `/integrations/buffer/status`, `/integrations/youtube/status`, `/integrations/discord/status`, `/integrations/linkedin/status`, `/integrations/meta/status`.
- OAuth helpers: LinkedIn and YouTube authorization/callback routes.
- Webhooks: `/integrations/meta/webhook`.
- Publish planning: `/integrations/buffer/publish` currently runs dry-run validation only.

## Current Build Assumptions

- Domain and DNS stay on Loopia while building.
- Railway currently runs both the web app and API.
- Vercel can replace Railway web hosting later, but is not an MVP blocker.
- Supabase will become the durable Postgres/Auth/Storage layer.
- Upstash Redis will handle rate limits, locks, and queue metadata.
- Anthropic Claude is the AI provider inside the product, accessed only through `ANTHROPIC_API_KEY`.
- Buffer is the first publishing bridge while direct connectors are validated.

## Connector State

- Buffer: connected with AlgoProven Instagram, YouTube, and X channels. The first publish endpoint is dry-run only.
- YouTube: direct OAuth is connected for the AlgoProven channel.
- Discord: bot credentials are valid; server and alerts channel IDs are pending while Discord verification completes.
- LinkedIn: waiting for Community Management API approval for organization/page publishing.
- Meta: direct Graph API setup is paused; webhook verification endpoint is ready.

## Safety Model

The initial autonomy level is `1`: AI proposes, humans approve, and the system only plans or queues publishing after approval. Real Buffer publishing remains disabled until the dry-run workflow, review UX, and operational audit trail are accepted.
