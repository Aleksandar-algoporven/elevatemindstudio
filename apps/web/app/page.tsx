import Link from "next/link";

const capabilities = [
  "Brand source library",
  "AI draft generation",
  "Approval workflow",
  "Publishing calendar",
  "Inbox and alerts",
  "Channel integrations"
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
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </header>

      <section className="publicHero" aria-labelledby="hero-title">
        <div className="heroTextBlock">
          <p className="eyebrow">Social media operating system</p>
          <h1 id="hero-title">ElevateMindStudio</h1>
          <p>
            ElevateMindStudio helps teams turn approved brand sources into reviewed drafts, scheduled posts, and channel-ready social media operations.
          </p>
          <div className="heroActions" aria-label="Primary links">
            <Link className="primaryLink" href="/privacy">Privacy Policy</Link>
            <Link className="secondaryLink" href="/terms">Terms of Service</Link>
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
            <span>Calendar</span>
          </div>
          <div className="reviewList">
            <div>
              <strong>Source-backed LinkedIn draft</strong>
              <span>Needs review</span>
            </div>
            <div>
              <strong>Discord alert digest</strong>
              <span>Ready</span>
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

      <footer className="siteFooter">
        <span>© 2026 ElevateMindStudio</span>
        <div>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <a href="mailto:support@elevatemindstudio.net">Contact</a>
        </div>
      </footer>
    </main>
  );
}
