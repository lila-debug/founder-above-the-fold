import { NextRequest, NextResponse } from "next/server";
import { readBearerToken, revokeMobileSession } from "@/lib/server/mobile-auth";

export async function POST(request: NextRequest) {
  const accessToken = readBearerToken(request.headers.get("authorization")) ?? undefined;
  let refreshToken: string | undefined;
  try {
    const body = (await request.json()) as { refreshToken?: unknown };
    refreshToken = typeof body.refreshToken === "string" ? body.refreshToken : undefined;
  } catch {
    // An access token alone is enough to revoke the matching session.
  }
  if (!accessToken && !refreshToken) {
    return NextResponse.json({ error: "A mobile session fastener is required." }, { status: 400 });
  }
  try {
    await revokeMobileSession({ accessToken, refreshToken });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "The mobile session could not be removed." }, { status: 503 });
  }
}
