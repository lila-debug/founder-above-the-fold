import { NextResponse } from "next/server";
import { createStripeSandboxCheckout } from "@/lib/server/commerce";
import { isCommerceOfferKey } from "@/lib/commerce-offers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown; termsAccepted?: unknown; offerKey?: unknown };
    if (typeof body.email !== "string") {
      return NextResponse.json({ error: "Enter the purchaser email address." }, { status: 400 });
    }
    if (!isCommerceOfferKey(body.offerKey)) {
      return NextResponse.json({ error: "Choose a labelled offer before checkout." }, { status: 400 });
    }
    const checkout = await createStripeSandboxCheckout({
      email: body.email,
      termsAccepted: body.termsAccepted === true,
      offerKey: body.offerKey,
    });
    return NextResponse.json(checkout, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Checkout could not be created.";
    const safe = /valid purchaser|Accept the licence|Too many checkout|checkout is disabled/i.test(message)
      ? message
      : "Stripe sandbox checkout is not ready.";
    return NextResponse.json({ error: safe }, { status: 503 });
  }
}
