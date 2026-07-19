import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { GET as completeLinkedInCallback } from "../../app/api/auth/linkedin/callback/route";
import { GET as startLinkedInOAuth } from "../../app/api/auth/linkedin/start/route";
import { createSessionToken } from "../auth/magic-link";
import { listPostAnalytics, refreshPostAnalytics } from "./analytics";
import { dbQuery, getDbPool } from "./db";
import { disconnectLinkedIn, getLinkedInConnectionStatus } from "./linkedin";
import { getLinkedInApiAccess, LinkedInAccessError } from "./linkedin-access";
import { deleteOwnerWorkspace, exportOwnerWorkspace } from "./owner-data";
import {
  cancelQueuedPost,
  createDraftPost,
  getPostById,
  isSafeToRetry,
  publishDuePosts,
  publishPostNow,
  queuePost,
  runVoiceCheckForPost,
  updateDraftPost,
} from "./posts";
import { decryptToken, encryptToken } from "./token-encryption";
import {
  createTemplate,
  listTemplates,
  renderTemplate,
  updateTemplate,
} from "./templates";

const databaseUrl = process.env.DATABASE_URL;
const parsedDatabaseUrl = databaseUrl ? new URL(databaseUrl) : null;

if (
  !parsedDatabaseUrl ||
  !["127.0.0.1", "localhost"].includes(parsedDatabaseUrl.hostname)
) {
  throw new Error(
    "Core integration tests refuse to run unless DATABASE_URL points to local Postgres.",
  );
}

process.env.TOKEN_ENCRYPTION_KEY ??=
  "test-only-token-encryption-key-with-at-least-32-characters";
process.env.LINKEDIN_CLIENT_ID = "integration-client-id";
process.env.LINKEDIN_CLIENT_SECRET = "integration-client-secret";
process.env.LINKEDIN_REDIRECT_URI =
  "http://localhost:3000/api/auth/linkedin/callback";
process.env.DISPATCH_OWNER_EMAIL = "owner@example.test";
process.env.MAGIC_LINK_SECRET =
  "integration-magic-link-secret-with-at-least-32-characters";
delete process.env.VOICE_CHECK_COMMAND;

type CapturedRequest = {
  url: string;
  init?: RequestInit;
};

const originalFetch = globalThis.fetch;
const requests: CapturedRequest[] = [];
let linkedInResponder: () => Promise<Response> = async () =>
  new Response(null, {
    status: 201,
    headers: { "x-restli-id": "urn:li:share:test-default" },
  });

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  requests.push({ url: String(input), init });
  return linkedInResponder();
}) as typeof fetch;

