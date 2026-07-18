import { createHash, randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import { getDbPool, hasDatabaseUrl } from "./db";

const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;

type MobileSessionRow = {
  id: string;
  owner_email: string;
  device_name: string | null;
  access_expires_at: Date;
  refresh_expires_at: Date;
};

export type MobileTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  refreshExpiresAt: string;
};

export type MobileSession = {
  id: string;
  email: string;
  deviceName: string | null;
  accessExpiresAt: string;
  refreshExpiresAt: string;
};

export class MobileAuthError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "MobileAuthError";
  }
}

export async function checkMobileAuthSchema(): Promise<"available" | "setup_required"> {
  if (!hasDatabaseUrl()) return "setup_required";
  try {
    const result = await getDbPool().query<{ mobile_sessions: string | null; mobile_magic_links: string | null }>(
      `select to_regclass('public.mobile_sessions') as mobile_sessions,
              to_regclass('public.mobile_magic_links') as mobile_magic_links`,
    );
    const row = result.rows[0];
    return row?.mobile_sessions && row.mobile_magic_links ? "available" : "setup_required";
  } catch {
    return "setup_required";
  }
}

export function generateOpaqueToken(kind: "magic" | "access" | "refresh") {
  return `fat_${kind}_${randomBytes(32).toString("base64url")}`;
}

export function hashMobileToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createMobileMagicLink(email: string) {
  const token = generateOpaqueToken("magic");
  await getDbPool().query(
    `insert into mobile_magic_links (owner_email, token_hash, expires_at)
     values ($1, $2, $3)`,
    [email, hashMobileToken(token), new Date(Date.now() + MAGIC_LINK_TTL_MS)],
  );
  return token;
}

export async function exchangeMobileMagicLink(input: { token: string; deviceName?: string | null }) {
  const client = await getDbPool().connect();
  try {
    await client.query("begin");
    const result = await client.query<{ id: string; owner_email: string }>(
      `update mobile_magic_links
       set used_at = now()
       where token_hash = $1 and used_at is null and expires_at > now()
       returning id, owner_email`,
      [hashMobileToken(input.token)],
    );
    const link = result.rows[0];
    if (!link) throw new MobileAuthError("This mobile sign-in link is invalid, expired, or already used.", 401);

    const issued = await insertSession(client, link.owner_email, normaliseDeviceName(input.deviceName));
    await client.query("commit");
    return issued;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function rotateMobileSession(refreshToken: string) {
  const client = await getDbPool().connect();
  try {
    await client.query("begin");
    const result = await client.query<MobileSessionRow>(
      `select id, owner_email, device_name, access_expires_at, refresh_expires_at
       from mobile_sessions
       where refresh_token_hash = $1 and revoked_at is null and refresh_expires_at > now()
       for update`,
      [hashMobileToken(refreshToken)],
    );
    const session = result.rows[0];
    if (!session) throw new MobileAuthError("The mobile session cannot be refreshed. Sign in again.", 401);

    const tokens = makeTokenPair();
    await client.query(
      `update mobile_sessions
       set access_token_hash = $2, refresh_token_hash = $3,
           access_expires_at = $4, refresh_expires_at = $5, last_used_at = now()
       where id = $1`,
      [session.id, hashMobileToken(tokens.accessToken), hashMobileToken(tokens.refreshToken), tokens.accessExpiresAt, tokens.refreshExpiresAt],
    );
    await client.query("commit");
    return publicTokens(tokens);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function readMobileSession(accessToken: string): Promise<MobileSession | null> {
  const result = await getDbPool().query<MobileSessionRow>(
    `update mobile_sessions
     set last_used_at = now()
     where access_token_hash = $1 and revoked_at is null
       and access_expires_at > now() and refresh_expires_at > now()
     returning id, owner_email, device_name, access_expires_at, refresh_expires_at`,
    [hashMobileToken(accessToken)],
  );
  const row = result.rows[0];
  return row ? toMobileSession(row) : null;
}

export async function revokeMobileSession(input: { accessToken?: string; refreshToken?: string }) {
  const clauses: string[] = [];
  const values: string[] = [];
  if (input.accessToken) {
    values.push(hashMobileToken(input.accessToken));
    clauses.push(`access_token_hash = $${values.length}`);
  }
  if (input.refreshToken) {
    values.push(hashMobileToken(input.refreshToken));
    clauses.push(`refresh_token_hash = $${values.length}`);
  }
  if (!clauses.length) return false;
  const result = await getDbPool().query(
    `update mobile_sessions set revoked_at = now() where revoked_at is null and (${clauses.join(" or ")})`,
    values,
  );
  return Boolean(result.rowCount);
}

export async function createMobileLinkedInFlow(accessToken: string) {
  const session = await readMobileSession(accessToken);
  if (!session) throw new MobileAuthError("The mobile session has expired.", 401);
  const state = generateOpaqueToken("magic");
  await getDbPool().query(
    `insert into mobile_linkedin_oauth_flows (mobile_session_id, state_hash, expires_at)
     values ($1, $2, $3)`,
    [session.id, hashMobileToken(state), new Date(Date.now() + 10 * 60 * 1000)],
  );
  return state;
}

export async function consumeMobileLinkedInFlow(state: string) {
  const result = await getDbPool().query<{ owner_email: string }>(
    `update mobile_linkedin_oauth_flows as flow
     set used_at = now()
     from mobile_sessions as session
     where flow.state_hash = $1 and flow.used_at is null and flow.expires_at > now()
       and session.id = flow.mobile_session_id and session.revoked_at is null
       and session.refresh_expires_at > now()
     returning session.owner_email`,
    [hashMobileToken(state)],
  );
  return result.rows[0]?.owner_email ?? null;
}

export function readBearerToken(authorization: string | null) {
  const [scheme, token, extra] = authorization?.trim().split(/\s+/) ?? [];
  return scheme?.toLowerCase() === "bearer" && token && !extra ? token : null;
}

async function insertSession(client: PoolClient, email: string, deviceName: string | null) {
  const tokens = makeTokenPair();
  const result = await client.query<MobileSessionRow>(
    `insert into mobile_sessions
       (owner_email, device_name, access_token_hash, refresh_token_hash, access_expires_at, refresh_expires_at)
     values ($1, $2, $3, $4, $5, $6)
     returning id, owner_email, device_name, access_expires_at, refresh_expires_at`,
    [email, deviceName, hashMobileToken(tokens.accessToken), hashMobileToken(tokens.refreshToken), tokens.accessExpiresAt, tokens.refreshExpiresAt],
  );
  return { session: toMobileSession(result.rows[0]), tokens: publicTokens(tokens) };
}

function makeTokenPair() {
  return {
    accessToken: generateOpaqueToken("access"),
    refreshToken: generateOpaqueToken("refresh"),
    accessExpiresAt: new Date(Date.now() + ACCESS_TTL_MS),
    refreshExpiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  };
}

function publicTokens(tokens: ReturnType<typeof makeTokenPair>): MobileTokens {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenType: "Bearer",
    expiresIn: Math.floor(ACCESS_TTL_MS / 1000),
    refreshExpiresAt: tokens.refreshExpiresAt.toISOString(),
  };
}

function toMobileSession(row: MobileSessionRow): MobileSession {
  return {
    id: row.id,
    email: row.owner_email,
    deviceName: row.device_name,
    accessExpiresAt: row.access_expires_at.toISOString(),
    refreshExpiresAt: row.refresh_expires_at.toISOString(),
  };
}

function normaliseDeviceName(value?: string | null) {
  const name = value?.trim();
  return name ? name.slice(0, 120) : null;
}
