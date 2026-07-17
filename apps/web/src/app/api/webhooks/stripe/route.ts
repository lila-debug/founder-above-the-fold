import { NextResponse } from "next/server";
import { applyStripeEvent } from "@/lib/server/commerce";
import { getStripeClient, getStripeConfig, stripeObjectMatchesConfiguredMode } from "@/lib/server/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });

  try {
    const raw = await request.text();
    const config = getStripeConfig();
    const event = await getStripeClient().webhooks.constructEventAsync(
      raw,
      signature,
      config.webhookSecret,
    );
    if (!stripeObjectMatchesConfiguredMode(event.livemode)) {
      return NextResponse.json({ error: "Stripe event mode mismatch." }, { status: 400 });
    }
    const result = await applyStripeEvent(event);
    return NextResponse.json({ received: true, ...result });
  } catch {
    return NextResponse.json({ error: "Invalid Stripe webhook." }, { status: 400 });
  }
}
