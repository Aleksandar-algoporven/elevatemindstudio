import Link from "next/link";

const capabilities = [
  "Source-backed brand memory",
  "AI draft generation",
  "Human approval workflow",
  "Buffer publishing bridge",
  "Inbox and alert routing",
  "Connector health checks"
];

const operatingSteps = [
  "Ingest trusted brand sources",
  "Generate channel-specific drafts",
  "Review claims and approvals",
  "Queue approved posts through Buffer",
  "Monitor replies and alerts"
];

export default function Home() {
  return (
    <main className="publicShell">
      <header className="siteNav">
        <Link className="siteBrand" href="/" aria-label="ElevateMindStudio home">
          <span className="siteBrandMark" aria-hidden="true">EM</span>
          <span>ElevateMindStudio</span>
        </Link>
        <nav aria-label="Legal pages">
          <Link href="/workspace">Workspace</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </header>

      <section className="publicHero" aria-labelledby="hero-title">
        <div className="heroTextBlock">
          <p className="eyebrow">Social media operating system</p>
          <h1 id="hero-title">ElevateMindStudio</h1>
          <p>
            ElevateMindStudio turns trusted brand sources into reviewed drafts, approved publishing queues, and channel-ready social media operations.
          </p>
          <div className="heroActions" aria-label="Primary links">
            <Link className="primaryLink" href="/workspace">Open Workspace</Link>
            <Link className="secondaryLink" href="/privacy">Privacy Policy</Link>
          </div>
        </div>

        <div className="productSurface" aria-label="ElevateMindStudio product overview">
          <div className="productTopbar">
            <span>AlgoProven campaign</span>
            <strong>Approval required</strong>
          </div>
          <div className="pipelineGrid">
            <span>Sources</span>
            <span>Drafts</span>
            <span>Review</span>
            <span>Buffer</span>
          </div>
          <div className="reviewList">
            <div>
              <strong>AlgoProven campaign spine</strong>
              <span>Active</span>
            </div>
            <div>
              <strong>YouTube and Buffer connectors</strong>
              <span>Connected</span>
            </div>
          </div>
        </div>
      </section>

      <section className="publicBand" aria-labelledby="platform-title">
        <div>
          <p className="eyebrow">Platform</p>
          <h2 id="platform-title">One workspace for social content operations.</h2>
        </div>
        <div className="capabilityGrid">
          {capabilities.map((capability) => (
            <span key={capability}>{capability}</span>
          ))}
        </div>
      </section>

      <section className="publicBand mutedBand" aria-labelledby="access-title">
        <div>
          <p className="eyebrow">Private beta</p>
          <h2 id="access-title">Built for owned brands and managed client campaigns.</h2>
        </div>
        <p>
          ElevateMindStudio connects to third-party platforms only with authorized access and uses those integrations to prepare, review, schedule, publish, and monitor content for approved workspaces.
        </p>
      </section>

      <section className="publicBand" aria-labelledby="workflow-title">
        <div>
          <p className="eyebrow">Operating model</p>
          <h2 id="workflow-title">Designed around review before reach.</h2>
        </div>
        <ol className="workflowList">
          {operatingSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <footer className="siteFooter">
        <span>© 2026 ElevateMindStudio</span>
        <div>
          <Link href="/workspace">Workspace</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <a href="mailto:support@elevatemindstudio.net">Contact</a>
        </div>
      </footer>
    </main>
  );
}
