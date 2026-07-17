import { NextResponse } from "next/server";
import { getCheckoutReceiptStatus } from "@/lib/server/commerce";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing checkout reference." }, { status: 400 });
  }

  try {
    const receipt = await getCheckoutReceiptStatus(sessionId);
    return NextResponse.json(receipt, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "The checkout reference is invalid." }, { status: 400 });
  }
}
