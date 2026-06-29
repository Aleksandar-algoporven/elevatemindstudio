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

export default function Home() {
  return (
    <main className="landingShell">
      <header className="landingNav landingContainer">
        <Link className="siteBrand" href="/" aria-label="ElevateMindStudio home">
          <span className="siteBrandMark" aria-hidden="true">EM</span>
          <span>ElevateMindStudio</span>
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
          <h1 id="hero-title">Build, review, and publish brand content without losing the thread.</h1>
          <p>
            ElevateMindStudio turns trusted brand sources into channel-ready drafts,
            approval queues, and controlled publishing workflows for owned brands and
            managed campaigns. The first live campaign is AlgoProven.
          </p>
          <div className="heroActions" aria-label="Primary links">
            <Link className="primaryLink" href="/workspace">Open workspace</Link>
            <a className="secondaryLink" href="#workflow">View workflow</a>
          </div>
          <p className="landingNote">Private beta. Integrations are connected only with authorized brand accounts.</p>
        </div>

        <div className="landingBoard" aria-label="Product preview">
          <div className="landingBoardTop">
            <span>AlgoProven campaign room</span>
            <strong>Buffer connected</strong>
          </div>
          <div className="landingBoardBody">
            <aside className="landingChannelRail">
              <span className="miniLabel">Channels</span>
              <div className="landingChannelList">
                <div className="landingChannel">
                  <strong>X / Twitter</strong>
                  <span className="bar"><span className="mossBar" /></span>
                </div>
                <div className="landingChannel">
                  <strong>YouTube</strong>
                  <span className="bar"><span className="skyBar" /></span>
                </div>
                <div className="landingChannel">
                  <strong>Instagram</strong>
                  <span className="bar"><span className="clayBar" /></span>
                </div>
              </div>
            </aside>

            <section className="landingWork">
              <span className="miniLabel">Publishing pipeline</span>
              <div className="landingPipeline">
                {["Sources", "Drafts", "Approval", "Queue"].map((stage) => (
                  <div className="landingStage" key={stage}>
                    <b>{stage}</b>
                    <span />
                    <span />
                  </div>
                ))}
              </div>
              <article className="landingDraftCard">
                <div className="draftHead">
                  <span>Draft review</span>
                  <span className="statusChip status-needs-review">Needs approval</span>
                </div>
                <h3>One idea, adapted for each channel.</h3>
                <p>
                  The workspace keeps source context, brand voice, approval status,
                  and publish target visible before anything leaves the system.
                </p>
                <div className="reviewRow">
                  <span>Dry-run publish validation is live.</span>
                  <span className="statusChip connector-connected">Safe to test</span>
                </div>
              </article>
            </section>
          </div>
        </div>
      </section>

      <section id="platform" className="landingBand">
        <div className="landingContainer">
          <p className="eyebrow">Platform</p>
          <h2>A control room for social media operations.</h2>
          <p className="bandLead">
            ElevateMindStudio is not a posting toy. It is the operating layer between
            brand knowledge, AI-assisted drafting, human review, and publishing systems.
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
            The current MVP connects the workspace to Buffer dry-run validation,
            YouTube status, legal pages, and a production API. LinkedIn and Discord
            stay staged until their verifications are approved.
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
              <p>ElevateMindStudio owns the product, API, workspace, legal pages, and integration layer.</p>
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
