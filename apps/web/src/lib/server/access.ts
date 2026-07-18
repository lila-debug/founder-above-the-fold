import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { getOwnerSessionFromRequest } from "@/lib/auth/session";
import type { AuditActor } from "./audit";
import { readBearerToken, readMobileSession } from "./mobile-auth";

export async function getWriteActor(request: NextRequest): Promise<AuditActor | null> {
  if (hasValidMcpKey(request)) {
    return "mcp";
  }

  const session = getOwnerSessionFromRequest(request);

  if (session) {
    return "owner";
  }

  const bearer = readBearerToken(request.headers.get("authorization"));
  if (bearer) {
    try {
      const mobileSession = await readMobileSession(bearer);
      if (mobileSession && isAllowedOwner(mobileSession.email)) return "owner";
    } catch {
      // Treat unavailable or invalid native sessions as unauthenticated.
    }
  }

  return null;
}

function isAllowedOwner(email: string) {
  const ownerEmail = process.env.DISPATCH_OWNER_EMAIL?.trim().toLowerCase();
  return !ownerEmail || email.toLowerCase() === ownerEmail;
}

function hasValidMcpKey(request: NextRequest) {
  const configuredKey = process.env.MCP_API_KEY?.trim();

  if (!configuredKey) {
    return false;
  }

  const [scheme, token] = request.headers.get("authorization")?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return false;
  }

  return safeEqual(configuredKey, token);
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
