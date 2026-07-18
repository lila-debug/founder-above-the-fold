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
);

create index if not exists waitlist_signups_created_at_idx
  on waitlist_signups (created_at desc);

create index if not exists waitlist_signups_confirmation_token_idx
  on waitlist_signups (confirmation_token_hash)
  where confirmation_token_hash is not null;
