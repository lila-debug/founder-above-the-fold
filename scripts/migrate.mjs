import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(rootDir, "database", "migrations");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required to run migrations.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: shouldUseSsl(databaseUrl),
});

const client = await pool.connect();

try {
  await client.query("select pg_advisory_lock(hashtext('dispatch_migrations'))");
  await client.query(`
    create table if not exists dispatch_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migrations found.");
  } else {
    for (const file of files) {
      const existing = await client.query(
        "select 1 from dispatch_migrations where name = $1",
        [file],
      );

      if (existing.rowCount) {
        console.log(`Skipping ${file}`);
        continue;
      }

      const sql = await readFile(path.join(migrationsDir, file), "utf8");

      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into dispatch_migrations (name) values ($1)", [file]);
        await client.query("commit");
        console.log(`Applied ${file}`);
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
  }
} finally {
  await client.query("select pg_advisory_unlock(hashtext('dispatch_migrations'))");
  client.release();
  await pool.end();
}

function shouldUseSsl(connectionString) {
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
