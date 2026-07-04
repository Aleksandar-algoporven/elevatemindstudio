import Link from "next/link";
import Image from "next/image";
import {
  createWorkspaceDraft,
  createWorkspaceSource,
  generateWorkspaceDraft,
  queueWorkspaceDraft,
  resolveWorkspaceInboxMessage,
  reviewWorkspaceDraft,
  scheduleWorkspaceDraft,
  updateWorkspaceBrand
} from "./actions";

export const dynamic = "force-dynamic";

type IntegrationSummary = {
  name: string;
  state: "connected" | "partial" | "blocked";
  detail: string;
  notes: string[];
};

type Brand = {
  id: string;
  name: string;
  domain: string;
  tone: string;
  autonomy_level: number;
  prohibited_claims: string[];
};

type BufferChannel = {
  id: string;
  service: string;
  display_name: string;
  products: string[];
  is_disconnected: boolean;
  is_locked: boolean;
};

type BufferStatus = {
  connected: boolean;
  channels_count: number;
  channels: BufferChannel[];
  notes: string[];
};

type YouTubeStatus = {
  connected: boolean;
  channel?: {
    title?: string;
    custom_url?: string;
  } | null;
  notes: string[];
};

type DiscordStatus = {
  connected: boolean;
  guild_id_configured: boolean;
  alerts_channel_id_configured: boolean;
  bot?: {
    username: string;
  } | null;
  notes: string[];
};

type LinkedInStatus = {
  connected: boolean;
  notes: string[];
};

type AuthorizationUrl = {
  configured: boolean;
  authorization_url?: string | null;
  notes: string[];
};

type Draft = {
  id: string;
  title: string;
  channel: string;
  approval_state: string;
  risk_level: string;
  copy_text: string;
  scheduled_for?: string | null;
};

type SourceItem = {
  id: string;
  name: string;
  source_type: string;
  status: string;
  item_count: number;
};

type InboxMessage = {
  id: string;
  channel: string;
  author: string;
  text: string;
  priority: string;
  sentiment: string;
  suggested_reply: string;
  needs_human: boolean;
};

type ReadinessCheck = {
  key: string;
  label: string;
  state: "ready" | "watch" | "blocked";
  detail: string;
  action: string;
};

type ReadinessResponse = {
  ready: number;
  watch: number;
  blocked: number;
  checks: ReadinessCheck[];
};

type PublishPlan = {
  accepted: boolean;
  dry_run: boolean;
  target?: {
    service: string;
    display_name: string;
  } | null;
  notes: string[];
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.elevatemindstudio.net";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${apiBase}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {})
      }
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function summarizeIntegration(status: {
  name: string;
  connected?: boolean;
  partial?: boolean;
  detail: string;
  notes?: string[];
}): IntegrationSummary {
  return {
    name: status.name,
    state: status.connected ? "connected" : status.partial ? "partial" : "blocked",
    detail: status.detail,
    notes: status.notes || []
  };
}

