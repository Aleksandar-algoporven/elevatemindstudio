import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=", 2);
      return [key, value];
    })
  );

  if (!parts.t || !parts.v1) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${parts.t}.${payload}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(parts.v1, "hex");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signatureHeader = request.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (webhookSecret && !verifyStripeSignature(payload, signatureHeader, webhookSecret)) {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  let eventType = "unknown";
  try {
    const event = JSON.parse(payload) as { type?: string };
    eventType = event.type ?? "unknown";
  } catch {
    eventType = "unparseable";
  }

  return NextResponse.json({
    received: true,
    eventType,
    verified: Boolean(webhookSecret)
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "billing.webhook"
  });
}
