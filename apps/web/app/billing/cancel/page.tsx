import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <main className="legalShell">
      <section className="legalDocument">
        <p className="eyebrow">Billing</p>
        <h1>Checkout cancelled</h1>
        <p>
          No payment was completed. You can return to the workspace and start a new
          checkout session when ready.
        </p>
        <Link className="primaryLink" href="/workspace">Open workspace</Link>
      </section>
    </main>
  );
}
