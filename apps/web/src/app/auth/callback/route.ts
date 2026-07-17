import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  verifyMagicLinkToken,
} from "@/lib/auth/magic-link";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { writeAuditEvent } from "@/lib/server/audit";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return redirectWithAuthState(request, "missing-token");
  }

  try {
    const payload = verifyMagicLinkToken(token);
    const ownerEmail = process.env.DISPATCH_OWNER_EMAIL?.trim().toLowerCase();

    if (ownerEmail && payload.email !== ownerEmail) {
      return redirectWithAuthState(request, "wrong-owner");
    }

    const sessionToken = createSessionToken(payload.email);
    const response = redirectWithAuthState(request, "signed-in");

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    try {
      await writeAuditEvent({
        actor: "owner",
        action: "auth.owner_signed_in",
        entityType: "owner_session",
        metadata: { method: "magic_link" },
      });
    } catch {
      // Session creation remains available if the audit parts bin is temporarily offline.
      // The public launch proof stays unverified until a later successful audited sign-in.
    }

    return response;
  } catch {
    return redirectWithAuthState(request, "invalid-token");
  }
}

function redirectWithAuthState(request: NextRequest, state: string) {
  const url = new URL("/", request.nextUrl.origin);
  url.searchParams.set("auth", state);

  return NextResponse.redirect(url);
}
