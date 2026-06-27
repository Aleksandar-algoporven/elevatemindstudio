import { Sidebar } from "@/components/sidebar";
import { StatusPill } from "@/components/status-pill";
import { calendar, drafts, overview, sourceHealth } from "@/lib/data";

const stats = [
  { label: "Sources", value: overview.connectedSources, icon: "SO" },
  { label: "Channels", value: overview.connectedChannels, icon: "CH" },
  { label: "Review", value: overview.draftsInReview, icon: "RV" },
  { label: "Risk", value: overview.riskFlags, icon: "RK" }
];

export default function Home() {
  return (
    <main className="appShell">
      <Sidebar />
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ElevateMindStudio</p>
            <h1>Social media control room</h1>
          </div>
          <div className="modeBadge">
            <span className="modeDot" aria-hidden="true" />
            <span>{overview.mode}</span>
          </div>
        </header>

        <section className="summaryGrid" aria-label="Workspace summary">
          <div className="heroPanel">
            <div className="heroCopy">
              <p className="eyebrow">Flagship brand</p>
              <h2>{overview.brand}</h2>
              <p>
                Source-backed campaigns, channel-specific drafts, approval queues, and inbox intelligence in one operational view.
              </p>
            </div>
            <div className="signalStack" aria-label="Pipeline status">
              <span>Source brain</span>
              <span>Draft factory</span>
              <span>Approval queue</span>
              <span>Publishing grid</span>
            </div>
          </div>

          <div className="statGrid">
            {stats.map((stat) => (
              <article className="statCard" key={stat.label}>
                <span className="statIcon" aria-hidden="true">{stat.icon}</span>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="contentGrid">
          <div className="panel largePanel">
            <div className="panelHeader">
              <div>
                <p className="eyebrow">Review queue</p>
                <h2>Drafts waiting on decision</h2>
              </div>
              <button className="iconButton" type="button" title="Generate draft">
                AI
              </button>
            </div>
            <div className="draftList">
              {drafts.map((draft) => (
                <article className="draftRow" key={draft.id}>
                  <div>
                    <div className="draftTitleLine">
                      <h3>{draft.title}</h3>
                      <StatusPill tone={draft.approvalState}>{draft.approvalState.replace("_", " ")}</StatusPill>
                    </div>
                    <p>{draft.copy}</p>
                    <div className="metaLine">
                      <span>{draft.channel}</span>
                      <span>{draft.pillar}</span>
                      <StatusPill tone={draft.riskLevel}>{draft.riskLevel} risk</StatusPill>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="panel">
            <div className="panelHeader compact">
              <div>
                <p className="eyebrow">Source health</p>
                <h2>Inputs</h2>
              </div>
            </div>
            <div className="sourceList">
              {sourceHealth.map((source) => (
                <div className="sourceRow" key={source.name}>
                  <div>
                    <strong>{source.name}</strong>
                    <span>{source.count}</span>
                  </div>
                  <StatusPill tone={source.status as "ready" | "manual" | "pending"}>{source.status}</StatusPill>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="panel calendarPanel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Publishing grid</p>
              <h2>Next five operating days</h2>
            </div>
          </div>
          <div className="calendarGrid">
            {calendar.map((item) => (
              <article className="calendarDay" key={item.day}>
                <span>{item.day}</span>
                <strong>{item.posts}</strong>
                <p>{item.focus}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
