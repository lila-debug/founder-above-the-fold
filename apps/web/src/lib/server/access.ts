import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { getOwnerSessionFromRequest } from "@/lib/auth/session";
import type { AuditActor } from "./audit";

export async function getWriteActor(request: NextRequest): Promise<AuditActor | null> {
  if (hasValidMcpKey(request)) {
    return "mcp";
  }

  const session = getOwnerSessionFromRequest(request);

  return session ? "owner" : null;
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
