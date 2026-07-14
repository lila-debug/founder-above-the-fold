import { NextResponse } from "next/server";
import {
  getLinkedInAuthorizationUrl,
  getLinkedInSetupMissingEnv,
} from "@/lib/server/linkedin";

export async function GET() {
  const missingEnv = getLinkedInSetupMissingEnv();

  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        error: "LinkedIn OAuth setup is not configured yet.",
        missing: missingEnv,
      },
      { status: 503 },
    );
  }

  const state = crypto.randomUUID();
  const authorizationUrl = getLinkedInAuthorizationUrl(state);

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set("linkedin_oauth_state", state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
