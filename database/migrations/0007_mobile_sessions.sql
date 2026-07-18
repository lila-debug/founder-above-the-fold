create table mobile_magic_links (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint mobile_magic_links_email_not_blank check (length(trim(owner_email)) > 0)
);

create index mobile_magic_links_expiry_idx on mobile_magic_links (expires_at)
where used_at is null;

create table mobile_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  device_name text,
  access_token_hash text not null unique,
  refresh_token_hash text not null unique,
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mobile_sessions_email_not_blank check (length(trim(owner_email)) > 0)
);

create index mobile_sessions_access_idx on mobile_sessions (access_token_hash)
where revoked_at is null;

create index mobile_sessions_refresh_idx on mobile_sessions (refresh_token_hash)
where revoked_at is null;

create trigger mobile_sessions_updated_at
before update on mobile_sessions
for each row execute function dispatch_set_updated_at();

create table mobile_linkedin_oauth_flows (
  id uuid primary key default gen_random_uuid(),
  mobile_session_id uuid not null references mobile_sessions(id) on delete cascade,
  state_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index mobile_linkedin_oauth_flows_expiry_idx
on mobile_linkedin_oauth_flows (expires_at) where used_at is null;
