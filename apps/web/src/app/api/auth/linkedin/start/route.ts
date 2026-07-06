import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri =
    process.env.LINKEDIN_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`;
  const scopes =
    process.env.LINKEDIN_SCOPES ?? "openid profile email w_member_social";

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: "LinkedIn OAuth env vars are not configured yet.",
        required: ["LINKEDIN_CLIENT_ID", "LINKEDIN_REDIRECT_URI"],
      },
      { status: 503 },
    );
  }

  const state = crypto.randomUUID();
  const authorizationUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");

  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("scope", scopes);

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

