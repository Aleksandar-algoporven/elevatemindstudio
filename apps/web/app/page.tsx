import Image from "next/image";
import Link from "next/link";

const platformFeatures = [
  {
    label: "Feature 01",
    title: "Brand memory",
    body: "Approved sources, decisions, campaign notes, links, and positioning stay attached to every generated draft."
  },
  {
    label: "Feature 02",
    title: "Approval first",
    body: "Every publish route keeps human review visible before content can reach a queue or scheduler."
  },
  {
    label: "Feature 03",
    title: "Connector aware",
    body: "Channels are tracked as ready, waiting on verification, rate-limited, or intentionally skipped."
  }
];

const workflowSteps = [
  {
    marker: "A.",
    title: "Plan",
    body: "Capture the audience, offer, source links, campaign pillar, and publishing intent in one workspace."
  },
  {
    marker: "B.",
    title: "Produce",
    body: "Generate AI drafts against approved context, not loose prompts or disconnected notes."
  },
  {
    marker: "C.",
    title: "Publish",
    body: "Move approved posts through connector checks before real scheduling is enabled."
  }
];

const channelStatus = [
  { name: "Buffer", state: "Live", tone: "ready" },
  { name: "YouTube", state: "OAuth ready", tone: "neutral" },
  { name: "LinkedIn", state: "Review pending", tone: "watch" },
  { name: "Discord", state: "Verify pending", tone: "watch" }
];

