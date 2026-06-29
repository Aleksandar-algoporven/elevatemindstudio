import Image from "next/image";
import Link from "next/link";

const platformCards = [
  {
    number: "01",
    title: "Brand memory",
    body: "Use approved sources, campaign notes, links, and decisions as the base layer for draft generation."
  },
  {
    number: "02",
    title: "Approval first",
    body: "Keep review status visible before content is queued, posted, or handed to a scheduler."
  },
  {
    number: "03",
    title: "Connector aware",
    body: "Track which channels are ready, which are waiting for verification, and which are intentionally skipped."
  }
];

const workflowCards = [
  {
    number: "A",
    title: "Plan",
    body: "Campaign, audience, offer, source links, and publishing intent are captured in one place."
  },
  {
    number: "B",
    title: "Produce",
    body: "AI drafts are generated against the approved context instead of loose prompts."
  },
  {
    number: "C",
    title: "Publish",
    body: "Approved posts move through connector checks before real scheduling is enabled."
  }
];

const signalCards = [
  {
    label: "Sources",
    value: "Approved",
    detail: "Campaign notes, links, and positioning stay attached to every draft."
  },
  {
    label: "Review",
    value: "Human gate",
    detail: "Every publish route is visible before content reaches a channel."
  },
  {
    label: "Bridge",
    value: "Dry-run live",
    detail: "Buffer is validating the path while direct APIs finish approvals."
  }
];

const connectorCards = [
  { name: "Buffer", state: "Live", tone: "green" },
  { name: "YouTube", state: "OAuth ready", tone: "blue" },
  { name: "LinkedIn", state: "Review pending", tone: "gold" },
  { name: "Discord", state: "Verify pending", tone: "red" }
];

export default function Home() {
  return (
    <main className="landingShell">
      <header className="landingNav landingContainer">
        <Link className="siteBrand" href="/" aria-label="ElevateMindStudio home">
          <Image
            className="siteBrandWordmark"
            src="/brand/elevatemind-final/elevatemind-logo-horizontal-transparent.png"
            alt="ElevateMindStudio"
            width={1123}
            height={310}
            priority
          />
        </Link>
        <nav aria-label="Primary navigation">
          <a href="#platform">Platform</a>
          <a href="#workflow">Workflow</a>
          <Link href="/workspace">Workspace</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </header>

      <section className="landingHero landingContainer" aria-labelledby="hero-title">
        <div className="landingCopy">
          <p className="eyebrow">Social media operating system</p>
          <h1 id="hero-title">Plan, review, and publish without losing the thread.</h1>
          <p>
            A control room for brand memory, AI-assisted drafts, human approval,
            and connector-safe publishing. The platform is ElevateMindStudio; the
            first live campaign is AlgoProven.
          </p>
          <div className="heroActions" aria-label="Primary links">
            <Link className="primaryLink" href="/workspace">Open workspace</Link>
            <a className="secondaryLink" href="#workflow">View workflow</a>
          </div>
          <div className="heroSignalRow" aria-label="Production status">
            <span>API live</span>
            <span>Buffer dry-run</span>
            <span>Legal pages ready</span>
          </div>
        </div>

        <div className="heroScene" aria-hidden="true">
          <div className="sceneTopline">
            <span>AlgoProven campaign room</span>
            <strong>Live MVP</strong>
          </div>
          <div className="sceneGrid">
            <div className="scenePanel sourcePanel">
              <span className="miniLabel">Brand memory</span>
              <strong>Source-backed drafts</strong>
              <div className="sceneLines">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="scenePanel reviewPanel">
              <span className="miniLabel">Approval lane</span>
              <strong>Review before reach</strong>
              <div className="sceneApproval">
                <span>Draft</span>
                <span>Approve</span>
                <span>Queue</span>
              </div>
            </div>
            <div className="scenePanel channelPanel">
              <span className="miniLabel">Connectors</span>
              <div className="sceneConnectors">
                {connectorCards.map((connector) => (
                  <span className={`sceneConnector ${connector.tone}`} key={connector.name}>
                    <b>{connector.name}</b>
                    <small>{connector.state}</small>
                  </span>
                ))}
              </div>
            </div>
            <div className="scenePanel publishPanel">
              <span className="miniLabel">Publish gates</span>
              <strong>No auto-posting</strong>
              <div className="gateRail">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="signalBand" aria-label="Operating signals">
        <div className="landingContainer signalGrid">
          {signalCards.map((signal) => (
            <article className="signalCard" key={signal.label}>
              <span>{signal.label}</span>
              <strong>{signal.value}</strong>
              <p>{signal.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="platform" className="landingBand">
        <div className="landingContainer">
          <p className="eyebrow">Platform</p>
          <h2>One operating layer between ideas, approvals, and publishing.</h2>
          <p className="bandLead">
            The system is built around source-of-truth content, review state,
            connector readiness, and a clear separation between the platform and
            every managed brand campaign.
          </p>
          <div className="landingCardGrid">
            {platformCards.map((card) => (
              <article className="landingCard" key={card.title}>
                <span className="cardNumber">{card.number}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="landingBand darkBand">
        <div className="landingContainer">
          <p className="eyebrow">Workflow</p>
          <h2>Designed around review before reach.</h2>
          <p className="bandLead">
            The current MVP connects the workspace to a production API, Buffer
            dry-run validation, YouTube status, legal pages, and explicit publish
            gates. LinkedIn and Discord remain staged until their verifications are approved.
          </p>
          <div className="landingCardGrid">
            {workflowCards.map((card) => (
              <article className="landingCard" key={card.title}>
                <span className="cardNumber">{card.number}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
          <div className="heroActions">
            <Link className="primaryLink invertedLink" href="/workspace">Open live workspace</Link>
            <a className="secondaryLink mutedLink" href="https://api.elevatemindstudio.net/health">API health</a>
          </div>
        </div>
      </section>

      <section className="landingBand">
        <div className="landingContainer">
          <p className="eyebrow">First campaign</p>
          <h2>AlgoProven is the first managed brand inside the platform.</h2>
          <p className="bandLead">
            ElevateMindStudio is the platform. AlgoProven is the first brand campaign.
            That separation lets the system grow from one owned brand into a reusable
            social media operations workspace.
          </p>
          <div className="identityGrid">
            <div className="landingCard identityCard">
              <h3>Platform identity</h3>
              <p>ElevateMindStudio owns the product, API, workspace, legal pages, connectors, and approval model.</p>
            </div>
            <div className="landingCard identityCard">
              <h3>Campaign identity</h3>
              <p>AlgoProven owns the social channels, audience, content themes, and campaign output.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="siteFooter">
        <span>(c) 2026 ElevateMindStudio</span>
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
