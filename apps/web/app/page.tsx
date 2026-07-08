import Image from "next/image";
import Link from "next/link";

const statusItems = [
  ["API", "Live"],
  ["Workspace", "Ready"],
  ["Publishing", "Human gate"]
];

const features = [
  {
    title: "Brand memory",
    body: "Store source material, campaign notes, positioning, and approved claims before AI drafts anything."
  },
  {
    title: "Review workflow",
    body: "Drafts move through human approval before queueing or publishing, so nothing reaches a channel by accident."
  },
  {
    title: "Connector readiness",
    body: "Track Buffer, YouTube, LinkedIn, Discord, and future channels from one operational view."
  }
];

export default function Home() {
  return (
    <main className="publicStableShell">
      <header className="stableNav">
        <Link className="stableBrand" href="/" aria-label="ElevateMindStudio home">
          <Image
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
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link className="stableNavCta" href="/workspace">Open workspace</Link>
        </nav>
      </header>

      <section className="stableHero">
        <div className="stableHeroCopy">
          <p className="stableKicker">Social media operating system</p>
          <h1>Plan, review, and publish with one clear approval gate.</h1>
          <p>
            ElevateMindStudio is a control room for brand memory, AI-assisted
            drafts, human approval, and connector-safe publishing. AlgoProven is
            the first live campaign.
          </p>
          <div className="stableStatus">
            {statusItems.map(([label, value]) => (
              <span key={label}>
                <b>{label}</b>
                {value}
              </span>
            ))}
          </div>
        </div>

        <aside className="stableFormCard" aria-label="Request access form">
          <div className="stableFormHead">
            <span>Private beta</span>
            <strong>Request access</strong>
          </div>
          <form
            action="mailto:support@elevatemindstudio.net"
            method="post"
            encType="text/plain"
          >
            <label>
              <span>Name</span>
              <input name="name" type="text" placeholder="Your name" required />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" placeholder="you@example.com" required />
            </label>
            <label>
              <span>Brand / company</span>
              <input name="brand" type="text" placeholder="AlgoProven" />
            </label>
            <label>
              <span>What should the agent manage?</span>
              <textarea
                name="message"
                placeholder="Channels, sources, approvals, publishing goals..."
                rows={5}
                required
              />
            </label>
            <button type="submit">Send request</button>
          </form>
        </aside>
      </section>

      <section id="platform" className="stableBand">
        <div>
          <p className="stableKicker">Platform</p>
          <h2>Built for source-backed content operations.</h2>
        </div>
        <div className="stableFeatureGrid">
          {features.map((feature) => (
            <article key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="stableDarkBand">
        <div>
          <p className="stableKicker">Workflow</p>
          <h2>Review before reach.</h2>
          <p>
            The workspace connects source intake, Claude draft generation,
            review controls, Buffer dry-run validation, inbox triage, and
            connector readiness into one operating surface.
          </p>
          <Link href="/workspace">Open live workspace</Link>
        </div>
      </section>

      <footer className="stableFooter">
        <span>2026 ElevateMindStudio</span>
        <nav aria-label="Footer navigation">
          <Link href="/workspace">Workspace</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:support@elevatemindstudio.net">Contact</a>
        </nav>
      </footer>
    </main>
  );
}
