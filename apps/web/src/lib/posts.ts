import type { ContentLanguage } from "@/lib/content-languages";

export const POST_STATUSES = [
  "draft",
  "queued",
  "publishing",
  "published",
  "failed",
  "cancelled",
] as const;

export const VOICE_STATUSES = ["unchecked", "passed", "failed"] as const;

export type PostStatus = (typeof POST_STATUSES)[number];
export type VoiceStatus = (typeof VOICE_STATUSES)[number];

export type PostRecord = {
  id: string;
  body: string;
  bodyHash: string;
  pillar: string | null;
  archetype: string | null;
  notes: string | null;
  languageCode: ContentLanguage;
  status: PostStatus;
  voiceStatus: VoiceStatus;
  voiceCheckedHash: string | null;
  voiceCheckedLanguageCode: ContentLanguage | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  linkedinPostId: string | null;
  retryCount: number;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  characterCount: number;
  wordCount: number;
  canEdit: boolean;
  canDelete: boolean;
  canQueue: boolean;
};

export type PostTracker = {
  items: PostRecord[];
  counts: Record<PostStatus, number>;
  source: "database" | "seed_fallback";
  database:
    | {
        configured: false;
        status: "not_configured";
      }
    | {
        configured: true;
        status: "ok";
      }
    | {
        configured: true;
        status: "error";
        error: string;
      };
};

export type VoiceCheckRecord = {
  id: string;
  postId: string;
  bodyHash: string;
  status: VoiceStatus;
  languageCode: ContentLanguage;
  command: string;
  stdout: string | null;
  stderr: string | null;
  checkedAt: string;
};

export function parsePostStatus(value: unknown): PostStatus | null {
  return typeof value === "string" && POST_STATUSES.includes(value as PostStatus)
    ? (value as PostStatus)
    : null;
}

export function toPostRecord(row: {
  id: string;
  body: string;
  body_hash: string;
  pillar: string | null;
  archetype: string | null;
  notes: string | null;
  language_code: ContentLanguage;
  status: PostStatus;
  voice_status: VoiceStatus;
  voice_checked_hash: string | null;
  voice_checked_language_code: ContentLanguage | null;
  scheduled_at: Date | string | null;
  published_at: Date | string | null;
  linkedin_post_id: string | null;
  retry_count: number;
  last_error_code: string | null;
  last_error_message: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}): PostRecord {
  const body = row.body.trim();
  const voiceMatchesBody = row.voice_checked_hash === row.body_hash;
  const voiceMatchesLanguage =
    row.voice_checked_language_code === row.language_code;

  return {
    id: row.id,
    body,
    bodyHash: row.body_hash,
    pillar: row.pillar,
    archetype: row.archetype,
    notes: row.notes,
    languageCode: row.language_code,
    status: row.status,
    voiceStatus: row.voice_status,
    voiceCheckedHash: row.voice_checked_hash,
    voiceCheckedLanguageCode: row.voice_checked_language_code,
    scheduledAt: toIso(row.scheduled_at),
    publishedAt: toIso(row.published_at),
    linkedinPostId: row.linkedin_post_id,
    retryCount: row.retry_count,
    lastErrorCode: row.last_error_code,
    lastErrorMessage: row.last_error_message,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    characterCount: body.length,
    wordCount: countWords(body),
    canEdit: row.status === "draft",
    canDelete: row.status === "draft",
    canQueue:
      row.status === "draft" &&
      row.voice_status === "passed" &&
      voiceMatchesBody &&
      voiceMatchesLanguage,
  };
}

function countWords(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function toIso(value: Date | string | null) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
