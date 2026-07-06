import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = (await cookies()).get("linkedin_oauth_state")?.value;

  if (!code) {
    return NextResponse.json(
      { error: "LinkedIn did not return an authorization code." },
      { status: 400 },
    );
  }

  if (!state || !storedState || state !== storedState) {
    return NextResponse.json(
      { error: "LinkedIn OAuth state did not match. Restart the connection." },
      { status: 400 },
    );
  }

  const redirectUrl = new URL("/", request.nextUrl.origin);
  redirectUrl.searchParams.set("linkedin", "oauth-code-received");

  return NextResponse.redirect(redirectUrl);
}

