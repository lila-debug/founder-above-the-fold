import { timingSafeEqual } from "node:crypto";

export type VoiceAccessResult = "authorized" | "missing_configuration" | "unauthorized";

export function checkVoiceAccess(request: Request): VoiceAccessResult {
  const expected = process.env.IOS_VOICE_API_KEY?.trim();
  if (!expected) {
    return "missing_configuration";
  }

  const [scheme, token] = request.headers.get("authorization")?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token || !safeEqual(expected, token)) {
    return "unauthorized";
  }

  return "authorized";
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
  );
}
