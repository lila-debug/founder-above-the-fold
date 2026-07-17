import { dbQuery } from "./db";

const DEFAULT_DAILY_REQUEST_LIMIT = 50;
const DEFAULT_DAILY_BYTE_LIMIT = 100 * 1024 * 1024;

type CloudVoiceUsageRow = {
  request_count: number;
  audio_bytes: string;
};

type UsageQuery = (
  text: string,
  values?: unknown[],
) => Promise<{ rowCount: number | null; rows: CloudVoiceUsageRow[] }>;

export class CloudVoiceUsageLimitError extends Error {
  constructor() {
    super("Daily cloud voice safety limit reached.");
    this.name = "CloudVoiceUsageLimitError";
  }
}

export async function reserveCloudVoiceUsage(
  audioBytes: number,
  query: UsageQuery = queryCloudVoiceUsage,
) {
  const requestLimit = positiveInteger(
    process.env.VOICE_DAILY_REQUEST_LIMIT,
    DEFAULT_DAILY_REQUEST_LIMIT,
  );
  const byteLimit = positiveInteger(
    process.env.VOICE_DAILY_BYTE_LIMIT,
    DEFAULT_DAILY_BYTE_LIMIT,
  );

  const result = await query(
    `
      insert into cloud_voice_daily_usage (
        usage_day,
        request_count,
        audio_bytes,
        updated_at
      ) values (current_date, 1, $1, now())
      on conflict (usage_day) do update set
        request_count = cloud_voice_daily_usage.request_count + 1,
        audio_bytes = cloud_voice_daily_usage.audio_bytes + excluded.audio_bytes,
        updated_at = now()
      where cloud_voice_daily_usage.request_count < $2
        and cloud_voice_daily_usage.audio_bytes + excluded.audio_bytes <= $3
      returning request_count, audio_bytes
    `,
    [audioBytes, requestLimit, byteLimit],
  );

  if (result.rowCount !== 1) {
    throw new CloudVoiceUsageLimitError();
  }

  // Daily aggregates are useful for cost checks, but old operational counters are not.
  await query(
    "delete from cloud_voice_daily_usage where usage_day < current_date - 31",
  ).catch(() => undefined);

  return {
    requestCount: result.rows[0].request_count,
    audioBytes: Number(result.rows[0].audio_bytes),
    requestLimit,
    byteLimit,
  };
}

async function queryCloudVoiceUsage(text: string, values?: unknown[]) {
  return dbQuery<CloudVoiceUsageRow>(text, values);
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
