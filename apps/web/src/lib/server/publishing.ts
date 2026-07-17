import {
  getLinkedInApiAccess,
  LinkedInAccessError,
  markLinkedInApiAttention,
} from "./linkedin-access";

const LINKEDIN_POSTS_URL = "https://api.linkedin.com/rest/posts";
const DEFAULT_LINKEDIN_API_VERSION = "202606";
const LINKEDIN_REQUEST_TIMEOUT_MS = 15_000;

export class LinkedInPublishingError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly statusCode = 409,
  ) {
    super(message);
  }
}

export async function publishLinkedInText(body: string) {
  let connection: Awaited<ReturnType<typeof getLinkedInApiAccess>>;
  try {
    connection = await getLinkedInApiAccess({
      purpose: "publishing",
      requiredScope: "w_member_social",
    });
  } catch (error) {
    if (error instanceof LinkedInAccessError) {
      throw new LinkedInPublishingError(error.message, error.code, error.statusCode);
    }
    throw new LinkedInPublishingError(
      "The LinkedIn connection could not be prepared for publishing.",
      "linkedin_connection_error",
      500,
    );
  }

  let response: Response;

  try {
    response = await fetch(LINKEDIN_POSTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        "Content-Type": "application/json",
        "Linkedin-Version": getLinkedInApiVersion(),
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: connection.memberUrn,
        commentary: body,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(LINKEDIN_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new LinkedInPublishingError(
      "LinkedIn could not be reached. The post was not confirmed as published.",
      "linkedin_network_error",
      502,
    );
  }

  if (response.status !== 201) {
    if (response.status === 401) {
      await markLinkedInApiAttention({
        purpose: "publishing",
        reason: "access_token_rejected",
      });
    }
    throw new LinkedInPublishingError(
      safeLinkedInFailure(response.status),
      `linkedin_http_${response.status}`,
      response.status >= 500 ? 502 : 409,
    );
  }

  const postId = response.headers.get("x-restli-id")?.trim();

  if (!postId) {
    throw new LinkedInPublishingError(
      "LinkedIn accepted the request but did not return a post identifier. Inspect LinkedIn before retrying.",
      "linkedin_missing_post_id",
      502,
    );
  }

  return { postId };
}

function getLinkedInApiVersion() {
  const configured = process.env.LINKEDIN_API_VERSION?.trim();

  return configured && /^\d{6}$/.test(configured)
    ? configured
    : DEFAULT_LINKEDIN_API_VERSION;
}

function safeLinkedInFailure(status: number) {
  if (status === 401) {
    return "LinkedIn rejected the stored connection. Reconnect before publishing.";
  }

  if (status === 403) {
    return "LinkedIn refused publishing permission for this connection.";
  }

  if (status === 429) {
    return "LinkedIn rate-limited the publishing request. It will be retried once.";
  }

  return status >= 500
    ? "LinkedIn returned a temporary publishing error. It will be retried once."
    : "LinkedIn rejected the publishing request. Inspect the connection before retrying.";
}