export default function Home() {
  return (
    <main className="magazineShell">
      <header className="magazineHeader">
        <div className="magazineWrap navInner">
          <Link className="brandLockup" href="/" aria-label="ElevateMindStudio home">
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
            <a href="#campaign">Campaign</a>
            <a href="#request-access">Request access</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link className="navCta" href="/workspace">Open workspace</Link>
          </nav>
        </div>
      </header>

      <section className="masthead magazineWrap" aria-labelledby="home-title">
        <div className="folioLine">
          <span>Issue 01 - The Operations Edition</span>
          <span>Est. 2026 - Belgrade / Global</span>
        </div>
        <div className="inkRule" />
        <div className="kickerLine">
          <span>Social media operating system</span>
          <span>Review before reach</span>
        </div>

        <div className="coverGrid">
          <div className="coverCopy">
            <p className="kicker">Private beta</p>
            <h1 id="home-title">
              Plan, <em>review</em>, and publish without losing the thread.
            </h1>
          </div>
          <div className="coverArt" aria-label="ElevateMindStudio operating cover">
            <Image
              className="coverLogo"
              src="/brand/elevatemind-final/elevatemind-logo-stacked-transparent.png"
              alt=""
              width={900}
              height={900}
              priority
            />
            <div className="coverColumn left">
              <span>Sources</span>
              <strong>16</strong>
              <small>approved memory items</small>
            </div>
            <div className="coverColumn right">
              <span>Review</span>
              <strong>Human gate</strong>
              <small>No auto-posting</small>
            </div>
            <div className="gateStamp">
              <span>Human gate - on</span>
              <strong>No auto-posting</strong>
            </div>
          </div>
        </div>

        <div className="ledeBar">
          <p>
            A control room for brand memory, AI-assisted drafts, human approval,
            and connector-safe publishing. The platform is <strong>ElevateMindStudio</strong>;
            the first live campaign is <b>AlgoProven</b>.
          </p>
          <div className="ledeActions">
            <form
              className="quickRequestForm"
              action="mailto:support@elevatemindstudio.net"
              method="post"
              encType="text/plain"
            >
              <span>Request access</span>
              <input name="name" type="text" placeholder="Name" required />
              <input name="email" type="email" placeholder="Email" required />
              <button type="submit">Send request</button>
            </form>
            <Link className="textLink" href="/workspace">Open workspace</Link>
          </div>
        </div>
      </section>

      <section id="request-access" className="requestSection">
        <div className="magazineWrap requestGrid">
          <div>
            <p className="sectionFolio">Private beta intake</p>
            <h2>Request access to the operating room.</h2>
            <p>
              Tell us what brand you want to run through ElevateMindStudio and
              which channels matter first. This keeps the early workspace focused
              on real accounts, real approvals, and real publishing constraints.
            </p>
          </div>
          <form
            className="requestForm"
            action="mailto:support@elevatemindstudio.net"
            method="post"
            encType="text/plain"
          >
            <label>
              <span>Name</span>
              <input name="name" type="text" placeholder="Aleksandar" required />
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
                placeholder="Channels, content sources, approval rules, and publishing goals."
                rows={5}
                required
              />
            </label>
            <button type="submit">Send request</button>
          </form>
        </div>
      </section>

      <section id="platform" className="featureSection">
        <div className="magazineWrap">
          <p className="sectionFolio">Feature 01 - The platform</p>
          <blockquote>
            One operating layer between ideas, approvals, and publishing.
          </blockquote>
          <div className="editorialColumns">
            <p>
              <span>B</span>uilt around source-of-truth content, review state,
              connector readiness, and a clear separation between the platform
              and every managed brand campaign.
            </p>
            <p>
              Brand memory comes first. Approved sources, campaign notes, links,
              and decisions become the base layer for every draft the system
              generates, so the AI works from owned context instead of guesswork.
            </p>
            <p>
              Approval is never an afterthought. Review status stays visible
              before content is queued, posted, or handed to a scheduler.
            </p>
          </div>

          <div className="featureTriptych">
            {platformFeatures.map((feature) => (
              <article key={feature.title} className="featureTile">
                <span>{feature.label}</span>
                <div className="figureFrame">
                  <i />
                  <i />
                  <i />
                </div>
                <h2>{feature.title}</h2>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="darkFeature">
        <div className="magazineWrap workflowGrid">
          <div>
            <p className="sectionFolio">Feature 02 - The workflow</p>
            <h2>Designed around review before reach.</h2>
            <p>
              The MVP connects the workspace to a production API, Buffer dry-run
              validation, YouTube status, legal pages, and explicit publish gates.
              LinkedIn and Discord stay staged until their verifications are approved.
            </p>
          </div>
          <div className="workflowPanel" aria-label="Workflow status">
            <span>Draft</span>
            <span>Review</span>
            <span>Queue</span>
            <span>Dry-run</span>
          </div>
          <div className="workflowSteps">
            {workflowSteps.map((step) => (
              <article key={step.title}>
                <strong>{step.marker}</strong>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="statusDesk">
        <div className="magazineWrap statusGrid">
          <div>
            <p className="sectionFolio">Status desk</p>
            <h2>Where every channel stands today.</h2>
            <p>
              Buffer validates the publish path while direct APIs finish approvals.
              Nothing is auto-posted.
            </p>
            <Link className="btnGold" href="/workspace">Open live workspace</Link>
          </div>
          <div className="channelTable">
            {channelStatus.map((channel) => (
              <div key={channel.name}>
                <span>{channel.name}</span>
                <strong className={`statusText ${channel.tone}`}>{channel.state}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="campaign" className="campaignBackpage">
        <div className="magazineWrap campaignGrid">
          <div>
            <p className="sectionFolio">The last word - first campaign</p>
            <h2>AlgoProven is the first managed brand inside the platform.</h2>
          </div>
          <div className="identityRows">
            <article>
              <span>Platform - ElevateMindStudio</span>
              <p>Owns the product, API, workspace, legal pages, and integration layer.</p>
            </article>
            <article>
              <span>Campaign - AlgoProven</span>
              <p>Owns the social channels, audience, content themes, and campaign output.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="magazineFooter">
        <div className="magazineWrap footerInner">
          <div>
            <Image
              src="/brand/elevatemind-final/elevatemind-logo-horizontal-transparent.png"
              alt="ElevateMindStudio"
              width={1123}
              height={310}
            />
            <p>
              A private social media operations platform for planning, reviewing,
              approving, and publishing brand content.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/workspace">Workspace</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="mailto:support@elevatemindstudio.net">Contact</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
