import Image from "next/image";
import Link from "next/link";
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

function labelStatus(value: string) {
  return value.replace(/_/g, " ");
}

function statusClass(value: string) {
  return value.replace(/_/g, "-").toLowerCase();
}

function draftCard(draft: Draft) {
  return (
    <article className="draftCard" key={draft.id}>
      <div className="draftCardTop">
        <h3>{draft.title}</h3>
        <span className={`statusChip status-${statusClass(draft.approval_state)}`}>
          {labelStatus(draft.approval_state)}
        </span>
      </div>
      <p>{draft.copy_text}</p>
      <div className="draftMeta">
        <span>{draft.channel}</span>
        <span>{draft.risk_level} risk</span>
        <span>{draft.scheduled_for || "unscheduled"}</span>
      </div>
    </article>
  );
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

  const activeBrand = brand || {
    id: "brand-algoproven",
    name: "AlgoProven",
    domain: "algoproven.com",
    tone: "Precise, evidence-backed, product-led, and operator-aware.",
    autonomy_level: 1,
    prohibited_claims: []
  };
  const reviewDrafts = drafts || [];
  const sourceItems = sources || [];
  const inboxItems = inbox || [];
  const readinessChecks = readiness?.checks || [];
  const humanInboxItems = inboxItems.filter((message) => message.needs_human);
  const readyChannels = buffer?.channels.filter((channel) => channel.products.includes("publish")) || [];
  const approvedDrafts = reviewDrafts.filter((draft) => draft.approval_state === "approved");
  const draftLane = reviewDrafts.filter((draft) =>
    ["draft", "rejected", "request_changes", "changes_requested"].includes(draft.approval_state)
  );
  const queueLane = approvedDrafts;
  const reviewLane = reviewDrafts.filter((draft) => !draftLane.includes(draft) && !queueLane.includes(draft));
  const activeDraft = reviewLane[0] || draftLane[0] || queueLane[0] || reviewDrafts[0] || null;

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

  const publishGates = [
    {
      label: "Review gate",
      value: `${reviewDrafts.length - approvedDrafts.length} open`,
      state: reviewDrafts.length === approvedDrafts.length ? "connected" : "partial",
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
      value: publishPlan?.accepted ? "Ready" : "Watch",
      state: publishPlan?.accepted ? "connected" : "partial",
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
    <main className="studioShell">
      <header className="studioTopbar">
        <Link className="brandLockup" href="/">
          <Image
            src="/brand/elevatemind-final/elevatemind-logo-horizontal-transparent.png"
            alt="ElevateMindStudio"
            width={1123}
            height={310}
            priority
          />
        </Link>
        <div className="brandSwitch">
          <span />
          <strong>{activeBrand.name}</strong>
          <small>{activeBrand.domain}</small>
        </div>
        <div className="studioSearch" aria-hidden="true">
          <span>Search drafts, sources, connectors...</span>
        </div>
        <Link className="topbarLink" href="/">Public site</Link>
        <span className="liveBadge">API live</span>
      </header>

      <div className="studioGrid">
        <nav className="studioRail" aria-label="Workspace sections">
          <a href="#board" title="Board" aria-label="Board">▤</a>
          <a href="#sources" title="Sources" aria-label="Sources">✎</a>
          <a href="#connectors" title="Connectors" aria-label="Connectors">⇄</a>
          <a href="#campaigns" title="Campaigns" aria-label="Campaigns">◈</a>
          <a href="#settings" title="Settings" aria-label="Settings">⚙</a>
        </nav>

        <section className="studioContent">
          <section id="board" className="boardLayout">
            <div className="boardMain">
              <div className="viewHead">
                <div>
                  <p className="sectionFolio">Campaign board</p>
                  <h1>{activeBrand.name} - Review lane</h1>
                  <span>Nothing publishes without a human gate.</span>
                </div>
                <div className="headActions">
                  <span className="smallBadge">Drafts {reviewDrafts.length}</span>
                  <span className="smallBadge">Sources {sourceItems.length}</span>
                  <span className="smallBadge">Inbox {humanInboxItems.length}</span>
                </div>
              </div>

              <div className="boardColumns">
                <div className="boardColumn">
                  <div className="laneTitle">
                    <span>Draft</span>
                    <small>{draftLane.length}</small>
                  </div>
                  {draftLane.length ? draftLane.map(draftCard) : <p className="emptyLane">No draft changes waiting.</p>}
                </div>
                <div className="boardColumn">
                  <div className="laneTitle">
                    <span>Review</span>
                    <small>{reviewLane.length}</small>
                  </div>
                  {reviewLane.length ? reviewLane.map(draftCard) : <p className="emptyLane">No draft is waiting for review.</p>}
                </div>
                <div className="boardColumn">
                  <div className="laneTitle">
                    <span>Queue</span>
                    <small>{queueLane.length}</small>
                  </div>
                  {queueLane.length ? queueLane.map(draftCard) : <p className="emptyLane">Approved posts will appear here.</p>}
                </div>
              </div>
            </div>

            <aside className="inspectorPanel">
              <div className="inspectorTop">
                <span className="sectionFolio">Draft inspector</span>
                <small>{activeDraft ? `#${activeDraft.id.slice(0, 6)}` : "empty"}</small>
              </div>
              {activeDraft ? (
                <>
                  <h2>{activeDraft.title}</h2>
                  <p>{activeDraft.copy_text}</p>
                  <div className="inspectorChips">
                    <span>{activeDraft.channel}</span>
                    <span>{activeDraft.risk_level} risk</span>
                    <span>{labelStatus(activeDraft.approval_state)}</span>
                  </div>
                  <div className="pipelineNodes">
                    <span>Draft</span>
                    <span>Review</span>
                    <span>Queue</span>
                  </div>
                  <div className="publishGate">
                    <Image
                      src="/brand/elevatemind-final/elevatemind-icon-transparent.png"
                      alt=""
                      width={220}
                      height={220}
                    />
                    <span>Human gate - on</span>
                    <strong>No auto-posting</strong>
                    <small>Manual approval remains required.</small>
                  </div>
                  <form className="approvalControls" action={reviewWorkspaceDraft}>
                    <input name="draft_id" type="hidden" value={activeDraft.id} />
                    <button name="decision" value="approve" type="submit">Approve</button>
                    <button name="decision" value="request_changes" type="submit">Changes</button>
                    <button name="decision" value="reject" type="submit">Reject</button>
                  </form>
                  <div className="scheduleControls">
                    <form action={scheduleWorkspaceDraft}>
                      <input name="draft_id" type="hidden" value={activeDraft.id} />
                      <input aria-label={`Schedule ${activeDraft.title}`} name="scheduled_for" type="datetime-local" required />
                      <button type="submit">Schedule</button>
                    </form>
                    <form action={queueWorkspaceDraft}>
                      <input name="draft_id" type="hidden" value={activeDraft.id} />
                      <button type="submit">Queue dry-run</button>
                    </form>
                  </div>
                </>
              ) : (
                <p className="emptyLane">Create or generate a draft to activate the inspector.</p>
              )}
            </aside>
          </section>

          <section id="sources" className="workspaceSection">
            <div className="sectionHeader">
              <div>
                <p className="sectionFolio">Brand memory</p>
                <h2>Sources and content intake</h2>
              </div>
              <span className="smallBadge">{sourceItems.length} inputs</span>
            </div>
            <div className="twoColumn">
              <form className="studioForm" action={createWorkspaceSource}>
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
                <button className="formButton" type="submit">Add source</button>
              </form>

              <div className="sourceStack">
                {sourceItems.length ? (
                  sourceItems.map((source) => (
                    <article key={source.id} className="sourceRow">
                      <strong>{source.name}</strong>
                      <span>{source.source_type}</span>
                      <small>{source.status} - {source.item_count} items</small>
                    </article>
                  ))
                ) : (
                  <p className="emptyLane">No sources yet. Add the first source for AI context.</p>
                )}
              </div>
            </div>
          </section>

          <section className="workspaceSection">
            <div className="sectionHeader">
              <div>
                <p className="sectionFolio">Production desk</p>
                <h2>Create and generate drafts</h2>
              </div>
              <span className="smallBadge">Claude enabled</span>
            </div>
            <div className="twoColumn">
              <form className="studioForm" action={createWorkspaceDraft}>
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
                <button className="formButton" type="submit">Create draft</button>
              </form>

              <form className="studioForm aiForm" action={generateWorkspaceDraft}>
                <div className="formGridTwo">
                  <label>
                    <span>Brand</span>
                    <input name="brand_name" type="text" defaultValue={activeBrand.name} required />
                  </label>
                  <label>
                    <span>Pillar</span>
                    <input name="pillar" type="text" placeholder="Trust" required minLength={2} />
                  </label>
                </div>
                <div className="formGridTwo">
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
                    rows={9}
                  />
                </label>
                <button className="formButton" type="submit">Generate review draft</button>
              </form>
            </div>
          </section>

          <section id="connectors" className="workspaceSection">
            <div className="sectionHeader">
              <div>
                <p className="sectionFolio">Connectors</p>
                <h2>Live status and readiness</h2>
              </div>
              <span className="smallBadge">{readiness?.ready ?? 0} ready / {readiness?.blocked ?? 0} blocked</span>
            </div>
            <div className="threeColumn">
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
              {linkedinAuth?.authorization_url ? <a href={linkedinAuth.authorization_url}>LinkedIn OAuth</a> : null}
              {youtubeAuth?.authorization_url ? <a href={youtubeAuth.authorization_url}>YouTube OAuth</a> : null}
              <a href="https://api.elevatemindstudio.net/ops/readiness">Readiness JSON</a>
            </div>
            <div className="readinessGrid">
              {readinessChecks.map((item) => (
                <article className="readinessCard" key={item.key}>
                  <div>
                    <strong>{item.label}</strong>
                    <span className={`statusChip connector-${item.state === "ready" ? "connected" : item.state === "watch" ? "partial" : "blocked"}`}>
                      {item.state}
                    </span>
                  </div>
                  <p>{item.detail}</p>
                  {item.action ? <small>{item.action}</small> : null}
                </article>
              ))}
            </div>
          </section>

          <section id="campaigns" className="workspaceSection">
            <div className="sectionHeader">
              <div>
                <p className="sectionFolio">Inbox and publish gates</p>
                <h2>Monitoring before reach</h2>
              </div>
              <span className="smallBadge">{humanInboxItems.length} open replies</span>
            </div>
            <div className="twoColumn">
              <div className="inboxStack">
                {inboxItems.length ? (
                  inboxItems.map((message) => (
                    <article className="inboxCard" key={message.id}>
                      <div className="draftCardTop">
                        <h3>{message.author}</h3>
                        <span className={`statusChip connector-${message.needs_human ? "partial" : "connected"}`}>
                          {message.needs_human ? "needs human" : "handled"}
                        </span>
                      </div>
                      <p>{message.text}</p>
                      <blockquote>{message.suggested_reply}</blockquote>
                      <div className="draftMeta">
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
                  ))
                ) : (
                  <p className="emptyLane">No inbox messages are waiting.</p>
                )}
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
            </div>
          </section>

          <section id="settings" className="workspaceSection">
            <div className="sectionHeader">
              <div>
                <p className="sectionFolio">Settings</p>
                <h2>Voice, autonomy, claims</h2>
              </div>
              <span className="smallBadge">Level {activeBrand.autonomy_level}</span>
            </div>
            <div className="twoColumn">
              <form className="studioForm" action={updateWorkspaceBrand}>
                <div className="formGridTwo">
                  <label>
                    <span>Name</span>
                    <input name="name" type="text" defaultValue={activeBrand.name} required minLength={2} />
                  </label>
                  <label>
                    <span>Domain</span>
                    <input name="domain" type="text" defaultValue={activeBrand.domain} required minLength={2} />
                  </label>
                </div>
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
                  <span>Tone</span>
                  <textarea name="tone" defaultValue={activeBrand.tone} required minLength={5} rows={4} />
                </label>
                <label>
                  <span>Prohibited claims</span>
                  <textarea name="prohibited_claims" defaultValue={activeBrand.prohibited_claims.join("\n")} rows={5} />
                </label>
                <button className="formButton" type="submit">Save guardrails</button>
              </form>

              <div className="channelStrip">
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
                    <strong>{publishPlan?.accepted ? "Accepted" : "Watch"}</strong>
                  </div>
                </div>
                <p className="panelNote">{publishPlan?.notes?.[0] || "Dry-run status unavailable."}</p>
                {readyChannels.length ? (
                  readyChannels.map((channel) => (
                    <article key={channel.id}>
                      <strong>{channel.display_name}</strong>
                      <span>{channel.service}</span>
                    </article>
                  ))
                ) : (
                  <p className="emptyLane">No publish-ready channels returned by Buffer yet.</p>
                )}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
