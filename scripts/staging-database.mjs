import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const root = path.resolve(import.meta.dirname, "..");
const apply = process.env.APPLY_STAGING_DATABASE_MIGRATIONS === "true";
const approved = process.env.STAGING_DATABASE_APPROVED === "true";
const projectName = required("NEON_STAGING_PROJECT_NAME");
const databaseUrl = required("DATABASE_URL");
const productionDatabaseHost = required("PRODUCTION_DATABASE_HOST").toLowerCase();
const parsedUrl = new URL(databaseUrl);

assert.equal(projectName, "founder-above-the-fold-stripe-staging", "BLOCKED: staging database project name is fixed.");
assert.match(parsedUrl.hostname, /\.neon\.tech$/, "BLOCKED: staging migrations accept only a Neon database host.");
assert.notEqual(parsedUrl.hostname.toLowerCase(), productionDatabaseHost, "BLOCKED: staging and production database hosts must differ.");
if (apply) assert.equal(approved, true, "BLOCKED: set STAGING_DATABASE_APPROVED=true only for the new empty Neon project.");

const expectedMigrations = (await readdir(path.join(root, "database", "migrations")))
  .filter((name) => name.endsWith(".sql"))
  .sort();
const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

try {
  const tablesBefore = await tableNames();
  if (apply) {
    assert.equal(tablesBefore.length, 0, "BLOCKED: staging migration fitting requires a truly blank database.");
    execFileSync("node", ["scripts/migrate.mjs"], {
      cwd: root,
      env: process.env,
      stdio: "inherit",
    });
  } else if (tablesBefore.length === 0) {
    console.log("PASS Neon staging database is blank; no migrations or records were copied.");
    console.log(`AUDIT ${expectedMigrations.length} repository migrations are ready.`);
    process.exit();
  }

  const applied = await client.query("select name from dispatch_migrations order by name");
  assert.deepEqual(applied.rows.map((row) => row.name), expectedMigrations, "BLOCKED: staging migration ledger differs from the repository.");

  const operationalTables = [
    "audit_log",
    "automation_runs",
    "cloud_voice_daily_usage",
    "founder_commerce_access",
    "founder_licence_devices",
    "founder_licences",
    "licence_recovery_requests",
    "mobile_linkedin_oauth_flows",
    "mobile_magic_links",
    "mobile_sessions",
    "oauth_tokens",
    "owner_settings",
    "post_assets",
    "post_stats",
    "posts",
    "stripe_checkout_intents",
    "stripe_webhook_events",
    "voice_checks",
    "waitlist_signups",
  ];
  for (const table of operationalTables) {
    const count = await client.query(`select count(*)::int as count from "${table}"`);
    assert.equal(count.rows[0]?.count, 0, `BLOCKED: ${table} contains records; the staging cabinet is not clean.`);
  }

  console.log(`PASS all ${expectedMigrations.length} repository migrations are fitted from scratch.`);
  console.log(`PASS ${operationalTables.length} operational tables contain zero copied production records.`);
} finally {
  await client.end();
}

async function tableNames() {
  const result = await client.query(
    `select tablename from pg_tables
     where schemaname = 'public'
     order by tablename`,
  );
  return result.rows.map((row) => row.tablename);
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`BLOCKED: ${name} is missing.`);
  return value;
}