test("core post conveyor uses real database state and safe LinkedIn rules", async (t) => {
  await resetEntireCabinet();

  await t.test("OAuth callback validates state and stores encrypted owner tokens", async () => {
    requests.length = 0;
    const disconnectedStatus = await getLinkedInConnectionStatus({ ownerAuthenticated: true });
    assert.equal(disconnectedStatus.state, "not_connected");
    assert.doesNotMatch(JSON.stringify(disconnectedStatus), /token_ciphertext|owner@example/i);

    const invalidStateResponse = await completeLinkedInCallback(
      new NextRequest(
        "http://localhost:3000/api/auth/linkedin/callback?code=owner-code&state=wrong-state",
        { headers: { cookie: "linkedin_oauth_state=expected-state" } },
      ),
    );
    assert.equal(
      invalidStateResponse.headers.get("location"),
      "http://localhost:3000/dashboard?linkedin=invalid-state",
    );
    assert.equal(requests.length, 0);

    const startResponse = await startLinkedInOAuth(
      new NextRequest("http://localhost:3000/api/auth/linkedin/start", {
        headers: {
          cookie: `dispatch_session=${createSessionToken("owner@example.test")}`,
        },
      }),
    );
    assert.equal(startResponse.status, 307);
    const authorizationURL = new URL(startResponse.headers.get("location")!);
    assert.equal(authorizationURL.origin, "https://www.linkedin.com");
    assert.equal(authorizationURL.pathname, "/oauth/v2/authorization");
    assert.equal(authorizationURL.searchParams.get("client_id"), "integration-client-id");
    assert.equal(authorizationURL.searchParams.get("response_type"), "code");
    assert.match(startResponse.headers.get("set-cookie") ?? "", /linkedin_oauth_state=/);

    linkedInResponder = async () => {
      const url = requests.at(-1)?.url;
      if (url === "https://www.linkedin.com/oauth/v2/accessToken") {
        return Response.json({
          access_token: "oauth-access-token",
          expires_in: 3600,
          refresh_token: "oauth-refresh-token",
          refresh_token_expires_in: 7200,
          scope: "openid profile email w_member_social",
        });
      }
      if (url === "https://api.linkedin.com/v2/userinfo") {
        return Response.json({
          sub: "oauth-owner",
          name: "Test Owner",
          email: "owner@example.test",
          email_verified: true,
        });
      }
      return new Response(null, { status: 500 });
    };

    const response = await completeLinkedInCallback(
      new NextRequest(
        "http://localhost:3000/api/auth/linkedin/callback?code=owner-code&state=matching-state",
        { headers: { cookie: "linkedin_oauth_state=matching-state" } },
      ),
    );
    assert.equal(response.status, 307);
    assert.equal(
      response.headers.get("location"),
      "http://localhost:3000/dashboard?linkedin=connected",
    );
    assert.match(response.headers.get("set-cookie") ?? "", /dispatch_session=/);
    assert.doesNotMatch(response.headers.get("set-cookie") ?? "", /oauth-access-token/);
    assert.deepEqual(
      requests.map((request) => request.url),
      [
        "https://www.linkedin.com/oauth/v2/accessToken",
        "https://api.linkedin.com/v2/userinfo",
      ],
    );

    const stored = await dbQuery<{
      owner_email: string;
      linkedin_member_urn: string;
      access_token_ciphertext: string;
      refresh_token_ciphertext: string;
    }>(
      `
        select
          owner_settings.owner_email,
          owner_settings.linkedin_member_urn,
          oauth_tokens.access_token_ciphertext,
          oauth_tokens.refresh_token_ciphertext
        from owner_settings
        join oauth_tokens on oauth_tokens.provider = 'linkedin'
        where owner_settings.singleton_key = true
      `,
    );
    assert.equal(stored.rows[0]?.owner_email, "owner@example.test");
    assert.equal(stored.rows[0]?.linkedin_member_urn, "urn:li:person:oauth-owner");
    assert.equal(
      decryptToken(stored.rows[0]!.access_token_ciphertext),
      "oauth-access-token",
    );
    assert.equal(
      decryptToken(stored.rows[0]!.refresh_token_ciphertext),
      "oauth-refresh-token",
    );
    assert.doesNotMatch(stored.rows[0]!.access_token_ciphertext, /oauth-access-token/);

    const status = await getLinkedInConnectionStatus({ ownerAuthenticated: true });
    assert.equal(status.state, "connected");
    assert.equal(status.refresh.available, true);
    assert.deepEqual(status.scope.missing, []);
    const connectionAudit = await dbQuery<{ metadata: unknown }>(
      "select metadata from audit_log where action = 'linkedin.connected' order by created_at desc limit 1",
    );
    assert.doesNotMatch(JSON.stringify(connectionAudit.rows[0]?.metadata), /oauth-.*-token/);
  });

  await resetEntireCabinet();
  await fitLinkedInTestConnection();

  await t.test("voice failure and stale hashes block queueing", async () => {
    await resetWorkflow();
    const failedDraft = await createDraftPost({
      actor: "owner",
      input: { body: "This game changer will analyze color!!!" },
    });
    const failedCheck = await runVoiceCheckForPost({
      actor: "owner",
      id: failedDraft.id,
    });

    assert.equal(failedCheck?.item.voiceStatus, "failed");
    await assert.rejects(
      queuePost({
        actor: "owner",
        id: failedDraft.id,
        scheduledAt: futureSlot(),
      }),
      /passing voice check/i,
    );

    const passedDraft = await createVoicePassedDraft();
    await updateDraftPost({
      actor: "owner",
      id: passedDraft.id,
      input: { body: `${passedDraft.body} The owner added one sentence.` },
    });
    await assert.rejects(
      queuePost({
        actor: "owner",
        id: passedDraft.id,
        scheduledAt: futureSlot(),
      }),
      /passing voice check/i,
    );
  });

  await t.test("queue and cancellation preserve audited workflow state", async () => {
    await resetWorkflow();
    const draft = await createVoicePassedDraft();
    const queued = await queuePost({
      actor: "owner",
      id: draft.id,
      scheduledAt: futureSlot(),
    });

    assert.equal(queued?.status, "queued");
    const cancelled = await cancelQueuedPost({
      actor: "owner",
      id: draft.id,
      reason: "Owner changed the weekly plan.",
    });
    assert.equal(cancelled?.status, "cancelled");

    const actions = await auditActions(draft.id);
    assert.deepEqual(actions, [
      "post.draft_created",
      "post.voice_checked",
      "post.queued",
      "post.cancelled",
    ]);
  });

  await t.test("official API success records the LinkedIn post and request contract", async () => {
    await resetWorkflow();
    requests.length = 0;
    linkedInResponder = async () =>
      new Response(null, {
        status: 201,
        headers: { "x-restli-id": "urn:li:share:published-test" },
      });

    const draft = await createVoicePassedDraft();
    await queuePost({
      actor: "owner",
      id: draft.id,
      scheduledAt: futureSlot(),
    });
    await makeDue(draft.id);

    const result = await publishDuePosts();
    assert.equal(result.published, 1);
    assert.equal(result.retryScheduled, 0);

    const stored = await getPostById(draft.id);
    assert.equal(stored?.status, "published");
    assert.equal(stored?.linkedinPostId, "urn:li:share:published-test");

    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "https://api.linkedin.com/rest/posts");
    const headers = new Headers(requests[0].init?.headers);
    assert.equal(headers.get("Linkedin-Version"), "202607");
    assert.equal(headers.get("X-Restli-Protocol-Version"), "2.0.0");
    const payload = JSON.parse(String(requests[0].init?.body)) as {
      author: string;
      commentary: string;
      lifecycleState: string;
      visibility: string;
    };
    assert.equal(payload.author, "urn:li:person:test-owner");
    assert.equal(payload.commentary, draft.body);
    assert.equal(payload.lifecycleState, "PUBLISHED");
    assert.equal(payload.visibility, "PUBLIC");

    const actions = await auditActions(draft.id);
    assert.ok(actions.includes("post.publish_started"));
    assert.ok(actions.includes("post.published"));
  });

  await t.test("429 and 5xx receive one retry, then stop visibly", async () => {
    await resetWorkflow();
    linkedInResponder = async () => new Response(null, { status: 429 });
    const draft = await createDueDraft();

    const first = await publishDuePosts();
    assert.equal(first.retryScheduled, 1);
    let stored = await getPostById(draft.id);
    assert.equal(stored?.status, "queued");
    assert.equal(stored?.retryCount, 1);

    await makeDue(draft.id);
    linkedInResponder = async () => new Response(null, { status: 503 });
    const second = await publishDuePosts();
    assert.equal(second.failed, 1);
    stored = await getPostById(draft.id);
    assert.equal(stored?.status, "failed");
    assert.equal(stored?.retryCount, 1);
    assert.equal(stored?.lastErrorCode, "linkedin_http_503");
  });

  await t.test("ambiguous network failures never risk a duplicate retry", async () => {
    await resetWorkflow();
    linkedInResponder = async () => {
      throw new Error("simulated connection break after request dispatch");
    };
    const draft = await createDueDraft();

    const result = await publishDuePosts();
    assert.equal(result.failed, 1);
    assert.equal(result.retryScheduled, 0);
    const stored = await getPostById(draft.id);
    assert.equal(stored?.status, "failed");
    assert.equal(stored?.retryCount, 0);
    assert.equal(stored?.lastErrorCode, "linkedin_network_error");
  });

  await t.test("immediate publication requires an explicit true confirmation", async () => {
    await resetWorkflow();
    const draft = await createVoicePassedDraft();
    await assert.rejects(
      publishPostNow({ actor: "owner", id: draft.id, confirmPublication: false }),
      /explicit publication confirmation/i,
    );

    linkedInResponder = async () =>
      new Response(null, {
        status: 201,
        headers: { "x-restli-id": "urn:li:share:confirmed-now" },
      });
    const published = await publishPostNow({
      actor: "owner",
      id: draft.id,
      confirmPublication: true,
    });
    assert.equal(published.status, "published");
  });

  await t.test("manual templates render labelled variables and preserve versions", async () => {
    const created = await createTemplate({
      actor: "owner",
      input: {
        type: "outreach",
        scenarioTag: "integration-introduction",
        body: "Hello {{first_name}}, {{introducer_name}} suggested we compare notes.",
        notes: "Copy by hand only.",
      },
    });

    assert.deepEqual(created.variables, ["first_name", "introducer_name"]);
    const partial = await renderTemplate({
      id: created.id,
      variables: { first_name: "Ada" },
    });
    assert.equal(partial?.manualOnly, true);
    assert.equal(
      partial?.rendered,
      "Hello Ada, {{introducer_name}} suggested we compare notes.",
    );
    assert.deepEqual(partial?.missingVariables, ["introducer_name"]);

    const updated = await updateTemplate({
      actor: "owner",
      id: created.id,
      input: { notes: "Verified copy-only route." },
    });
    assert.equal(updated?.version, 2);

    const listed = await listTemplates({ type: "outreach" });
    assert.ok(listed.items.some((item) => item.id === created.id));
    assert.deepEqual(await auditActions(created.id), [
      "template.created",
      "template.updated",
    ]);
  });

  await t.test("official analytics stores only metrics LinkedIn actually returns", async () => {
    await resetWorkflow();
    requests.length = 0;
    const counts: Record<string, number> = {
      IMPRESSION: 321,
      REACTION: 17,
      COMMENT: 4,
      RESHARE: 2,
    };
    linkedInResponder = async () => {
      const url = requests.at(-1)?.url ?? "";
      if (url === "https://api.linkedin.com/rest/posts") {
        return new Response(null, {
          status: 201,
          headers: { "x-restli-id": "urn:li:share:analytics-test" },
        });
      }
      const metric = new URL(url).searchParams.get("queryType") ?? "";
      return Response.json({ elements: [{ count: counts[metric] }] });
    };

    const draft = await createVoicePassedDraft();
    await publishPostNow({
      actor: "owner",
      id: draft.id,
      confirmPublication: true,
    });
    const refreshed = await refreshPostAnalytics({ actor: "owner", postId: draft.id });
    assert.equal(refreshed.refreshed, 1);

    const tracker = await listPostAnalytics();
    assert.equal(tracker.readiness.state, "available");
    assert.deepEqual(tracker.items[0]?.metrics, {
      impressions: 321,
      reactions: 17,
      comments: 4,
      reshares: 2,
    });
    assert.equal(
      requests.filter((request) => request.url.includes("memberCreatorPostAnalytics")).length,
      4,
    );
    assert.ok(requests.every((request) => !request.url.includes("linkedin.com/v2/")));
    assert.ok((await auditActions(draft.id)).includes("analytics.refreshed"));
  });

  await t.test("expired access token refreshes once, stays encrypted, and then publishes", async () => {
    await resetWorkflow();
    await fitExpiredLinkedInRefreshToken();
    requests.length = 0;
    let refreshCalls = 0;
    linkedInResponder = async () => {
      const current = requests.at(-1)!;
      if (current.url === "https://www.linkedin.com/oauth/v2/accessToken") {
        refreshCalls += 1;
        return Response.json({
          access_token: "refreshed-access-token",
          expires_in: 3600,
          refresh_token: "rotated-refresh-token",
          refresh_token_expires_in: 7200,
          scope: "openid profile email w_member_social r_member_postAnalytics",
        });
      }
      return new Response(null, {
        status: 201,
        headers: { "x-restli-id": "urn:li:share:refreshed-publish" },
      });
    };

    const draft = await createVoicePassedDraft();
    const published = await publishPostNow({
      actor: "owner",
      id: draft.id,
      confirmPublication: true,
    });
    assert.equal(published.linkedinPostId, "urn:li:share:refreshed-publish");
    assert.equal(refreshCalls, 1);
    assert.equal(requests[0]?.url, "https://www.linkedin.com/oauth/v2/accessToken");
    const refreshBody = new URLSearchParams(String(requests[0]?.init?.body));
    assert.equal(refreshBody.get("grant_type"), "refresh_token");
    assert.equal(refreshBody.get("refresh_token"), "integration-refresh-token");
    assert.equal(refreshBody.get("client_id"), "integration-client-id");
    assert.equal(
      refreshBody.get("redirect_uri"),
      "http://localhost:3000/api/auth/linkedin/callback",
    );
    assert.equal(requests[1]?.url, "https://api.linkedin.com/rest/posts");
    assert.equal(
      new Headers(requests[1]?.init?.headers).get("Authorization"),
      "Bearer refreshed-access-token",
    );

    const stored = await dbQuery<{
      access_token_ciphertext: string;
      refresh_token_ciphertext: string;
      expires_at: Date;
      refresh_expires_at: Date;
      linkedin_attention_required: boolean;
    }>(
      `
        select
          oauth_tokens.access_token_ciphertext,
          oauth_tokens.refresh_token_ciphertext,
          oauth_tokens.expires_at,
          oauth_tokens.refresh_expires_at,
          owner_settings.linkedin_attention_required
        from oauth_tokens
        cross join owner_settings
        where oauth_tokens.provider = 'linkedin'
          and owner_settings.singleton_key = true
      `,
    );
    assert.equal(
      decryptToken(stored.rows[0]!.access_token_ciphertext),
      "refreshed-access-token",
    );
    assert.equal(
      decryptToken(stored.rows[0]!.refresh_token_ciphertext),
      "rotated-refresh-token",
    );
    assert.ok(stored.rows[0]!.expires_at.getTime() > Date.now());
    assert.ok(stored.rows[0]!.refresh_expires_at.getTime() > Date.now());
    assert.equal(stored.rows[0]!.linkedin_attention_required, false);

    const refreshAudit = await dbQuery<{ metadata: unknown }>(
      "select metadata from audit_log where action = 'linkedin.token_refreshed' order by created_at desc limit 1",
    );
    const auditText = JSON.stringify(refreshAudit.rows[0]?.metadata);
    assert.equal(auditText.includes("refreshed-access-token"), false);
    assert.equal(auditText.includes("rotated-refresh-token"), false);
    assert.match(auditText, /access_expires_at/);
  });

  await t.test("concurrent token users share one locked refresh operation", async () => {
    await fitExpiredLinkedInRefreshToken();
    requests.length = 0;
    let refreshCalls = 0;
    linkedInResponder = async () => {
      refreshCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return Response.json({
        access_token: "single-concurrent-access-token",
        expires_in: 3600,
        scope: "openid profile email w_member_social r_member_postAnalytics",
      });
    };

    const [publishingAccess, analyticsAccess] = await Promise.all([
      getLinkedInApiAccess({ purpose: "publishing", requiredScope: "w_member_social" }),
      getLinkedInApiAccess({
        purpose: "analytics",
        requiredScope: "r_member_postAnalytics",
      }),
    ]);
    assert.equal(refreshCalls, 1);
    assert.equal(publishingAccess.accessToken, "single-concurrent-access-token");
    assert.equal(analyticsAccess.accessToken, "single-concurrent-access-token");
    assert.deepEqual([publishingAccess.refreshed, analyticsAccess.refreshed].sort(), [false, true]);
  });

  await t.test("expired refresh token marks reconnect attention without provider traffic", async () => {
    await fitExpiredLinkedInRefreshToken({ refreshExpired: true });
    requests.length = 0;
    await assert.rejects(
      getLinkedInApiAccess({ purpose: "publishing", requiredScope: "w_member_social" }),
      (error: unknown) =>
        error instanceof LinkedInAccessError &&
        error.code === "linkedin_refresh_unavailable" &&
        error.reconnectRequired,
    );
    assert.equal(requests.length, 0);
    const owner = await dbQuery<{ linkedin_attention_required: boolean }>(
      "select linkedin_attention_required from owner_settings where singleton_key = true",
    );
    assert.equal(owner.rows[0]?.linkedin_attention_required, true);
    const audit = await dbQuery<{ metadata: unknown }>(
      "select metadata from audit_log where action = 'linkedin.attention_required' order by created_at desc limit 1",
    );
    assert.match(JSON.stringify(audit.rows[0]?.metadata), /refresh_token_unavailable/);
  });

  await t.test("disconnect removes the OAuth fastener and locks the owner socket", async () => {
    const result = await disconnectLinkedIn();
    assert.equal(result.disconnected, true);
    const connection = await dbQuery<{
      token_count: number;
      linkedin_member_urn: string | null;
      linkedin_connected_at: Date | null;
    }>(
      `
        select
          (select count(*)::int from oauth_tokens) as token_count,
          linkedin_member_urn,
          linkedin_connected_at
        from owner_settings
        where singleton_key = true
      `,
    );
    assert.equal(connection.rows[0]?.token_count, 0);
    assert.equal(connection.rows[0]?.linkedin_member_urn, null);
    assert.equal(connection.rows[0]?.linkedin_connected_at, null);
  });

  await t.test("owner export excludes tokens and verified deletion clears personal bins", async () => {
    const exported = await exportOwnerWorkspace();
    assert.equal(exported.format, "founder-above-the-fold-owner-export-v1");
    assert.equal(JSON.stringify(exported).includes("access_token_ciphertext"), false);
    assert.ok(exported.posts.length > 0);

    const deleted = await deleteOwnerWorkspace();
    assert.equal(deleted.deleted, true);
    const remaining = await dbQuery<{
      owners: number;
      posts: number;
      templates: number;
      profile_copy: number;
      personal_audit_rows: number;
      deletion_receipts: number;
    }>(
      `
        select
          (select count(*)::int from owner_settings) as owners,
          (select count(*)::int from posts) as posts,
          (select count(*)::int from templates) as templates,
          (select count(*)::int from profile_copy_versions) as profile_copy,
          (select count(*)::int from audit_log where entity_id is not null) as personal_audit_rows,
          (select count(*)::int from audit_log where action = 'owner.workspace_deleted') as deletion_receipts
      `,
    );
    assert.deepEqual(remaining.rows[0], {
      owners: 0,
      posts: 0,
      templates: 0,
      profile_copy: 0,
      personal_audit_rows: 0,
      deletion_receipts: 1,
    });
  });

  assert.equal(isSafeToRetry("linkedin_http_429"), true);
  assert.equal(isSafeToRetry("linkedin_http_500"), true);
  assert.equal(isSafeToRetry("linkedin_http_401"), false);
  assert.equal(isSafeToRetry("linkedin_network_error"), false);
});

