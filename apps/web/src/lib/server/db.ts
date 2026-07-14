import { Pool, type QueryResult, type QueryResultRow } from "pg";

type DatabaseStatus =
  | {
      configured: false;
      ok: false;
      status: "not_configured";
    }
  | {
      configured: true;
      ok: true;
      status: "ok";
      latencyMs: number;
    }
  | {
      configured: true;
      ok: false;
      status: "error";
      error: string;
    };

declare global {
  var dispatchPgPool: Pool | undefined;
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDbPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalThis.dispatchPgPool) {
    globalThis.dispatchPgPool = new Pool({
      connectionString,
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      ssl: shouldUseSsl(connectionString),
    });
  }

  return globalThis.dispatchPgPool;
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  return getDbPool().query<T>(text, values);
}

export async function checkDatabase(): Promise<DatabaseStatus> {
  if (!hasDatabaseUrl()) {
    return {
      configured: false,
      ok: false,
      status: "not_configured",
    };
  }

  const startedAt = Date.now();

  try {
    await dbQuery("select 1");

    return {
      configured: true,
      ok: true,
      status: "ok",
      latencyMs: Date.now() - startedAt,
    };
  } catch {
    return {
      configured: true,
      ok: false,
      status: "error",
      error: "Database connection check failed.",
    };
  }
}

function shouldUseSsl(connectionString: string) {
  const explicit = process.env.DATABASE_SSL;

  if (explicit === "true") {
    return { rejectUnauthorized: false };
  }

  if (explicit === "false") {
    return false;
  }

  return connectionString.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false;
}
