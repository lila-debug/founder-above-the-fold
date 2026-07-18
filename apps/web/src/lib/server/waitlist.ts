import { createHash, randomBytes } from "node:crypto";
import { dbQuery, hasDatabaseUrl } from "@/lib/server/db";

export type WaitlistInput = {
  email: string;
  firstName?: string;
  role?: string;
  primaryProblem?: string;
  betaOptIn: boolean;
  marketingOptIn: boolean;
  source: string;
  referredBy?: string;
};

type SignupResult = {
  state: "created" | "existing";
  emailSent: boolean;
};

let tableReady = false;

async function ensureWaitlistTable() {
  if (tableReady) return;
  await dbQuery(`
    create table if not exists waitlist_signups (
      id uuid primary key default gen_random_uuid(),
      email text not null unique,
      first_name text,
      role text,
      primary_problem text,
      beta_opt_in boolean not null default false,
      marketing_opt_in boolean not null default false,
      source text not null default 'founderaccount-waitlist',
      referred_by text,
      confirmation_token_hash text,
      confirmation_expires_at timestamptz,
      confirmation_sent_at timestamptz,
      confirmed_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await dbQuery(`
    create index if not exists waitlist_signups_confirmation_token_idx
    on waitlist_signups (confirmation_token_hash)
    where confirmation_token_hash is not null
  `);
  tableReady = true;
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function sendConfirmationEmail(email: string, firstName: string | undefined, url: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MAGIC_LINK_FROM?.trim();
  if (!apiKey || !from) return false;

  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Confirm your Founder Above the Fold beta place",
      text: `${greeting}

Confirm your private-beta request:
${url}

This link expires in 24 hours.

You can also use the free No Circle of Hell accessibility skill:
https://www.founderaccount.com/no-circles

Founder Above the Fold`,
      html: `<p>${greeting}</p><p>Confirm your private-beta request:</p><p><a href="${url}">Confirm my place</a></p><p>This link expires in 24 hours.</p><p><a href="https://www.founderaccount.com/no-circles">Get the free No Circle of Hell accessibility skill</a>.</p><p>Founder Above the Fold</p>`,
    }),
  });
  return response.ok;
}

export async function saveWaitlistSignup(input: WaitlistInput, siteOrigin: string): Promise<SignupResult> {
  if (!hasDatabaseUrl()) throw new Error("Signup storage is not configured.");
  await ensureWaitlistTable();

  const prior = await dbQuery<{ confirmed_at: Date | null; confirmation_sent_at: Date | null }>(
    "select confirmed_at, confirmation_sent_at from waitlist_signups where email = $1 limit 1",
    [input.email],
  );
  const state = prior.rowCount ? "existing" : "created";
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const maySend = !prior.rows[0]?.confirmation_sent_at ||
    Date.now() - new Date(prior.rows[0].confirmation_sent_at).getTime() > 10 * 60 * 1000;

  await dbQuery(
    `insert into waitlist_signups (
      email, first_name, role, primary_problem, beta_opt_in, marketing_opt_in,
      source, referred_by, confirmation_token_hash, confirmation_expires_at
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    on conflict (email) do update set
      first_name = coalesce(excluded.first_name, waitlist_signups.first_name),
      role = coalesce(excluded.role, waitlist_signups.role),
      primary_problem = coalesce(excluded.primary_problem, waitlist_signups.primary_problem),
      beta_opt_in = waitlist_signups.beta_opt_in or excluded.beta_opt_in,
      marketing_opt_in = waitlist_signups.marketing_opt_in or excluded.marketing_opt_in,
      source = excluded.source,
      referred_by = coalesce(excluded.referred_by, waitlist_signups.referred_by),
      confirmation_token_hash = case when waitlist_signups.confirmed_at is null then excluded.confirmation_token_hash else null end,
      confirmation_expires_at = case when waitlist_signups.confirmed_at is null then excluded.confirmation_expires_at else null end,
      updated_at = now()`,
    [
      input.email,
      input.firstName ?? null,
      input.role ?? null,
      input.primaryProblem ?? null,
      input.betaOptIn,
      input.marketingOptIn,
      input.source,
      input.referredBy ?? null,
      tokenHash(token),
      expiresAt,
    ],
  );

  let emailSent = false;
  if (!prior.rows[0]?.confirmed_at && maySend) {
    const confirmationUrl = `${siteOrigin}/api/waitlist/confirm?token=${encodeURIComponent(token)}`;
    try {
      emailSent = await sendConfirmationEmail(input.email, input.firstName, confirmationUrl);
      if (emailSent) {
        await dbQuery("update waitlist_signups set confirmation_sent_at = now() where email = $1", [input.email]);
      }
    } catch {
      emailSent = false;
    }
  }

  return { state, emailSent };
}

export async function confirmWaitlistSignup(token: string) {
  if (!hasDatabaseUrl()) return false;
  await ensureWaitlistTable();
  const result = await dbQuery(
    `update waitlist_signups
      set confirmed_at = coalesce(confirmed_at, now()),
          confirmation_token_hash = null,
          confirmation_expires_at = null,
          updated_at = now()
      where confirmation_token_hash = $1
        and confirmation_expires_at > now()
      returning id`,
    [tokenHash(token)],
  );
  return Boolean(result.rowCount);
}