test.after(async () => {
  globalThis.fetch = originalFetch;
  await getDbPool().end();
});

async function createVoicePassedDraft() {
  const draft = await createDraftPost({
    actor: "owner",
    input: {
      body:
        "A clear product system helps founders decide what matters and explain the trade-off.",
      pillar: "Founder clarity",
      archetype: "Operating principle",
    },
  });
  const checked = await runVoiceCheckForPost({ actor: "owner", id: draft.id });
  assert.equal(checked?.item.voiceStatus, "passed");
  return checked!.item;
}

async function createDueDraft() {
  const draft = await createVoicePassedDraft();
  await queuePost({ actor: "owner", id: draft.id, scheduledAt: futureSlot() });
  await makeDue(draft.id);
  return draft;
}

async function makeDue(postId: string) {
  await dbQuery(
    "update posts set scheduled_at = now() - interval '1 minute' where id = $1",
    [postId],
  );
}

function futureSlot() {
  return new Date(Date.now() + 60_000).toISOString();
}

async function auditActions(postId: string) {
  const result = await dbQuery<{ action: string }>(
    "select action from audit_log where entity_id = $1 order by created_at, id",
    [postId],
  );
  return result.rows.map((row) => row.action);
}

async function resetEntireCabinet() {
  await dbQuery(`
    truncate table
      audit_log,
      automation_runs,
      post_stats,
      voice_checks,
      post_assets,
      posts,
      templates,
      oauth_tokens,
      owner_settings
    restart identity cascade
  `);
}

