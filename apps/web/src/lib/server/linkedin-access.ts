import { type PoolClient } from "pg";
import { getDbPool } from "./db";
import { getLinkedInOAuthConfig } from "./linkedin";
import { decryptToken, encryptToken } from "./token-encryption";

const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const REFRESH_EARLY_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15_000;

type ConnectionRow = {
  owner_id: string;
  linkedin_member_urn: string;
  linkedin_attention_required: boolean;
  access_token_ciphertext: string;
  refresh_token_ciphertext: string | null;
  scope: string;
  expires_at: Date | null;
  refresh_expires_at: Date | null;
};

type RefreshPayload = {
  access_token?: unknown;
  expires_in?: unknown;
  refresh_token?: unknown;
  refresh_token_expires_in?: unknown;
  scope?: unknown;
};

export class LinkedInAccessError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly reconnectRequired = false,
    readonly statusCode = 409,
  ) {
    super(message);
  }
}

export async function getLinkedInApiAccess({
  purpose,
  requiredScope,
}: {
  purpose: "publishing" | "analytics";
  requiredScope: string;
}) {
  const client = await getDbPool().connect();

  try {
    await client.query("begin");
    const row = await lockConnection(client);
    if (!row) {
      await client.query("rollback");
      throw new LinkedInAccessError(
        "Connect LinkedIn before using this feature.",
        "linkedin_not_connected",
        true,
      );
    }
    if (row.linkedin_attention_required) {
      await client.query("rollback");
      throw new LinkedInAccessError(
        "Reconnect LinkedIn before using this feature.",
        "linkedin_attention_required",
        true,
      );
    }
    if (!splitScopes(row.scope).includes(requiredScope)) {
      await client.query("rollback");
      throw new LinkedInAccessError(
        `The LinkedIn connection is missing ${requiredScope}.`,
        "linkedin_scope_missing",
      );
    }

    const refreshNeeded =
      row.expires_at !== null && row.expires_at.getTime() <= Date.now() + REFRESH_EARLY_MS;
    if (!refreshNeeded) {
      let accessToken: string;
      try {
        accessToken = openToken(row.access_token_ciphertext);
      } catch (error) {
        await requireReconnect(client, row, purpose, "access_token_unreadable");
        throw error;
      }
      await client.query("commit");
      return connectionResult(row, accessToken, false);
    }

    if (
      !row.refresh_token_ciphertext ||
      (row.refresh_expires_at && row.refresh_expires_at.getTime() <= Date.now())
    ) {
      await requireReconnect(client, row, purpose, "refresh_token_unavailable");
      throw new LinkedInAccessError(
        "The LinkedIn access token expired and no valid programmatic refresh token is available. Reconnect LinkedIn.",
        "linkedin_refresh_unavailable",
        true,
      );
    }

    let refreshToken: string;
    try {
      refreshToken = openToken(row.refresh_token_ciphertext);
    } catch {
      await requireReconnect(client, row, purpose, "refresh_token_unreadable");
      throw new LinkedInAccessError(
        "The stored LinkedIn refresh token could not be opened. Reconnect LinkedIn.",
        "linkedin_token_unreadable",
        true,
        500,
      );
    }

    let refreshed: Awaited<ReturnType<typeof requestRefresh>>;
    try {
      refreshed = await requestRefresh(refreshToken, row.scope);
    } catch (error) {
      if (error instanceof LinkedInAccessError && error.reconnectRequired) {
        await requireReconnect(client, row, purpose, error.code);
      } else {
        await client.query("rollback");
      }
      throw error;
    }

    if (!splitScopes(refreshed.scope).includes(requiredScope)) {
      await requireReconnect(client, row, purpose, "refreshed_scope_missing");
      throw new LinkedInAccessError(
        `LinkedIn refreshed the connection without ${requiredScope}. Reconnect LinkedIn and approve the required permission.`,
        "linkedin_scope_missing",
        true,
      );
    }

    const encryptedAccessToken = encryptToken(refreshed.accessToken);
    const encryptedRefreshToken = refreshed.refreshToken
      ? encryptToken(refreshed.refreshToken)
      : row.refresh_token_ciphertext;
    await client.query(
      `
        update oauth_tokens
        set access_token_ciphertext = $1,
            refresh_token_ciphertext = $2,
            scope = $3,
            expires_at = $4,
            refresh_expires_at = $5
        where provider = 'linkedin'
      `,
      [
        encryptedAccessToken,
        encryptedRefreshToken,
        refreshed.scope,
        refreshed.expiresAt,
        refreshed.refreshExpiresAt ?? row.refresh_expires_at,
      ],
    );
    await client.query(
      "update owner_settings set linkedin_attention_required = false where id = $1",
      [row.owner_id],
    );
    await writeAccessAudit(client, row.owner_id, "linkedin.token_refreshed", {
      purpose,
      access_expires_at: refreshed.expiresAt.toISOString(),
      refresh_expires_at:
        (refreshed.refreshExpiresAt ?? row.refresh_expires_at)?.toISOString() ?? null,
      refresh_rotated: Boolean(refreshed.refreshToken),
      scope_count: splitScopes(refreshed.scope).length,
    });
    await client.query("commit");

    return {
      memberUrn: row.linkedin_member_urn,
      accessToken: refreshed.accessToken,
      scope: refreshed.scope,
      expiresAt: refreshed.expiresAt,
      refreshed: true,
    };
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  } finally {
    client.release();
  }
}

