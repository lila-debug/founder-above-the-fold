import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./magic-link";

export const SESSION_COOKIE_NAME = "dispatch_session";

export type OwnerSession = {
  email: string;
  expiresAt: number;
};

export async function getOwnerSession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  return readOwnerSession(token);
}

export function getOwnerSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  return readOwnerSession(token);
}

function readOwnerSession(token?: string): OwnerSession | null {
  if (!token) {
    return null;
  }

  try {
    const session = verifySessionToken(token);
    const ownerEmail = process.env.DISPATCH_OWNER_EMAIL?.trim().toLowerCase();

    if (ownerEmail && session.email !== ownerEmail) {
      return null;
    }

    return {
      email: session.email,
      expiresAt: session.exp,
    };
  } catch {
    return null;
  }
}
