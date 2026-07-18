import { NextRequest, NextResponse } from "next/server";
import { getEnvReport } from "@/lib/server/env";
import { readBearerToken, readMobileSession } from "@/lib/server/mobile-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = readBearerToken(request.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Mobile sign-in is required." }, { status: 401 });
  try {
    const session = await readMobileSession(token);
    const ownerEmail = process.env.DISPATCH_OWNER_EMAIL?.trim().toLowerCase();
    if (!session || (ownerEmail && session.email.toLowerCase() !== ownerEmail)) {
      return NextResponse.json({ error: "The mobile session has expired." }, { status: 401 });
    }
    const env = getEnvReport();
    return NextResponse.json({
      session,
      features: {
        posts: true,
        profileCopy: true,
        templates: true,
        analytics: true,
        linkedinOAuthConfigured: Object.values(env.linkedin).every((value) => value === "configured"),
        cloudVoiceConfigured: Object.values(env.cloudVoice).every((value) => value === "configured"),
      },
      safety: { scraping: false, automatedMessages: false, profileEditsAreManual: true },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "The mobile session could not be inspected." }, { status: 503 });
  }
}
