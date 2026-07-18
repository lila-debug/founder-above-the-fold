import { NextRequest, NextResponse } from "next/server";
import { getLinkedInAuthorizationUrl, getLinkedInSetupMissingEnv } from "@/lib/server/linkedin";
import { createMobileLinkedInFlow, readBearerToken } from "@/lib/server/mobile-auth";

export async function POST(request: NextRequest) {
  const token = readBearerToken(request.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Mobile sign-in is required." }, { status: 401 });
  const missing = getLinkedInSetupMissingEnv();
  if (missing.length) return NextResponse.json({ error: "LinkedIn OAuth setup is incomplete.", missing }, { status: 503 });
  try {
    const state = await createMobileLinkedInFlow(token);
    return NextResponse.json({ authorizationUrl: getLinkedInAuthorizationUrl(state).toString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error && typeof error === "object" && "statusCode" in error ? Number(error.statusCode) : 503;
    return NextResponse.json({ error: status === 401 ? "The mobile session has expired." : "LinkedIn connection could not start." }, { status });
  }
}