async function resetWorkflow() {
  await dbQuery(`
    truncate table
      audit_log,
      automation_runs,
      post_stats,
      voice_checks,
      post_assets,
      posts
    restart identity cascade
  `);
}

async function fitLinkedInTestConnection() {
  await dbQuery(
    `
      insert into owner_settings (
        singleton_key,
        owner_email,
        owner_name,
        linkedin_member_urn,
        linkedin_connected_at,
        linkedin_attention_required
      ) values (true, $1, 'Test Owner', 'urn:li:person:test-owner', now(), false)
    `,
    ["owner@example.test"],
  );
  await dbQuery(
    `
      insert into oauth_tokens (
        provider,
        access_token_ciphertext,
        scope,
        expires_at
      ) values ('linkedin', $1, 'openid profile email w_member_social r_member_postAnalytics', now() + interval '1 hour')
    `,
    [encryptToken("test-access-token")],
  );
}

async function fitExpiredLinkedInRefreshToken({ refreshExpired = false } = {}) {
  await dbQuery(
    `
      update owner_settings
      set linkedin_attention_required = false
      where singleton_key = true
    `,
  );
  await dbQuery(
    `
      update oauth_tokens
      set access_token_ciphertext = $1,
          refresh_token_ciphertext = $2,
          scope = 'openid profile email w_member_social r_member_postAnalytics',
          expires_at = now() - interval '1 minute',
          refresh_expires_at = now() + ($3::int * interval '1 minute')
      where provider = 'linkedin'
    `,
    [
      encryptToken("expired-access-token"),
      encryptToken("integration-refresh-token"),
      refreshExpired ? -1 : 60,
    ],
  );
}
