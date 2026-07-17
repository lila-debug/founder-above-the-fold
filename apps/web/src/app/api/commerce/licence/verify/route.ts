import { NextResponse } from "next/server";
import { verifyLicenceReceipt } from "@/lib/server/licence-receipts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { receipt?: unknown };
    if (typeof body.receipt !== "string") {
      return NextResponse.json({ error: "A signed licence receipt is required." }, { status: 400 });
    }
    const result = await verifyLicenceReceipt(body.receipt);
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "The signed licence receipt rail is not ready." }, {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }
}
