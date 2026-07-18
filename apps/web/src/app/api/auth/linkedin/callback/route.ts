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
import { consumeMobileLinkedInFlow } from "@/lib/server/mobile-auth";

const LINKEDIN_STATE_COOKIE = "linkedin_oauth_state";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const linkedInError = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(LINKEDIN_STATE_COOKIE)?.value;
  const ownerEmail = process.env.DISPATCH_OWNER_EMAIL?.trim().toLowerCase();
  const mobileOwnerEmail = state && (code || linkedInError)
    ? await consumeMobileLinkedInFlow(state).catch(() => null)
    : null;
  const isMobile = Boolean(mobileOwnerEmail);

  if (!ownerEmail) {
    return redirectWithLinkedInState(request, "owner-email-missing", isMobile);
  }

  if (linkedInError) {
    await markLinkedInAttentionRequired({
      ownerEmail,
      reason: "linkedin_authorization_failed",
    });

    return redirectWithLinkedInState(request, "attention-required", isMobile);
  }

  if (!code) {
    return redirectWithLinkedInState(request, "missing-code", isMobile);
  }

  if (!state || (!isMobile && (!storedState || state !== storedState))) {
    return redirectWithLinkedInState(request, "invalid-state", isMobile);
  }

  if (mobileOwnerEmail && mobileOwnerEmail.toLowerCase() !== ownerEmail) {
    return redirectWithLinkedInState(request, "wrong-owner", true);
  }

  try {
    const tokenSet = await exchangeLinkedInCodeForToken(code);
    const profile = await fetchLinkedInOwnerProfile(tokenSet.accessToken);

    if (profile.email !== ownerEmail) {
      return redirectWithLinkedInState(request, "wrong-owner", isMobile);
    }

    const storedConnection = await storeLinkedInConnection({
      ownerEmail,
      profile,
      tokenSet,
    });

    const response = redirectWithLinkedInState(
      request,
      storedConnection.attentionRequired ? "attention-required" : "connected",
      isMobile,
    );
    if (!isMobile) response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(ownerEmail), {
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

    return redirectWithLinkedInState(request, "attention-required", isMobile);
  }
}

function redirectWithLinkedInState(request: NextRequest, state: string, mobile = false) {
  const redirectUrl = mobile
    ? new URL(`founderabovefold://linkedin/result?state=${encodeURIComponent(state)}`)
    : new URL("/", request.nextUrl.origin);
  if (!mobile) {
    redirectUrl.searchParams.set("linkedin", state);
    redirectUrl.hash = "command-centre";
  }

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
