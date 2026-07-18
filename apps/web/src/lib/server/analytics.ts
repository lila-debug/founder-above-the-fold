import { writeAuditEvent, type AuditActor } from "./audit";
import { dbQuery, hasDatabaseUrl } from "./db";
import {
  getLinkedInApiAccess,
  LinkedInAccessError,
  markLinkedInApiAttention,
} from "./linkedin-access";

const LINKEDIN_ANALYTICS_URL =
  "https://api.linkedin.com/rest/memberCreatorPostAnalytics";
const ANALYTICS_SCOPE = "r_member_postAnalytics";
const DEFAULT_LINKEDIN_API_VERSION = "202607";
const LINKEDIN_REQUEST_TIMEOUT_MS = 15_000;
const METRICS = ["IMPRESSION", "REACTION", "COMMENT", "RESHARE"] as const;

type Metric = (typeof METRICS)[number];

type AnalyticsConnectionRow = {
  linkedin_attention_required: boolean | null;
  access_token_ciphertext: string | null;
  refresh_token_ciphertext: string | null;
  scope: string | null;
  expires_at: Date | null;
  refresh_expires_at: Date | null;
};

type PublishedPostRow = {
  id: string;
  body: string;
  linkedin_post_id: string;
  published_at: Date;
};

type AnalyticsListRow = PublishedPostRow & {
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  pulled_at: Date | null;
};

export type AnalyticsReadiness = {
  state: "setup_required" | "connection_required" | "permission_required" | "available";
  message: string;
};

export type AnalyticsTracker = {
  readiness: AnalyticsReadiness;
  items: Array<{
    postId: string;
    linkedinPostId: string;
    body: string;
    publishedAt: string;
    metrics: {
      impressions: number | null;
      reactions: number | null;
      comments: number | null;
      reshares: number | null;
    };
    pulledAt: string | null;
  }>;
};

export class LinkedInAnalyticsError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly statusCode = 409,
  ) {
    super(message);
  }
}

export async function getAnalyticsReadiness(): Promise<AnalyticsReadiness> {
  if (!hasDatabaseUrl()) {
    return {
      state: "setup_required",
      message: "Fit the database parts bin before storing analytics.",
    };
  }

  const connection = await getAnalyticsConnection();

  if (!connection?.access_token_ciphertext || !connection.scope) {
    return {
      state: "connection_required",
      message: "Connect LinkedIn before pulling owner-post analytics.",
    };
  }

  if (!splitScopes(connection.scope).includes(ANALYTICS_SCOPE)) {
    return {
      state: "permission_required",
      message: `LinkedIn must grant ${ANALYTICS_SCOPE} before live metrics can be read.`,
    };
  }

  const refreshAvailable =
    Boolean(connection.refresh_token_ciphertext) &&
    (!connection.refresh_expires_at || connection.refresh_expires_at.getTime() > Date.now());
  if (
    connection.linkedin_attention_required ||
    (connection.expires_at &&
      connection.expires_at.getTime() <= Date.now() &&
      !refreshAvailable)
  ) {
    return {
      state: "connection_required",
      message: "Reconnect LinkedIn before refreshing analytics.",
    };
  }

  return {
    state: "available",
    message: "Official owner-post analytics permission is fitted.",
  };
}

export async function listPostAnalytics(): Promise<AnalyticsTracker> {
  const readiness = await getAnalyticsReadiness();

  if (!hasDatabaseUrl()) return { readiness, items: [] };

  const result = await dbQuery<AnalyticsListRow>(
    `
      select
        posts.id,
        posts.body,
        posts.linkedin_post_id,
        posts.published_at,
        latest.impressions,
        latest.likes,
        latest.comments,
        latest.shares,
        latest.pulled_at
      from posts
      left join lateral (
        select impressions, likes, comments, shares, pulled_at
        from post_stats
        where post_stats.post_id = posts.id
        order by pulled_at desc, id desc
        limit 1
      ) latest on true
      where posts.status = 'published'
        and posts.linkedin_post_id is not null
        and posts.published_at is not null
      order by posts.published_at desc
      limit 100
    `,
  );

  return {
    readiness,
    items: result.rows.map((row) => ({
      postId: row.id,
      linkedinPostId: row.linkedin_post_id,
      body: row.body,
      publishedAt: row.published_at.toISOString(),
      metrics: {
        impressions: row.impressions,
        reactions: row.likes,
        comments: row.comments,
        reshares: row.shares,
      },
      pulledAt: row.pulled_at?.toISOString() ?? null,
    })),
  };
}

