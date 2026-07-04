import Link from "next/link";
import Image from "next/image";
import { createWorkspaceDraft, createWorkspaceSource } from "./actions";

export const dynamic = "force-dynamic";

type IntegrationSummary = {
  name: string;
  state: "connected" | "partial" | "blocked";
  detail: string;
  notes: string[];
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
  const [buffer, youtube, discord, linkedin, drafts, sources, publishPlan] = await Promise.all([
    fetchJson<BufferStatus>("/integrations/buffer/status"),
    fetchJson<YouTubeStatus>("/integrations/youtube/status"),
    fetchJson<DiscordStatus>("/integrations/discord/status"),
    fetchJson<LinkedInStatus>("/integrations/linkedin/status"),
    fetchJson<Draft[]>("/drafts"),
    fetchJson<SourceItem[]>("/sources"),
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
  const sourceItems = sources || [];
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
            <span>Buffer channels</span>
            <strong>{buffer?.channels_count ?? "-"}</strong>
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
            <span>Publish dry-run</span>
            <strong>{publishPlan?.accepted ? "Ready" : "Blocked"}</strong>
          </article>
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
