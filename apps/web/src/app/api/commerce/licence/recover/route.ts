import { NextResponse } from "next/server";
import { requestLicenceRecovery } from "@/lib/server/commerce";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown };
    if (typeof body.email !== "string") {
      return NextResponse.json({ error: "Enter the purchaser email address." }, { status: 400 });
    }
    const result = await requestLicenceRecovery(body.email);
    return NextResponse.json(result, { status: 202, headers: { "cache-control": "no-store" } });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Recovery could not be started.";
    const safe = /valid purchaser/i.test(message)
      ? message
      : "Licence recovery email is not ready. No purchase was changed.";
    return NextResponse.json({ error: safe }, { status: 503 });
  }
}
