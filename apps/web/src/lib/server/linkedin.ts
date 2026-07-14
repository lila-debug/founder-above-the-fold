import { type PoolClient } from "pg";
import { dbQuery, getDbPool, hasDatabaseUrl } from "./db";
import { encryptToken } from "./token-encryption";

const LINKEDIN_AUTHORIZATION_URL =
  "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const DEFAULT_LINKEDIN_SCOPES = "openid profile email w_member_social";

type LinkedInOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
};

type LinkedInTokenResponse = {
  access_token?: unknown;
  expires_in?: unknown;
  refresh_token?: unknown;
  refresh_token_expires_in?: unknown;
  scope?: unknown;
};

type LinkedInUserInfoResponse = {
  sub?: unknown;
  name?: unknown;
  given_name?: unknown;
  family_name?: unknown;
  email?: unknown;
  email_verified?: unknown;
};

type LinkedInTokenSet = {
  accessToken: string;
  refreshToken: string | null;
  scope: string;
  expiresAt: Date | null;
  refreshExpiresAt: Date | null;
};

type LinkedInProfile = {
  memberUrn: string;
  name: string | null;
  email: string;
};

type StoredConnection = {
  connectedAt: string;
  expiresAt: string | null;
  attentionRequired: boolean;
  missingScopes: string[];
};

type LinkedInStatusRow = {
  linkedin_connected_at: Date | null;
  linkedin_attention_required: boolean | null;
  scope: string | null;
  expires_at: Date | null;
};

export type LinkedInConnectionState =
  | "setup_required"
  | "not_connected"
  | "connected"
  | "attention_required";