export async function refreshPostAnalytics({
  actor,
  postId,
}: {
  actor: AuditActor;
  postId?: string | null;
}) {
  const readiness = await getAnalyticsReadiness();

  if (readiness.state !== "available") {
    throw new LinkedInAnalyticsError(readiness.message, readiness.state);
  }

  let connection: Awaited<ReturnType<typeof getLinkedInApiAccess>>;
  try {
    connection = await getLinkedInApiAccess({
      purpose: "analytics",
      requiredScope: ANALYTICS_SCOPE,
    });
  } catch (error) {
    if (error instanceof LinkedInAccessError) {
      throw new LinkedInAnalyticsError(error.message, error.code, error.statusCode);
    }
    throw new LinkedInAnalyticsError(
      "The LinkedIn connection could not be prepared for analytics.",
      "linkedin_connection_error",
      500,
    );
  }

  const posts = await getPublishedPosts(postId);
  let refreshed = 0;

  for (const post of posts) {
    const raw = await fetchMetrics(post.linkedin_post_id, connection.accessToken);
    const values = Object.fromEntries(
      METRICS.map((metric) => [metric, readMetricCount(raw[metric])]),
    ) as Record<Metric, number | null>;

    await dbQuery(
      `
        insert into post_stats (
          post_id,
          impressions,
          likes,
          comments,
          shares,
          raw
        ) values ($1, $2, $3, $4, $5, $6)
      `,
      [
        post.id,
        values.IMPRESSION,
        values.REACTION,
        values.COMMENT,
        values.RESHARE,
        raw,
      ],
    );
    await writeAuditEvent({
      actor,
      action: "analytics.refreshed",
      entityType: "post",
      entityId: post.id,
      metadata: {
        linkedinPostId: post.linkedin_post_id,
        knownMetrics: METRICS.filter((metric) => values[metric] !== null),
      },
    });
    refreshed += 1;
  }

  return { refreshed, requestedPostId: postId ?? null };
}

async function fetchMetrics(linkedinPostId: string, accessToken: string) {
  const entity = serializeEntity(linkedinPostId);
  const entries = await Promise.all(
    METRICS.map(async (metric) => {
      const url = `${LINKEDIN_ANALYTICS_URL}?q=entity&entity=${entity}&queryType=${metric}&aggregation=TOTAL`;
      let response: Response;

      try {
        response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Linkedin-Version": getLinkedInApiVersion(),
            "X-Restli-Protocol-Version": "2.0.0",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(LINKEDIN_REQUEST_TIMEOUT_MS),
        });
      } catch {
        throw new LinkedInAnalyticsError(
          "LinkedIn analytics could not be reached. No snapshot was stored.",
          "linkedin_analytics_network_error",
          502,
        );
      }

      if (!response.ok) {
        if (response.status === 401) {
          await markLinkedInApiAttention({
            purpose: "analytics",
            reason: "access_token_rejected",
          });
        }
        throw new LinkedInAnalyticsError(
          safeAnalyticsFailure(response.status),
          `linkedin_analytics_http_${response.status}`,
          response.status >= 500 ? 502 : 409,
        );
      }

      return [metric, (await response.json()) as unknown] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<Metric, unknown>;
}

async function getAnalyticsConnection() {
  const result = await dbQuery<AnalyticsConnectionRow>(
    `
      select
        owner_settings.linkedin_attention_required,
        oauth_tokens.access_token_ciphertext,
        oauth_tokens.refresh_token_ciphertext,
        oauth_tokens.scope,
        oauth_tokens.expires_at,
        oauth_tokens.refresh_expires_at
      from (select true as singleton_key) as owner_slot
      left join owner_settings
        on owner_settings.singleton_key = owner_slot.singleton_key
      left join oauth_tokens
        on oauth_tokens.provider = 'linkedin'
      limit 1
    `,
  );
  return result.rows[0] ?? null;
}

async function getPublishedPosts(postId?: string | null) {
  const result = await dbQuery<PublishedPostRow>(
    `
      select id, body, linkedin_post_id, published_at
      from posts
      where status = 'published'
        and linkedin_post_id is not null
        and published_at is not null
        and ($1::uuid is null or id = $1)
      order by published_at desc
      limit 50
    `,
    [postId ?? null],
  );

  if (postId && result.rows.length === 0) {
    throw new LinkedInAnalyticsError("Published post not found.", "post_not_found", 404);
  }

  return result.rows;
}

function serializeEntity(postId: string) {
  const kind = postId.startsWith("urn:li:share:")
    ? "share"
    : postId.startsWith("urn:li:ugcPost:")
      ? "ugc"
      : null;
  if (!kind) {
    throw new LinkedInAnalyticsError(
      "The stored LinkedIn post identifier is not a supported share or UGC post URN.",
      "linkedin_post_id_invalid",
      500,
    );
  }
  return `(${kind}:${encodeURIComponent(postId)})`;
}

function readMetricCount(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("elements" in payload)) return null;
  const elements = (payload as { elements?: unknown }).elements;
  if (!Array.isArray(elements) || elements.length === 0) return null;
  const count = (elements[0] as { count?: unknown } | null)?.count;
  const parsed = typeof count === "number" ? count : typeof count === "string" ? Number(count) : NaN;
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function splitScopes(scope: string) {
  return scope.split(/\s+/).map((item) => item.trim()).filter(Boolean);
}

function getLinkedInApiVersion() {
  const configured = process.env.LINKEDIN_API_VERSION?.trim();
  return configured && /^\d{6}$/.test(configured)
    ? configured
    : DEFAULT_LINKEDIN_API_VERSION;
}

function safeAnalyticsFailure(status: number) {
  if (status === 401) return "LinkedIn rejected the stored connection. Reconnect before refreshing analytics.";
  if (status === 403) return `LinkedIn has not granted ${ANALYTICS_SCOPE} for this connection.`;
  if (status === 429) return "LinkedIn rate-limited the analytics request. Try again later.";
  return status >= 500
    ? "LinkedIn returned a temporary analytics error. No snapshot was stored."
    : "LinkedIn rejected the analytics request. Inspect the post and connection.";
}
