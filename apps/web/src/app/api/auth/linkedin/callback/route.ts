import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth/magic-link";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import {
  exchangeLinkedInCodeForToken,
  fetchLinkedInOwnerProfile,
  LinkedInOAuthError,
  markLinkedInAttentionRequired,
  storeLinkedInConnection,
} from "@/lib/server/linkedin";

const LINKEDIN_STATE_COOKIE = "linkedin_oauth_state";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const linkedInError = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(LINKEDIN_STATE_COOKIE)?.value;
  const ownerEmail = process.env.DISPATCH_OWNER_EMAIL?.trim().toLowerCase();

  if (!ownerEmail) {
    return redirectWithLinkedInState(request, "owner-email-missing");
  }

  if (linkedInError) {
    await markLinkedInAttentionRequired({
      ownerEmail,
      reason: "linkedin_authorization_failed",
    });

    return redirectWithLinkedInState(request, "attention-required");
  }

  if (!code) {
    return redirectWithLinkedInState(request, "missing-code");
  }

  if (!state || !storedState || state !== storedState) {
    return redirectWithLinkedInState(request, "invalid-state");
  }

  try {
    const tokenSet = await exchangeLinkedInCodeForToken(code);
    const profile = await fetchLinkedInOwnerProfile(tokenSet.accessToken);

    if (profile.email !== ownerEmail) {
      return redirectWithLinkedInState(request, "wrong-owner");
    }

    const storedConnection = await storeLinkedInConnection({
      ownerEmail,
      profile,
      tokenSet,
    });

    const response = redirectWithLinkedInState(
      request,
      storedConnection.attentionRequired ? "attention-required" : "connected",
    );
    response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(ownerEmail), {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    await markLinkedInAttentionRequired({
      ownerEmail,
      reason: getAttentionReason(error),
    });

    return redirectWithLinkedInState(request, "attention-required");
  }
}

function redirectWithLinkedInState(request: NextRequest, state: string) {
  const redirectUrl = new URL("/", request.nextUrl.origin);
  redirectUrl.searchParams.set("linkedin", state);

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(LINKEDIN_STATE_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function getAttentionReason(error: unknown) {
  return error instanceof LinkedInOAuthError ? error.reason : "storage_failed";
}
