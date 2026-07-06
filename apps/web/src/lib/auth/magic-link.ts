import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

type MagicLinkPayload = {
  email: string;
  exp: number;
  nonce: string;
  type: "magic-link";
};

type SessionPayload = {
  email: string;
  exp: number;
  iat: number;
  type: "session";
};

const DEV_SECRET = "dispatch-dev-only-magic-link-secret";

export function getAuthSecret() {
  const secret = process.env.MAGIC_LINK_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_SECRET;
  }

  throw new Error("MAGIC_LINK_SECRET is required in production.");
}

export function createMagicLinkToken(email: string) {
  const payload: MagicLinkPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + 15 * 60,
    nonce: randomBytes(16).toString("hex"),
    type: "magic-link",
  };

  return signPayload(payload);
}

export function verifyMagicLinkToken(token: string) {
  const payload = verifySignedPayload<MagicLinkPayload>(token);

  if (payload.type !== "magic-link") {
    throw new Error("Token is not a magic link.");
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Magic link has expired.");
  }

  return payload;
}

export function createSessionToken(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    email,
    iat: now,
    exp: now + 30 * 24 * 60 * 60,
    type: "session",
  };

  return signPayload(payload);
}

export function verifySessionToken(token: string) {
  const payload = verifySignedPayload<SessionPayload>(token);

  if (payload.type !== "session") {
    throw new Error("Token is not a session.");
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Session has expired.");
  }

  return payload;
}

function signPayload(payload: MagicLinkPayload | SessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySignedPayload<T>(token: string): T {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Malformed token.");
  }

  const expectedSignature = createSignature(encodedPayload);
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signature);

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new Error("Invalid token signature.");
  }

  return JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as T;
}

function createSignature(encodedPayload: string) {
  return createHmac("sha256", getAuthSecret())
    .update(encodedPayload)
    .digest("base64url");
}

