import { NextRequest, NextResponse } from "next/server";
import { exchangeMobileMagicLink, MobileAuthError } from "@/lib/server/mobile-auth";
import { writeAuditEvent } from "@/lib/server/audit";

export async function POST(request: NextRequest) {
  let body: { token?: unknown; deviceName?: unknown };
  try {
    body = (await request.json()) as { token?: unknown; deviceName?: unknown };
  } catch {
    return NextResponse.json({ error: "Send a valid JSON body." }, { status: 400 });
  }
  if (typeof body.token !== "string" || !body.token.trim()) {
    return NextResponse.json({ error: "A mobile sign-in fastener is required." }, { status: 400 });
  }
  try {
    const issued = await exchangeMobileMagicLink({ token: body.token, deviceName: typeof body.deviceName === "string" ? body.deviceName : null });
    try {
      await writeAuditEvent({
        actor: "owner",
        action: "auth.mobile_signed_in",
        entityType: "mobile_session",
        entityId: issued.session.id,
        metadata: { device_name: issued.session.deviceName },
      });
    } catch {
      // Do not consume a one-time link without returning the already-issued session.
      // Launch proof remains incomplete until a later audited sign-in succeeds.
    }
    return NextResponse.json(issued, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof MobileAuthError ? error.statusCode : 503;
    const message = error instanceof MobileAuthError ? error.message : "The mobile session could not be assembled.";
    return NextResponse.json({ error: message }, { status });
  }
}
