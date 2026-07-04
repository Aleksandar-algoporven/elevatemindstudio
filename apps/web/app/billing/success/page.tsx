import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <main className="legalShell">
      <section className="legalDocument">
        <p className="eyebrow">Billing</p>
        <h1>Payment received</h1>
        <p>
          Stripe returned a successful checkout session. Access provisioning will be
          connected after the billing data model is added.
        </p>
        <Link className="primaryLink" href="/workspace">Open workspace</Link>
      </section>
    </main>
  );
}
