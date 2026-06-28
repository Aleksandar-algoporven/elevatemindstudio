import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for ElevateMindStudio."
};

const sections = [
  {
    title: "1. Information We Collect",
    body: "We may collect account and contact information you provide, workspace settings, brand content, drafts, approvals, publishing metadata, integration configuration, support messages, and technical logs. When you connect a third-party platform, we may receive identifiers, permissions, profile or page metadata, channel metadata, content status, and other data made available by that platform's API."
  },
  {
    title: "2. How We Use Information",
    body: "We use information to operate ElevateMindStudio, authenticate integrations, generate and review drafts, schedule or publish approved content, display operational status, provide alerts, improve reliability, prevent abuse, troubleshoot issues, and communicate about the service."
  },
  {
    title: "3. AI Processing",
    body: "ElevateMindStudio may process submitted brand materials, prompts, drafts, and context through AI service providers to generate or improve content workflows. Users should avoid submitting sensitive personal information unless it is necessary for the intended workflow."
  },
  {
    title: "4. Third-Party Integrations",
    body: "If you authorize integrations such as LinkedIn, Meta, Discord, Buffer, or similar services, ElevateMindStudio uses the granted permissions only to provide the connected product features. You can revoke platform access through the relevant third-party account settings or by contacting us."
  },
  {
    title: "5. Sharing",
    body: "We do not sell personal information. We may share information with service providers that help us host, secure, operate, analyze, or support the service, and with third-party platforms when needed to perform actions you authorize. We may also disclose information if required by law or to protect rights, safety, and security."
  },
  {
    title: "6. Data Retention",
    body: "We retain information for as long as needed to provide the service, comply with legal obligations, resolve disputes, maintain security, and support operational records. Private beta data may be removed or migrated as the product evolves."
  },
  {
    title: "7. Security",
    body: "We use reasonable administrative, technical, and organizational safeguards designed to protect information. No internet service can guarantee absolute security, and users are responsible for protecting their own connected accounts and credentials."
  },
  {
    title: "8. Your Choices",
    body: "You may request access, correction, export, deletion, or disconnection of your information by contacting us. Some requests may be limited by legal, security, operational, or platform requirements."
  },
  {
    title: "9. Children",
    body: "ElevateMindStudio is not intended for children under 13 and should not be used by anyone who is not legally permitted to use the connected third-party platforms."
  },
  {
    title: "10. Changes",
    body: "We may update this Privacy Policy as the product, integrations, or legal requirements change. The updated policy will be posted on this page with a revised effective date."
  },
  {
    title: "11. Contact",
    body: "Privacy questions or requests can be sent to support@elevatemindstudio.net."
  }
];

export default function PrivacyPage() {
  return (
    <main className="legalShell">
      <header className="legalHeader">
        <Link className="siteBrand" href="/">
          <span className="siteBrandMark" aria-hidden="true">EM</span>
          <span>ElevateMindStudio</span>
        </Link>
        <Link href="/terms">Terms of Service</Link>
      </header>

      <article className="legalDocument">
        <p className="eyebrow">Effective June 28, 2026</p>
        <h1>Privacy Policy</h1>
        <p className="legalLead">
          This Privacy Policy explains how ElevateMindStudio collects, uses, and protects information when you use the service.
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
