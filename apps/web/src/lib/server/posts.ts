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