export default async function WorkspacePage() {
  const [
    brand,
    buffer,
    youtube,
    discord,
    linkedin,
    linkedinAuth,
    youtubeAuth,
    drafts,
    sources,
    inbox,
    readiness,
    publishPlan
  ] = await Promise.all([
    fetchJson<Brand>("/brands/active"),
    fetchJson<BufferStatus>("/integrations/buffer/status"),
    fetchJson<YouTubeStatus>("/integrations/youtube/status"),
    fetchJson<DiscordStatus>("/integrations/discord/status"),
    fetchJson<LinkedInStatus>("/integrations/linkedin/status"),
    fetchJson<AuthorizationUrl>("/integrations/linkedin/oauth/authorize"),
    fetchJson<AuthorizationUrl>("/integrations/youtube/oauth/authorize"),
    fetchJson<Draft[]>("/drafts"),
    fetchJson<SourceItem[]>("/sources"),
    fetchJson<InboxMessage[]>("/inbox"),
    fetchJson<ReadinessResponse>("/ops/readiness"),
    fetchJson<PublishPlan>("/integrations/buffer/publish", {
      method: "POST",
      body: JSON.stringify({
        channel: "x",
        text: "Dry-run validation from ElevateMindStudio workspace.",
        dry_run: true
      })
    })
  ]);

  const integrations = [
    summarizeIntegration({
      name: "Buffer",
      connected: buffer?.connected,
      detail: buffer ? `${buffer.channels_count} channels connected` : "Status unavailable",
      notes: buffer?.notes
    }),
    summarizeIntegration({
      name: "YouTube",
      connected: youtube?.connected,
      detail: youtube?.channel?.custom_url || youtube?.channel?.title || "Waiting for OAuth",
      notes: youtube?.notes
    }),
    summarizeIntegration({
      name: "Discord",
      connected: Boolean(discord?.connected && discord.guild_id_configured && discord.alerts_channel_id_configured),
      partial: discord?.connected,
      detail: discord?.bot?.username ? `Bot ${discord.bot.username}` : "Bot not connected",
      notes: discord?.notes
    }),
    summarizeIntegration({
      name: "LinkedIn",
      connected: linkedin?.connected,
      partial: Boolean(linkedin),
      detail: linkedin?.connected ? "Organization API connected" : "Community API approval pending",
      notes: linkedin?.notes
    })
  ];

  const reviewDrafts = drafts || [];
  const activeBrand = brand || {
    id: "brand-algoproven",
    name: "AlgoProven",
    domain: "algoproven.com",
    tone: "Precise, evidence-backed, product-led, and operator-aware.",
    autonomy_level: 1,
    prohibited_claims: []
  };
  const sourceItems = sources || [];
  const inboxItems = inbox || [];
  const readinessChecks = readiness?.checks || [];
  const humanInboxItems = inboxItems.filter((message) => message.needs_human);
  const readyChannels = buffer?.channels.filter((channel) => channel.products.includes("publish")) || [];
  const approvedDrafts = reviewDrafts.filter((draft) => draft.approval_state === "approved");
  const reviewBlockedDrafts = reviewDrafts.filter((draft) => draft.approval_state !== "approved");
  const publishGates = [
    {
      label: "Review gate",
      value: `${reviewBlockedDrafts.length} open`,
      state: reviewBlockedDrafts.length ? "partial" : "connected",
      detail: "Every draft needs explicit approval before queueing."
    },
    {
      label: "Approved queue",
      value: `${approvedDrafts.length} ready`,
      state: approvedDrafts.length ? "connected" : "partial",
      detail: "Approved drafts can be validated against Buffer."
    },
    {
      label: "Buffer dry-run",
      value: publishPlan?.accepted ? "Ready" : "Blocked",
      state: publishPlan?.accepted ? "connected" : "blocked",
      detail: publishPlan?.notes?.[0] || "Dry-run status unavailable."
    },
    {
      label: "Real publish",
      value: "Locked",
      state: "blocked",
      detail: "Real Buffer publishing remains disabled until the workflow is accepted."
    }
  ];

  return (
    <main className="workspaceShell">
      <aside className="workspaceRail">
        <Link className="siteBrand workspaceBrand" href="/">
          <Image
            className="siteBrandLogo"
            src="/brand/elevatemind-final/elevatemind-icon-100x100-transparent.png"
            alt=""
            width={36}
            height={36}
            priority
          />
          <span>ElevateMindStudio</span>
        </Link>
        <nav aria-label="Workspace sections">
          <a href="#overview">Overview</a>
          <a href="#inputs">Inputs</a>
          <a href="#review">Review</a>
          <a href="#connectors">Connectors</a>
          <a href="#publish">Publish</a>
        </nav>
      </aside>

      <section className="workspaceMain">
        <header className="workspaceHeader" id="overview">
          <div>
            <p className="eyebrow">AlgoProven control room</p>
            <h1>Build, review, publish.</h1>
            <p>Source-backed social media operations for the first ElevateMindStudio brand workspace.</p>
          </div>
          <Link className="secondaryLink" href="/">Public Site</Link>
        </header>

        <section className="opsGrid" aria-label="Operating metrics">
          <article>
            <span>Brand</span>
            <strong>{activeBrand.name}</strong>
          </article>
          <article>
            <span>Drafts</span>
            <strong>{reviewDrafts.length}</strong>
          </article>
          <article>
            <span>Sources</span>
            <strong>{sourceItems.length}</strong>
          </article>
          <article>
            <span>Inbox needs human</span>
            <strong>{humanInboxItems.length}</strong>
          </article>
        </section>

        <section className="workspacePanel">
          <div className="workspacePanelHeader">
            <div>
              <p className="eyebrow">Brand guardrails</p>
              <h2>Voice, autonomy, claims</h2>
            </div>
            <span className="smallBadge">Level {activeBrand.autonomy_level}</span>
          </div>
          <form className="workspaceForm" action={updateWorkspaceBrand}>
            <div className="formGridFour">
              <label>
                <span>Name</span>
                <input name="name" type="text" defaultValue={activeBrand.name} required minLength={2} />
              </label>
              <label>
                <span>Domain</span>
                <input name="domain" type="text" defaultValue={activeBrand.domain} required minLength={2} />
              </label>
              <label>
                <span>Autonomy</span>
                <select name="autonomy_level" defaultValue={String(activeBrand.autonomy_level)}>
                  <option value="0">0 - manual only</option>
                  <option value="1">1 - approval required</option>
                  <option value="2">2 - low risk allowed</option>
                  <option value="3">3 - scheduled automation</option>
                  <option value="4">4 - full automation</option>
                </select>
              </label>
              <label>
                <span>Claims</span>
                <input value={`${activeBrand.prohibited_claims.length} blocked`} readOnly />
              </label>
            </div>
            <label>
              <span>Tone</span>
              <textarea name="tone" defaultValue={activeBrand.tone} required minLength={5} rows={3} />
            </label>
            <label>
              <span>Prohibited claims</span>
              <textarea
                name="prohibited_claims"
                defaultValue={activeBrand.prohibited_claims.join("\n")}
                rows={4}
              />
            </label>
            <button className="primaryLink formButton" type="submit">Save guardrails</button>
          </form>
        </section>

        <section className="workspacePanel">
          <div className="workspacePanelHeader">
            <div>
              <p className="eyebrow">System readiness</p>
              <h2>Operational checklist</h2>
            </div>
            <span className="smallBadge">
              {readiness?.ready ?? 0} ready / {readiness?.blocked ?? 0} blocked
            </span>
          </div>
          <div className="readinessGrid">
            {readinessChecks.map((item) => (
              <article className="readinessCard" key={item.key}>
                <div className="itemTitleLine">
                  <strong>{item.label}</strong>
                  <span className={`statusChip connector-${item.state === "ready" ? "connected" : item.state === "watch" ? "partial" : "blocked"}`}>
                    {item.state}
                  </span>
                </div>
                <p>{item.detail}</p>
                {item.action ? <span>{item.action}</span> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="workspaceGrid" id="inputs">
          <div className="workspacePanel">
            <div className="workspacePanelHeader">
              <div>
                <p className="eyebrow">Source intake</p>
                <h2>Add content source</h2>
              </div>
            </div>
            <form className="workspaceForm" action={createWorkspaceSource}>
              <label>
                <span>Name</span>
                <input name="name" type="text" placeholder="Founder notes" required minLength={2} />
              </label>
              <div className="formGridTwo">
                <label>
                  <span>Type</span>
                  <select name="source_type" defaultValue="manual">
                    <option value="manual">Manual</option>
                    <option value="website">Website</option>
                    <option value="blog">Blog</option>
                    <option value="repo">Repository</option>
                    <option value="document">Document</option>
                    <option value="feed">Feed</option>
                  </select>
                </label>
                <label>
                  <span>Status</span>
                  <select name="status" defaultValue="pending">
                    <option value="pending">Pending</option>
                    <option value="manual">Manual</option>
                    <option value="syncing">Syncing</option>
                    <option value="ready">Ready</option>
                  </select>
                </label>
              </div>
              <label>
                <span>URL</span>
                <input name="url" type="url" placeholder="https://example.com/source" />
              </label>
              <label>
                <span>Items</span>
                <input name="item_count" type="number" min={0} defaultValue={0} />
              </label>
              <button className="primaryLink formButton" type="submit">Add source</button>
            </form>
          </div>

          <div className="workspacePanel">
            <div className="workspacePanelHeader">
              <div>
                <p className="eyebrow">Draft composer</p>
                <h2>Create review draft</h2>
              </div>
            </div>
            <form className="workspaceForm" action={createWorkspaceDraft}>
              <label>
                <span>Title</span>
                <input name="title" type="text" placeholder="Weekly product proof" required minLength={2} />
              </label>
              <div className="formGridTwo">
                <label>
                  <span>Pillar</span>
                  <input name="pillar" type="text" placeholder="Trust" required minLength={2} />
                </label>
                <label>
                  <span>Channel</span>
                  <select name="channel" defaultValue="linkedin">
                    <option value="linkedin">LinkedIn</option>
                    <option value="x">X</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="discord">Discord</option>
                    <option value="reddit">Reddit</option>
                    <option value="substack">Substack</option>
                    <option value="bluesky">Bluesky</option>
                  </select>
                </label>
              </div>
              <div className="formGridTwo">
                <label>
                  <span>Risk</span>
                  <select name="risk_level" defaultValue="low">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  <span>Schedule</span>
                  <input name="scheduled_for" type="datetime-local" />
                </label>
              </div>
              <label>
                <span>Sources</span>
                <input name="source_refs" type="text" placeholder="Founder notes, changelog" />
              </label>
              <label>
                <span>Copy</span>
                <textarea name="copy_text" placeholder="Draft copy..." required minLength={1} rows={6} />
              </label>
              <button className="primaryLink formButton" type="submit">Create draft</button>
            </form>
          </div>
        </section>

        <section className="workspacePanel">
          <div className="workspacePanelHeader">
            <div>
              <p className="eyebrow">Claude generation</p>
              <h2>Generate from source context</h2>
            </div>
            <span className="smallBadge">Review first</span>
          </div>
          <form className="workspaceForm aiDraftForm" action={generateWorkspaceDraft}>
            <div className="formGridFour">
              <label>
                <span>Brand</span>
                <input name="brand_name" type="text" defaultValue="AlgoProven" required />
              </label>
              <label>
                <span>Pillar</span>
                <input name="pillar" type="text" placeholder="Trust" required minLength={2} />
              </label>
              <label>
                <span>Channel</span>
                <select name="channel" defaultValue="linkedin">
                  <option value="linkedin">LinkedIn</option>
                  <option value="x">X</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="discord">Discord</option>
                  <option value="reddit">Reddit</option>
                  <option value="substack">Substack</option>
                  <option value="bluesky">Bluesky</option>
                </select>
              </label>
              <label>
                <span>Goal</span>
                <input name="goal" type="text" defaultValue="Generate a review-ready social post." />
              </label>
            </div>
            <label>
              <span>Source context</span>
              <textarea
                name="source_summary"
                placeholder="Paste changelog notes, blog paragraph, product update, meeting note, or source-backed idea."
                required
                minLength={10}
                rows={5}
              />
            </label>
            <button className="primaryLink formButton" type="submit">Generate review draft</button>
          </form>
        </section>

        <section className="workspaceGrid">
          <div className="workspacePanel largePanel" id="review">
            <div className="workspacePanelHeader">
              <div>
                <p className="eyebrow">Review queue</p>
                <h2>Drafts before reach</h2>
              </div>
              <span className="smallBadge">Autonomy 1</span>
            </div>
            <div className="workspaceList">
              {reviewDrafts.map((draft) => (
                <article className="workspaceItem" key={draft.id}>
                  <div className="itemTitleLine">
                    <h3>{draft.title}</h3>
                    <span className={`statusChip status-${draft.approval_state.replace("_", "-")}`}>
                      {draft.approval_state.replace("_", " ")}
                    </span>
                  </div>
                  <p>{draft.copy_text}</p>
                  <div className="itemMeta">
                    <span>{draft.channel}</span>
                    <span>{draft.risk_level} risk</span>
                    <span>{draft.scheduled_for || "unscheduled"}</span>
                  </div>
                  <form className="approvalControls" action={reviewWorkspaceDraft}>
                    <input name="draft_id" type="hidden" value={draft.id} />
                    <button name="decision" value="approve" type="submit">Approve</button>
                    <button name="decision" value="request_changes" type="submit">Changes</button>
                    <button name="decision" value="reject" type="submit">Reject</button>
                  </form>
                  <div className="scheduleControls">
                    <form action={scheduleWorkspaceDraft}>
                      <input name="draft_id" type="hidden" value={draft.id} />
                      <input
                        aria-label={`Schedule ${draft.title}`}
                        name="scheduled_for"
                        type="datetime-local"
                        required
                      />
                      <button type="submit">Schedule</button>
                    </form>
                    <form action={queueWorkspaceDraft}>
                      <input name="draft_id" type="hidden" value={draft.id} />
                      <button type="submit">Queue dry-run</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="workspacePanel" id="connectors">
            <div className="workspacePanelHeader compact">
              <div>
                <p className="eyebrow">Connectors</p>
                <h2>Live status</h2>
              </div>
            </div>
            <div className="connectorList">
              {integrations.map((integration) => (
                <article className="connectorRow" key={integration.name}>
                  <div>
                    <strong>{integration.name}</strong>
                    <span>{integration.detail}</span>
                  </div>
                  <span className={`statusChip connector-${integration.state}`}>{integration.state}</span>
                </article>
              ))}
            </div>
            <div className="connectorActions">
              {linkedinAuth?.authorization_url ? (
                <a href={linkedinAuth.authorization_url}>LinkedIn OAuth</a>
              ) : null}
              {youtubeAuth?.authorization_url ? (
                <a href={youtubeAuth.authorization_url}>YouTube OAuth</a>
              ) : null}
              <a href="https://api.elevatemindstudio.net/ops/readiness">Readiness JSON</a>
            </div>
          </aside>
        </section>

        <section className="workspaceGrid">
          <div className="workspacePanel" id="publish">
            <div className="workspacePanelHeader">
              <div>
                <p className="eyebrow">Buffer dry-run</p>
                <h2>Publish route validation</h2>
              </div>
            </div>
            <div className="publishPreview">
              <div>
                <span>Target</span>
                <strong>{publishPlan?.target?.display_name || "No target"}</strong>
              </div>
              <div>
                <span>Service</span>
                <strong>{publishPlan?.target?.service || "n/a"}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{publishPlan?.accepted ? "Accepted" : "Blocked"}</strong>
              </div>
            </div>
            <p className="panelNote">{publishPlan?.notes?.[0] || "Dry-run status unavailable."}</p>
          </div>

          <div className="workspacePanel">
            <div className="workspacePanelHeader">
              <div>
                <p className="eyebrow">Source memory</p>
                <h2>Inputs in use</h2>
              </div>
            </div>
            <div className="sourceMatrix">
              {sourceItems.map((source) => (
                <article key={source.id}>
                  <strong>{source.name}</strong>
                  <span>{source.source_type}</span>
                  <span>{source.status} - {source.item_count} items</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="workspacePanel">
          <div className="workspacePanelHeader">
            <div>
              <p className="eyebrow">Inbox triage</p>
              <h2>Reply recommendations</h2>
            </div>
            <span className="smallBadge">{humanInboxItems.length} open</span>
          </div>
          <div className="inboxGrid">
            {inboxItems.map((message) => (
              <article className="inboxCard" key={message.id}>
                <div className="itemTitleLine">
                  <h3>{message.author}</h3>
                  <span className={`statusChip connector-${message.needs_human ? "partial" : "connected"}`}>
                    {message.needs_human ? "needs human" : "handled"}
                  </span>
                </div>
                <p>{message.text}</p>
                <blockquote>{message.suggested_reply}</blockquote>
                <div className="itemMeta">
                  <span>{message.channel}</span>
                  <span>{message.priority}</span>
                  <span>{message.sentiment}</span>
                </div>
                {message.needs_human ? (
                  <form className="singleActionForm" action={resolveWorkspaceInboxMessage}>
                    <input name="message_id" type="hidden" value={message.id} />
                    <button type="submit">Mark handled</button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="workspacePanel">
          <div className="workspacePanelHeader">
            <div>
              <p className="eyebrow">Publish gates</p>
              <h2>Approval to Buffer path</h2>
            </div>
            <span className="smallBadge">No auto-posting</span>
          </div>
          <div className="gateGrid">
            {publishGates.map((gate) => (
              <article className="gateCard" key={gate.label}>
                <div>
                  <span>{gate.label}</span>
                  <strong>{gate.value}</strong>
                </div>
                <p>{gate.detail}</p>
                <span className={`statusChip connector-${gate.state}`}>{gate.state}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="workspacePanel">
          <div className="workspacePanelHeader">
            <div>
              <p className="eyebrow">Publishing bridge</p>
              <h2>Channels ready through Buffer</h2>
            </div>
          </div>
          <div className="channelStrip">
            {readyChannels.map((channel) => (
              <article key={channel.id}>
                <strong>{channel.display_name}</strong>
                <span>{channel.service}</span>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
