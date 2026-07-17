import { createHash } from "node:crypto";
import {
  POST_STATUSES,
  type PostRecord,
  type PostStatus,
  type PostTracker,
  type VoiceCheckRecord,
  type VoiceStatus,
  toPostRecord,
} from "@/lib/posts";
import { writeAuditEvent, type AuditActor } from "./audit";
import { dbQuery, hasDatabaseUrl } from "./db";
import {
  LinkedInPublishingError,
  publishLinkedInText,
} from "./publishing";
import {
  runVoiceCommand,
  VoiceCommandSetupError,
  type VoiceCommandResult,
} from "./voice";

type PostRow = {
  id: string;
  body: string;
  body_hash: string;
  pillar: string | null;
  archetype: string | null;
  notes: string | null;
  status: PostStatus;
  voice_status: VoiceStatus;
  voice_checked_hash: string | null;
  scheduled_at: Date | string | null;
  published_at: Date | string | null;
  linkedin_post_id: string | null;
  retry_count: number;
  last_error_code: string | null;
  last_error_message: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

type VoiceCheckRow = {
  id: string;
  post_id: string;
  body_hash: string;
  status: VoiceStatus;
  command: string;
  stdout: string | null;
  stderr: string | null;
  checked_at: Date | string;
};

export type DraftWriteInput = {
  body?: unknown;
  pillar?: unknown;
  archetype?: unknown;
  notes?: unknown;
};

export class DraftPostError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

export class VoiceCheckError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

export class PostWorkflowError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

const SEED_DRAFTS: PostRow[] = [
  seedDraft({
    id: "seed-draft-roadmap",
    body:
      "A roadmap is not a promise. It is a pressure gauge. When every item is marked urgent, the product system is no longer deciding - it is absorbing.",
    pillar: "Founder Clarity",
    archetype: "Diagnostic",
    notes: "Seed draft for the first content queue panel.",
    createdAt: "2026-07-06T09:00:00.000Z",
  }),
  seedDraft({
    id: "seed-draft-rituals",
    body:
      "The product ritual that matters is the one your team still uses during a messy week. Everything else is theatre with a calendar invite.",
    pillar: "Fractional CPO OS",
    archetype: "Operating principle",
    notes: "Good candidate for voice-check workflow once the gate is wired.",
    createdAt: "2026-07-06T10:00:00.000Z",
  }),
  seedDraft({
    id: "seed-draft-human-ai",
    body:
      "AI can accelerate the product loop, but it cannot own judgement. The founder still has to decide what trade-off the company is willing to live with.",
    pillar: "AI-Native Product",
    archetype: "Point of view",
    notes: "Seed draft for the AI product pillar.",
    createdAt: "2026-07-06T11:00:00.000Z",
  }),
];

export async function getPostTracker({
  status,
  limit = 50,
}: {
  status?: PostStatus | null;
  limit?: number;
} = {}): Promise<PostTracker> {
  if (!hasDatabaseUrl()) {
    return buildTracker(
      filterSeedDrafts(status).slice(0, clampLimit(limit)),
      "seed_fallback",
      {
        configured: false,
        status: "not_configured",
      },
    );
  }

  try {
    const safeLimit = clampLimit(limit);
    const result = status
      ? await dbQuery<PostRow>(
          `
            select *
            from posts
            where status = $1
            order by created_at desc
            limit $2
          `,
          [status, safeLimit],
        )
      : await dbQuery<PostRow>(
          `
            select *
            from posts
            order by created_at desc
            limit $1
          `,
          [safeLimit],
        );

    return buildTracker(result.rows, "database", {
      configured: true,
      status: "ok",
    });
  } catch {
    return buildTracker(
      filterSeedDrafts(status).slice(0, clampLimit(limit)),
      "seed_fallback",
      {
        configured: true,
        status: "error",
        error: "Draft storage could not be inspected.",
      },
    );
  }
}

export async function getPostById(id: string): Promise<PostRecord | null> {
  if (!hasDatabaseUrl()) {
    const seed = SEED_DRAFTS.find((item) => item.id === id);

    return seed ? toPostRecord(seed) : null;
  }

  const result = await dbQuery<PostRow>(
    `
      select *
      from posts
      where id = $1
      limit 1
    `,
    [id],
  );
  const row = result.rows[0];

  return row ? toPostRecord(row) : null;
}

export async function createDraftPost({
  actor,
  input,
}: {
  actor: AuditActor;
  input: DraftWriteInput;
}) {
  const normalized = normalizeDraftInput(input, { requireBody: true });
  const bodyHash = hashPostBody(normalized.body);

  const result = await dbQuery<PostRow>(
    `
      insert into posts (
        body,
        body_hash,
        pillar,
        archetype,
        notes,
        status,
        voice_status,
        voice_checked_hash
      )
      values ($1, $2, $3, $4, $5, 'draft', 'unchecked', null)
      returning *
    `,
    [
      normalized.body,
      bodyHash,
      normalized.pillar,
      normalized.archetype,
      normalized.notes,
    ],
  );
  const row = result.rows[0];

  await writeAuditEvent({
    actor,
    action: "post.draft_created",
    entityType: "post",
    entityId: row.id,
    metadata: {
      bodyHash: row.body_hash,
      pillar: row.pillar,
      archetype: row.archetype,
    },
  });

  return toPostRecord(row);
}

export async function updateDraftPost({
  actor,
  id,
  input,
}: {
  actor: AuditActor;
  id: string;
  input: DraftWriteInput;
}) {
  const current = await getExistingPostRow(id);

  if (!current) {
    return null;
  }

  if (current.status !== "draft") {
    throw new DraftPostError("Only draft posts can be edited.", 409);
  }

  const normalized = normalizeDraftInput(input, {
    current,
    requireBody: false,
  });
  const bodyHash = hashPostBody(normalized.body);
  const bodyChanged = bodyHash !== current.body_hash;

  const result = await dbQuery<PostRow>(
    `
      update posts
      set body = $2,
          body_hash = $3,
          pillar = $4,
          archetype = $5,
          notes = $6,
          voice_status = case when $7 then 'unchecked' else voice_status end,
          voice_checked_hash = case when $7 then null else voice_checked_hash end
      where id = $1
      returning *
    `,
    [
      id,
      normalized.body,
      bodyHash,
      normalized.pillar,
      normalized.archetype,
      normalized.notes,
      bodyChanged,
    ],
  );
  const row = result.rows[0];

  await writeAuditEvent({
    actor,
    action: "post.draft_updated",
    entityType: "post",
    entityId: row.id,
    metadata: {
      bodyChanged,
      bodyHash: row.body_hash,
      voiceStatus: row.voice_status,
    },
  });

  return toPostRecord(row);
}

export async function deleteDraftPost({
  actor,
  id,
}: {
  actor: AuditActor;
  id: string;
}) {
  const current = await getExistingPostRow(id);

  if (!current) {
    return null;
  }

  if (current.status !== "draft") {
    throw new DraftPostError("Only draft posts can be deleted.", 409);
  }

  await dbQuery("delete from posts where id = $1", [id]);
  await writeAuditEvent({
    actor,
    action: "post.draft_deleted",
    entityType: "post",
    entityId: id,
    metadata: {
      bodyHash: current.body_hash,
      pillar: current.pillar,
      archetype: current.archetype,
    },
  });

  return toPostRecord(current);
}

export async function runVoiceCheckForPost({
  actor,
  id,
}: {
  actor: AuditActor;
  id: string;
}) {
  const current = await getExistingPostRow(id);

  if (!current) {
    return null;
  }

  if (current.status !== "draft") {
    throw new VoiceCheckError("Only draft posts can be voice-checked.", 409);
  }

  let commandResult: VoiceCommandResult;

  try {
    commandResult = await runVoiceCommand(current.body);
  } catch (error) {
    if (error instanceof VoiceCommandSetupError) {
      throw new VoiceCheckError(error.message, 503);
    }

    throw error;
  }

  const checkResult = await dbQuery<VoiceCheckRow>(
    `
      insert into voice_checks (
        post_id,
        body_hash,
        status,
        command,
        stdout,
        stderr
      )
      values ($1, $2, $3, $4, $5, $6)
      returning *
    `,
    [
      current.id,
      current.body_hash,
      commandResult.status,
      commandResult.command,
      commandResult.stdout,
      commandResult.stderr,
    ],
  );
  const postResult = await dbQuery<PostRow>(
    `
      update posts
      set voice_status = $2,
          voice_checked_hash = $3
      where id = $1
      returning *
    `,
    [current.id, commandResult.status, current.body_hash],
  );
  const check = toVoiceCheckRecord(checkResult.rows[0]);
  const item = toPostRecord(postResult.rows[0]);

  await writeAuditEvent({
    actor,
    action: "post.voice_checked",
    entityType: "post",
    entityId: current.id,
    metadata: {
      bodyHash: current.body_hash,
      voiceStatus: commandResult.status,
      command: commandResult.command,
    },
  });

  return { item, voiceCheck: check };
}

export async function queuePost({
  actor,
  id,
  scheduledAt,
}: {
  actor: AuditActor;
  id: string;
  scheduledAt: unknown;
}) {
  const current = await getExistingPostRow(id);

  if (!current) {
    return null;
  }

  if (current.status !== "draft") {
    throw new PostWorkflowError("Only draft posts can be queued.", 409);
  }

  if (
    current.voice_status !== "passed" ||
    current.voice_checked_hash !== current.body_hash
  ) {
    throw new PostWorkflowError(
      "Run a passing voice check on the current draft before queueing it.",
      409,
    );
  }

  if (typeof scheduledAt !== "string") {
    throw new PostWorkflowError("Choose a valid future publishing time.", 400);
  }

  const publishAt = new Date(scheduledAt);

  if (!Number.isFinite(publishAt.getTime()) || publishAt.getTime() <= Date.now()) {
    throw new PostWorkflowError("Choose a valid future publishing time.", 400);
  }

  const result = await dbQuery<PostRow>(
    `
      update posts
      set status = 'queued',
          scheduled_at = $2,
          last_error_code = null,
          last_error_message = null
      where id = $1
      returning *
    `,
    [id, publishAt],
  );
  const row = result.rows[0];

  await writeAuditEvent({
    actor,
    action: "post.queued",
    entityType: "post",
    entityId: id,
    metadata: { scheduledAt: publishAt.toISOString() },
  });

  return toPostRecord(row);
}

export async function cancelQueuedPost({
  actor,
  id,
  reason,
}: {
  actor: AuditActor;
  id: string;
  reason?: unknown;
}) {
  const current = await getExistingPostRow(id);

  if (!current) {
    return null;
  }

  if (current.status !== "queued") {
    throw new PostWorkflowError("Only queued posts can be cancelled.", 409);
  }

  const safeReason =
    typeof reason === "string" && reason.trim() ? reason.trim().slice(0, 500) : null;
  const result = await dbQuery<PostRow>(
    `
      update posts
      set status = 'cancelled',
          last_error_code = null,
          last_error_message = $2
      where id = $1
      returning *
    `,
    [id, safeReason],
  );

  await writeAuditEvent({
    actor,
    action: "post.cancelled",
    entityType: "post",
    entityId: id,
    metadata: { reason: safeReason },
  });

  return toPostRecord(result.rows[0]);
}

export async function publishPostNow({
  actor,
  id,
  confirmPublication,
}: {
  actor: AuditActor;
  id: string;
  confirmPublication: unknown;
}) {
  if (confirmPublication !== true) {
    throw new PostWorkflowError(
      "Explicit publication confirmation is required.",
      400,
    );
  }

  return publishPost({ actor, id, retryOnFailure: false, dueOnly: false });
}

export async function publishDuePosts({ limit = 10 }: { limit?: number } = {}) {
  const safeLimit = clampLimit(limit);
  const due = await dbQuery<{ id: string }>(
    `
      select id
      from posts
      where status = 'queued'
        and scheduled_at <= now()
      order by scheduled_at asc
      limit $1
    `,
    [safeLimit],
  );
  const results: Array<{
    postId: string;
    status: "published" | "retry_scheduled" | "failed" | "skipped";
    linkedinPostId?: string;
    reason?: string;
  }> = [];

  for (const row of due.rows) {
    try {
      const result = await publishPost({
        actor: "cron",
        id: row.id,
        retryOnFailure: true,
        dueOnly: true,
      });
      results.push(result);
    } catch (error) {
      results.push({
        postId: row.id,
        status: "skipped",
        reason:
          error instanceof Error ? error.message : "Post could not be inspected.",
      });
    }
  }

  return {
    inspected: due.rowCount ?? due.rows.length,
    published: results.filter((item) => item.status === "published").length,
    retryScheduled: results.filter((item) => item.status === "retry_scheduled")
      .length,
    failed: results.filter((item) => item.status === "failed").length,
    skipped: results.filter((item) => item.status === "skipped").length,
    results,
  };
}

async function publishPost({
  actor,
  id,
  retryOnFailure,
  dueOnly,
}: {
  actor: AuditActor;
  id: string;
  retryOnFailure: boolean;
  dueOnly: boolean;
}) {
  const current = await getExistingPostRow(id);

  if (!current) {
    throw new PostWorkflowError("Post not found.", 404);
  }

  if (!(["draft", "queued"] as PostStatus[]).includes(current.status)) {
    throw new PostWorkflowError(
      "Only a draft or queued post can enter the publishing conveyor.",
      409,
    );
  }

  if (dueOnly && current.status !== "queued") {
    throw new PostWorkflowError("Only queued posts can publish on the timer.", 409);
  }

  if (
    current.voice_status !== "passed" ||
    current.voice_checked_hash !== current.body_hash
  ) {
    throw new PostWorkflowError(
      "The current draft revision must pass the voice gate before publishing.",
      409,
    );
  }

  const claimed = await dbQuery<PostRow>(
    `
      update posts
      set status = 'publishing',
          last_error_code = null,
          last_error_message = null
      where id = $1
        and status = $2
        and voice_status = 'passed'
        and voice_checked_hash = body_hash
        and ($3::boolean = false or scheduled_at <= now())
      returning *
    `,
    [id, current.status, dueOnly],
  );
  const post = claimed.rows[0];

  if (!post) {
    throw new PostWorkflowError(
      "The post moved before it could be locked for publishing.",
      409,
    );
  }

  await writeAuditEvent({
    actor,
    action: "post.publish_started",
    entityType: "post",
    entityId: id,
    metadata: {
      scheduledAt: toIso(post.scheduled_at),
      retryCount: post.retry_count,
    },
  });

  try {
    const published = await publishLinkedInText(post.body);
    const result = await dbQuery<PostRow>(
      `
        update posts
        set status = 'published',
            published_at = now(),
            linkedin_post_id = $2,
            last_error_code = null,
            last_error_message = null
        where id = $1
          and status = 'publishing'
        returning *
      `,
      [id, published.postId],
    );

    await writeAuditEvent({
      actor,
      action: "post.published",
      entityType: "post",
      entityId: id,
      metadata: { linkedinPostId: published.postId },
    });

    return {
      postId: id,
      status: "published" as const,
      linkedinPostId: published.postId,
      item: toPostRecord(result.rows[0]),
    };
  } catch (error) {
    const failure = normalizePublishingFailure(error);
    const canRetry =
      retryOnFailure && post.retry_count < 1 && isSafeToRetry(failure.code);
    const result = await dbQuery<PostRow>(
      `
        update posts
        set status = $2,
            retry_count = retry_count + case when $3 then 1 else 0 end,
            scheduled_at = case when $3 then now() + interval '15 minutes' else scheduled_at end,
            last_error_code = $4,
            last_error_message = $5
        where id = $1
          and status = 'publishing'
        returning *
      `,
      [id, canRetry ? "queued" : "failed", canRetry, failure.code, failure.message],
    );

    await writeAuditEvent({
      actor,
      action: canRetry ? "post.publish_retry_scheduled" : "post.publish_failed",
      entityType: "post",
      entityId: id,
      metadata: {
        reason: failure.code,
        retryCount: result.rows[0]?.retry_count ?? post.retry_count,
      },
    });

    if (!retryOnFailure) {
      throw new PostWorkflowError(failure.message, failure.statusCode);
    }

    return {
      postId: id,
      status: canRetry ? ("retry_scheduled" as const) : ("failed" as const),
      reason: failure.message,
      item: result.rows[0] ? toPostRecord(result.rows[0]) : undefined,
    };
  }
}

function normalizePublishingFailure(error: unknown) {
  if (error instanceof LinkedInPublishingError) {
    return {
      code: error.code,
      message: error.message.slice(0, 500),
      statusCode: error.statusCode,
    };
  }

  return {
    code: "publishing_internal_error",
    message: "The publishing conveyor stopped unexpectedly.",
    statusCode: 500,
  };
}

export function isSafeToRetry(code: string) {
  return code === "linkedin_http_429" || /^linkedin_http_5\d\d$/.test(code);
}

function toIso(value: Date | string | null) {
  return value ? new Date(value).toISOString() : null;
}

export function hashPostBody(body: string) {
  return createHash("sha256").update(body.trim(), "utf8").digest("hex");
}

function toVoiceCheckRecord(row: VoiceCheckRow): VoiceCheckRecord {
  return {
    id: row.id,
    postId: row.post_id,
    bodyHash: row.body_hash,
    status: row.status,
    command: row.command,
    stdout: row.stdout,
    stderr: row.stderr,
    checkedAt:
      row.checked_at instanceof Date
        ? row.checked_at.toISOString()
        : new Date(row.checked_at).toISOString(),
  };
}

function buildTracker(
  rows: PostRow[],
  source: PostTracker["source"],
  database: PostTracker["database"],
): PostTracker {
  const items = rows.map(toPostRecord);
  const counts = POST_STATUSES.reduce(
    (nextCounts, status) => ({
      ...nextCounts,
      [status]: items.filter((item) => item.status === status).length,
    }),
    {} as Record<PostStatus, number>,
  );

  return {
    items,
    counts,
    source,
    database,
  };
}

function normalizeDraftInput(
  input: DraftWriteInput,
  options: { current?: PostRow; requireBody: boolean },
) {
  const body =
    typeof input.body === "string"
      ? input.body.trim()
      : options.current?.body.trim();

  if (input.body !== undefined && typeof input.body !== "string") {
    throw new DraftPostError("Draft body must be text.", 400);
  }

  if (options.requireBody && !body) {
    throw new DraftPostError("Draft body cannot be empty.", 400);
  }

  if (!body) {
    throw new DraftPostError("Draft body cannot be empty.", 400);
  }

  return {
    body,
    pillar: normalizeOptionalText(input.pillar, options.current?.pillar),
    archetype: normalizeOptionalText(input.archetype, options.current?.archetype),
    notes: normalizeOptionalText(input.notes, options.current?.notes),
  };
}

function normalizeOptionalText(value: unknown, fallback?: string | null) {
  if (value === undefined) {
    return fallback ?? null;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new DraftPostError("Draft metadata must be text.", 400);
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

async function getExistingPostRow(id: string) {
  const result = await dbQuery<PostRow>(
    `
      select *
      from posts
      where id = $1
      limit 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

function seedDraft({
  id,
  body,
  pillar,
  archetype,
  notes,
  createdAt,
}: {
  id: string;
  body: string;
  pillar: string;
  archetype: string;
  notes: string;
  createdAt: string;
}): PostRow {
  return {
    id,
    body,
    body_hash: hashPostBody(body),
    pillar,
    archetype,
    notes,
    status: "draft",
    voice_status: "unchecked",
    voice_checked_hash: null,
    scheduled_at: null,
    published_at: null,
    linkedin_post_id: null,
    retry_count: 0,
    last_error_code: null,
    last_error_message: null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

function filterSeedDrafts(status?: PostStatus | null) {
  return status ? SEED_DRAFTS.filter((item) => item.status === status) : SEED_DRAFTS;
}

function clampLimit(limit: number) {
  if (!Number.isFinite(limit)) {
    return 50;
  }

  return Math.min(Math.max(Math.floor(limit), 1), 100);
}