export class LinkedInOAuthError extends Error {
  constructor(
    message: string,
    readonly reason: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

export function getLinkedInOAuthConfig(): LinkedInOAuthConfig {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim();
  const redirectUri =
    process.env.LINKEDIN_REDIRECT_URI?.trim() ??
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`
      : "");
  const scopes = process.env.LINKEDIN_SCOPES?.trim() || DEFAULT_LINKEDIN_SCOPES;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("LinkedIn OAuth environment variables are not configured.");
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes,
  };
}

export function getLinkedInAuthorizationUrl(state: string) {
  const config = getLinkedInOAuthConfig();
  const authorizationUrl = new URL(LINKEDIN_AUTHORIZATION_URL);

  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", config.clientId);
  authorizationUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("scope", config.scopes);

  return authorizationUrl;
}

export function getLinkedInSetupMissingEnv() {
  const missing: string[] = [];

  for (const key of [
    "LINKEDIN_CLIENT_ID",
    "LINKEDIN_CLIENT_SECRET",
    "LINKEDIN_REDIRECT_URI",
    "DATABASE_URL",
    "TOKEN_ENCRYPTION_KEY",
  ]) {
    const value = process.env[key]?.trim();

    if (!value || (key === "TOKEN_ENCRYPTION_KEY" && value.length < 32)) {
      missing.push(key);
    }
  }

  return missing;
}

export async function exchangeLinkedInCodeForToken(code: string) {
  const config = getLinkedInOAuthConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new LinkedInOAuthError(
      "LinkedIn token exchange failed.",
      "token_exchange_failed",
      response.status,
    );
  }

  const result = (await response.json()) as LinkedInTokenResponse;
  const accessToken = readString(result.access_token);

  if (!accessToken) {
    throw new LinkedInOAuthError(
      "LinkedIn did not return an access token.",
      "token_exchange_failed",
    );
  }

  const expiresIn = readNumber(result.expires_in);
  const refreshExpiresIn = readNumber(result.refresh_token_expires_in);

  return {
    accessToken,
    refreshToken: readString(result.refresh_token),
    scope: readString(result.scope) ?? config.scopes,
    expiresAt: expiresIn ? secondsFromNow(expiresIn) : null,
    refreshExpiresAt: refreshExpiresIn ? secondsFromNow(refreshExpiresIn) : null,
  } satisfies LinkedInTokenSet;
}

export async function fetchLinkedInOwnerProfile(accessToken: string) {
  const response = await fetch(LINKEDIN_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new LinkedInOAuthError(
      "LinkedIn member identity request failed.",
      "identity_fetch_failed",
      response.status,
    );
  }

  const result = (await response.json()) as LinkedInUserInfoResponse;
  const subject = readString(result.sub);
  const email = readString(result.email)?.toLowerCase();

  if (!subject) {
    throw new LinkedInOAuthError(
      "LinkedIn did not return a member identifier.",
      "missing_member_identity",
    );
  }

  if (!email || result.email_verified !== true) {
    throw new LinkedInOAuthError(
      "LinkedIn did not return a verified owner email.",
      "missing_verified_email",
    );
  }

  return {
    memberUrn: `urn:li:person:${subject}`,
    name: getProfileName(result),
    email,
  } satisfies LinkedInProfile;
}

export async function storeLinkedInConnection({
  ownerEmail,
  profile,
  tokenSet,
}: {
  ownerEmail: string;
  profile: LinkedInProfile;
  tokenSet: LinkedInTokenSet;
}): Promise<StoredConnection> {
  const grantedScopes = splitScopes(tokenSet.scope);
  const missingScopes = getRequiredLinkedInScopes().filter(
    (scope) => !grantedScopes.includes(scope),
  );
  const attentionRequired = missingScopes.length > 0;
  const encryptedAccessToken = encryptToken(tokenSet.accessToken);
  const encryptedRefreshToken = tokenSet.refreshToken
    ? encryptToken(tokenSet.refreshToken)
    : null;
  const client = await getDbPool().connect();

  try {
    await client.query("begin");

    const owner = await upsertOwnerConnection(client, {
      ownerEmail,
      profile,
      attentionRequired,
    });

    await client.query(
      `
        insert into oauth_tokens (
          provider,
          access_token_ciphertext,
          refresh_token_ciphertext,
          scope,
          expires_at,
          refresh_expires_at
        )
        values ('linkedin', $1, $2, $3, $4, $5)
        on conflict (provider) do update set
          access_token_ciphertext = excluded.access_token_ciphertext,
          refresh_token_ciphertext = excluded.refresh_token_ciphertext,
          scope = excluded.scope,
          expires_at = excluded.expires_at,
          refresh_expires_at = excluded.refresh_expires_at
      `,
      [
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenSet.scope,
        tokenSet.expiresAt,
        tokenSet.refreshExpiresAt,
      ],
    );

    await writeLinkedInAuditEvent(client, {
      action: "linkedin.connected",
      entityId: owner.id,
      metadata: {
        attention_required: attentionRequired,
        missing_scopes: missingScopes,
        scope_count: grantedScopes.length,
        token_expires_at: tokenSet.expiresAt?.toISOString() ?? null,
      },
    });

    await client.query("commit");

    return {
      connectedAt: owner.linkedin_connected_at.toISOString(),
      expiresAt: tokenSet.expiresAt?.toISOString() ?? null,
      attentionRequired,
      missingScopes,
    };
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  } finally {
    client.release();
  }
}

export async function markLinkedInAttentionRequired({
  ownerEmail,
  reason,
}: {
  ownerEmail: string;
  reason: string;
}) {
  if (!hasDatabaseUrl()) {
    return;
  }

  const client = await getDbPool().connect();

  try {
    await client.query("begin");

    const owner = await upsertOwnerAttention(client, ownerEmail);

    await writeLinkedInAuditEvent(client, {
      action: "linkedin.attention_required",
      entityId: owner.id,
      metadata: { reason },
    });

    await client.query("commit");
  } catch {
    await rollbackQuietly(client);
  } finally {
    client.release();
  }
}

export async function getLinkedInConnectionStatus({
  ownerAuthenticated,
}: {
  ownerAuthenticated: boolean;
}) {
  const missingEnv = getLinkedInSetupMissingEnv();
  const baseStatus = {
    configured: missingEnv.length === 0,
    ownerAuthenticated,
    canConnect: missingEnv.length === 0 && ownerAuthenticated,
    missingEnv,
    connectedAt: null as string | null,
    expiresAt: null as string | null,
    scope: {
      required: getRequiredLinkedInScopes(),
      granted: [] as string[],
      missing: [] as string[],
    },
    attentionReasons: [] as string[],
  };

  if (missingEnv.length > 0) {
    return {
      ...baseStatus,
      state: "setup_required" satisfies LinkedInConnectionState,
      message: "LinkedIn connection setup needs labelled slots before OAuth can run.",
    };
  }

  const result = await dbQuery<LinkedInStatusRow>(
    `
      select
        owner_settings.linkedin_connected_at,
        owner_settings.linkedin_attention_required,
        oauth_tokens.scope,
        oauth_tokens.expires_at
      from (select true as singleton_key) as owner_slot
      left join owner_settings
        on owner_settings.singleton_key = owner_slot.singleton_key
      left join oauth_tokens
        on oauth_tokens.provider = 'linkedin'
      limit 1
    `,
  );
  const row = result.rows[0];

  if (!row?.scope || !row.linkedin_connected_at) {
    return {
      ...baseStatus,
      state: "not_connected" satisfies LinkedInConnectionState,
      message: ownerAuthenticated
        ? "LinkedIn is ready to connect."
        : "Sign in as the owner before connecting LinkedIn.",
    };
  }

  const grantedScopes = splitScopes(row.scope);
  const missingScopes = getRequiredLinkedInScopes().filter(
    (scope) => !grantedScopes.includes(scope),
  );
  const attentionReasons: string[] = [];

  if (row.linkedin_attention_required) {
    attentionReasons.push("linkedin_reconnect_required");
  }

  if (row.expires_at && row.expires_at.getTime() <= Date.now()) {
    attentionReasons.push("token_expired");
  }

  if (missingScopes.length > 0) {
    attentionReasons.push("missing_scope");
  }

  return {
    ...baseStatus,
    state:
      attentionReasons.length > 0
        ? ("attention_required" satisfies LinkedInConnectionState)
        : ("connected" satisfies LinkedInConnectionState),
    message:
      attentionReasons.length > 0
        ? "LinkedIn needs inspection before any future publishing rail can use the stored connection."
        : "LinkedIn connection is stored. The publishing motor is not implemented in this build.",
    connectedAt: row.linkedin_connected_at.toISOString(),
    expiresAt: row.expires_at?.toISOString() ?? null,
    scope: {
      required: getRequiredLinkedInScopes(),
      granted: grantedScopes,
      missing: missingScopes,
    },
    attentionReasons,
  };
}

async function upsertOwnerConnection(
  client: PoolClient,
  {
    ownerEmail,
    profile,
    attentionRequired,
  }: {
    ownerEmail: string;
    profile: LinkedInProfile;
    attentionRequired: boolean;
  },
) {
  const result = await client.query<{
    id: string;
    linkedin_connected_at: Date;
  }>(
    `
      insert into owner_settings (
        singleton_key,
        owner_email,
        owner_name,
        linkedin_member_urn,
        linkedin_connected_at,
        linkedin_attention_required
      )
      values (true, $1, $2, $3, now(), $4)
      on conflict (singleton_key) do update set
        owner_email = excluded.owner_email,
        owner_name = excluded.owner_name,
        linkedin_member_urn = excluded.linkedin_member_urn,
        linkedin_connected_at = excluded.linkedin_connected_at,
        linkedin_attention_required = excluded.linkedin_attention_required
      returning id, linkedin_connected_at
    `,
    [ownerEmail, profile.name, profile.memberUrn, attentionRequired],
  );

  return result.rows[0];
}

async function upsertOwnerAttention(client: PoolClient, ownerEmail: string) {
  const result = await client.query<{ id: string }>(
    `
      insert into owner_settings (
        singleton_key,
        owner_email,
        linkedin_attention_required
      )
      values (true, $1, true)
      on conflict (singleton_key) do update set
        owner_email = excluded.owner_email,
        linkedin_attention_required = true
      returning id
    `,
    [ownerEmail],
  );

  return result.rows[0];
}

async function writeLinkedInAuditEvent(
  client: PoolClient,
  {
    action,
    entityId,
    metadata,
  }: {
    action: string;
    entityId: string;
    metadata: Record<string, unknown>;
  },
) {
  await client.query(
    `
      insert into audit_log (actor, action, entity_type, entity_id, metadata)
      values ('owner', $1, 'owner_settings', $2, $3)
    `,
    [action, entityId, metadata],
  );
}

async function rollbackQuietly(client: PoolClient) {
  try {
    await client.query("rollback");
  } catch {
    // The original error is more useful to the caller than rollback noise.
  }
}

function getRequiredLinkedInScopes() {
  return splitScopes(process.env.LINKEDIN_SCOPES || DEFAULT_LINKEDIN_SCOPES);
}

function splitScopes(scopeString: string) {
  return scopeString
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function secondsFromNow(seconds: number) {
  return new Date(Date.now() + seconds * 1000);
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getProfileName(profile: LinkedInUserInfoResponse) {
  const name = readString(profile.name);

  if (name) {
    return name;
  }

  return [readString(profile.given_name), readString(profile.family_name)]
    .filter(Boolean)
    .join(" ") || null;
}