export async function markLinkedInApiAttention({
  purpose,
  reason,
}: {
  purpose: "publishing" | "analytics" | "heartbeat";
  reason: string;
}) {
  const client = await getDbPool().connect();
  try {
    await client.query("begin");
    const result = await client.query<{
      id: string;
      linkedin_attention_required: boolean;
    }>(
      "select id, linkedin_attention_required from owner_settings where singleton_key = true limit 1 for update",
    );
    const owner = result.rows[0];
    if (owner && !owner.linkedin_attention_required) {
      await client.query(
        "update owner_settings set linkedin_attention_required = true where id = $1",
        [owner.id],
      );
      await writeAccessAudit(client, owner.id, "linkedin.attention_required", {
        purpose,
        reason,
      });
    }
    await client.query("commit");
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  } finally {
    client.release();
  }
}

async function lockConnection(client: PoolClient) {
  const result = await client.query<ConnectionRow>(
    `
      select
        owner_settings.id as owner_id,
        owner_settings.linkedin_member_urn,
        owner_settings.linkedin_attention_required,
        oauth_tokens.access_token_ciphertext,
        oauth_tokens.refresh_token_ciphertext,
        oauth_tokens.scope,
        oauth_tokens.expires_at,
        oauth_tokens.refresh_expires_at
      from owner_settings
      join oauth_tokens on oauth_tokens.provider = 'linkedin'
      where owner_settings.singleton_key = true
      limit 1
      for update of owner_settings, oauth_tokens
    `,
  );
  return result.rows[0] ?? null;
}

async function requestRefresh(refreshToken: string, existingScope: string) {
  const config = getLinkedInOAuthConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });
  let response: Response;
  try {
    response = await fetch(LINKEDIN_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new LinkedInAccessError(
      "LinkedIn token refresh could not be reached. No token was changed.",
      "linkedin_refresh_network_error",
      false,
      502,
    );
  }
  if (!response.ok) {
    const reconnect = response.status === 400 || response.status === 401;
    throw new LinkedInAccessError(
      reconnect
        ? "LinkedIn rejected the refresh token. Reconnect LinkedIn."
        : "LinkedIn token refresh is temporarily unavailable. No token was changed.",
      reconnect ? "linkedin_refresh_rejected" : `linkedin_refresh_http_${response.status}`,
      reconnect,
      response.status >= 500 ? 502 : 409,
    );
  }

  let payload: RefreshPayload;
  try {
    payload = (await response.json()) as RefreshPayload;
  } catch {
    throw new LinkedInAccessError(
      "LinkedIn returned an invalid refresh response. No token was changed.",
      "linkedin_refresh_invalid_response",
      false,
      502,
    );
  }
  const accessToken = readToken(payload.access_token);
  const expiresIn = readPositiveInteger(payload.expires_in);
  if (!accessToken || !expiresIn) {
    throw new LinkedInAccessError(
      "LinkedIn returned an invalid refresh response. No token was changed.",
      "linkedin_refresh_invalid_response",
      false,
      502,
    );
  }
  const refreshExpiresIn = readPositiveInteger(payload.refresh_token_expires_in);
  return {
    accessToken,
    refreshToken: readToken(payload.refresh_token),
    scope: readScope(payload.scope) ?? existingScope,
    expiresAt: secondsFromNow(expiresIn),
    refreshExpiresAt: refreshExpiresIn ? secondsFromNow(refreshExpiresIn) : null,
  };
}

async function requireReconnect(
  client: PoolClient,
  row: ConnectionRow,
  purpose: string,
  reason: string,
) {
  await client.query(
    "update owner_settings set linkedin_attention_required = true where id = $1",
    [row.owner_id],
  );
  await writeAccessAudit(client, row.owner_id, "linkedin.attention_required", {
    purpose,
    reason,
  });
  await client.query("commit");
}

function connectionResult(row: ConnectionRow, accessToken: string, refreshed: boolean) {
  return {
    memberUrn: row.linkedin_member_urn,
    accessToken,
    scope: row.scope,
    expiresAt: row.expires_at,
    refreshed,
  };
}

function openToken(ciphertext: string) {
  try {
    return decryptToken(ciphertext);
  } catch {
    throw new LinkedInAccessError(
      "The stored LinkedIn connection could not be opened. Reconnect LinkedIn.",
      "linkedin_token_unreadable",
      true,
      500,
    );
  }
}

function readToken(value: unknown) {
  if (typeof value !== "string") return null;
  const token = value.trim();
  return token.length > 0 && token.length <= 20_000 ? token : null;
}

function readScope(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readPositiveInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 10 * 365 * 24 * 60 * 60
    ? parsed
    : null;
}

function secondsFromNow(seconds: number) {
  return new Date(Date.now() + seconds * 1000);
}

function splitScopes(scope: string) {
  return scope.split(/\s+/).map((item) => item.trim()).filter(Boolean);
}

async function writeAccessAudit(
  client: PoolClient,
  ownerId: string,
  action: string,
  metadata: Record<string, unknown>,
) {
  await client.query(
    `
      insert into audit_log (actor, action, entity_type, entity_id, metadata)
      values ('system', $1, 'owner_settings', $2, $3)
    `,
    [action, ownerId, metadata],
  );
}

async function rollbackQuietly(client: PoolClient) {
  try {
    await client.query("rollback");
  } catch {
    // Preserve the original provider or database failure.
  }
}
