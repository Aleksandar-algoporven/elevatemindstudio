import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutRequest = {
  email?: string;
  mode?: "payment" | "subscription";
  clientReferenceId?: string;
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://app.elevatemindstudio.net";
}

function missingConfig() {
  const missing = [];
  if (!process.env.STRIPE_SECRET_KEY) {
    missing.push("STRIPE_SECRET_KEY");
  }
  if (!process.env.STRIPE_PRICE_ID) {
    missing.push("STRIPE_PRICE_ID");
  }
  return missing;
}

export async function POST(request: Request) {
  const missing = missingConfig();
  if (missing.length) {
    return NextResponse.json(
      {
        error: "Stripe checkout is not configured",
        missing
      },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as CheckoutRequest;
  const mode = body.mode || "subscription";
  const successUrl =
    process.env.STRIPE_SUCCESS_URL ||
    `${appUrl()}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = process.env.STRIPE_CANCEL_URL || `${appUrl()}/billing/cancel`;

  const params = new URLSearchParams();
  params.set("mode", mode);
  params.set("line_items[0][price]", process.env.STRIPE_PRICE_ID || "");
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  params.set("allow_promotion_codes", "true");

  if (body.email) {
    params.set("customer_email", body.email);
  }
  if (body.clientReferenceId) {
    params.set("client_reference_id", body.clientReferenceId);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const payload = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Stripe checkout session failed",
        detail: payload?.error?.message || "Unknown Stripe error"
      },
      { status: response.status }
    );
  }

  return NextResponse.json({
    id: payload.id,
    url: payload.url
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "billing.checkout",
    configured: missingConfig().length === 0
  });
}
