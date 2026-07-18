import { NextRequest, NextResponse } from "next/server";
import { MobileAuthError, rotateMobileSession } from "@/lib/server/mobile-auth";

export async function POST(request: NextRequest) {
  let body: { refreshToken?: unknown };
  try {
    body = (await request.json()) as { refreshToken?: unknown };
  } catch {
    return NextResponse.json({ error: "Send a valid JSON body." }, { status: 400 });
  }
  if (typeof body.refreshToken !== "string" || !body.refreshToken) {
    return NextResponse.json({ error: "A refresh fastener is required." }, { status: 400 });
  }
  try {
    return NextResponse.json(await rotateMobileSession(body.refreshToken), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof MobileAuthError ? error.statusCode : 503;
    const message = error instanceof MobileAuthError ? error.message : "The mobile session could not be refreshed.";
    return NextResponse.json({ error: message }, { status });
  }
}
