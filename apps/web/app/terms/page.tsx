import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for ElevateMindStudio."
};

const sections = [
  {
    title: "1. Service",
    body: "ElevateMindStudio is a social media operations platform for planning, generating, reviewing, scheduling, publishing, and monitoring brand content. The service may connect to third-party platforms such as LinkedIn, Meta, Discord, Buffer, and other social media or workflow tools when you authorize those connections."
  },
  {
    title: "2. Accounts and Access",
    body: "You are responsible for maintaining control of the accounts, workspaces, social channels, API keys, and credentials you connect to ElevateMindStudio. You must only connect accounts that you own, administer, or are authorized to manage."
  },
  {
    title: "3. Content Responsibility",
    body: "You remain responsible for the content you submit, generate, approve, schedule, publish, or distribute through the service. AI-assisted drafts are suggestions and must be reviewed before publication. ElevateMindStudio does not guarantee that generated content is accurate, complete, compliant, or suitable for every audience."
  },
  {
    title: "4. Acceptable Use",
    body: "You may not use ElevateMindStudio to publish spam, deceptive content, unlawful content, harassment, malware, unauthorized scraping, platform policy violations, or content that infringes another person's rights. You must follow the terms and policies of every third-party platform connected to the service."
  },
  {
    title: "5. Third-Party Services",
    body: "Third-party platforms are operated by their own providers and are governed by their own terms, developer policies, privacy policies, rate limits, and permission rules. ElevateMindStudio is not responsible for changes, outages, restrictions, or decisions made by those providers."
  },
  {
    title: "6. Beta Availability",
    body: "ElevateMindStudio is currently operated as a private beta. Features may change, integrations may be added or removed, and access may be limited while the product is being developed and tested."
  },
  {
    title: "7. No Warranties",
    body: "The service is provided on an as-is and as-available basis. To the maximum extent permitted by law, ElevateMindStudio disclaims warranties of merchantability, fitness for a particular purpose, non-infringement, uninterrupted availability, and error-free operation."
  },
  {
    title: "8. Limitation of Liability",
    body: "To the maximum extent permitted by law, ElevateMindStudio will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost revenue, lost data, platform restrictions, account actions, or business interruption related to use of the service."
  },
  {
    title: "9. Changes",
    body: "We may update these terms as the product evolves. The updated terms will be posted on this page with a revised effective date."
  },
  {
    title: "10. Contact",
    body: "Questions about these terms can be sent to support@elevatemindstudio.net."
  }
];

export default function TermsPage() {
  return (
    <main className="legalShell">
      <header className="legalHeader">
        <Link className="siteBrand" href="/">
          <span className="siteBrandMark" aria-hidden="true">EM</span>
          <span>ElevateMindStudio</span>
        </Link>
        <Link href="/privacy">Privacy Policy</Link>
      </header>

      <article className="legalDocument">
        <p className="eyebrow">Effective June 28, 2026</p>
        <h1>Terms of Service</h1>
        <p className="legalLead">
          These Terms of Service govern access to and use of ElevateMindStudio.
        </p>

        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
