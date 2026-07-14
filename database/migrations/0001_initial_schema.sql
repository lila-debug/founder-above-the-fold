create extension if not exists pgcrypto;

create or replace function dispatch_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table owner_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key boolean not null default true unique,
  owner_email text not null,
  owner_name text,
  linkedin_member_urn text,
  linkedin_connected_at timestamptz,
  linkedin_attention_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint owner_settings_singleton check (singleton_key = true),
  constraint owner_settings_email_not_blank check (length(trim(owner_email)) > 0)
);

create trigger owner_settings_updated_at
before update on owner_settings
for each row execute function dispatch_set_updated_at();

create table oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'linkedin',
  access_token_ciphertext text not null,
  refresh_token_ciphertext text,
  scope text not null,
  expires_at timestamptz,
  refresh_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oauth_tokens_provider_unique unique (provider),
  constraint oauth_tokens_provider_not_blank check (length(trim(provider)) > 0)
);

create trigger oauth_tokens_updated_at
before update on oauth_tokens
for each row execute function dispatch_set_updated_at();

create table posts (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  body_hash text not null,
  pillar text,
  archetype text,
  notes text,
  status text not null,
  voice_status text not null default 'unchecked',
  voice_checked_hash text,
  scheduled_at timestamptz,
  published_at timestamptz,
  linkedin_post_id text,
  retry_count int not null default 0,
  last_error_code text,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_body_not_blank check (length(trim(body)) > 0),
  constraint posts_retry_count_nonnegative check (retry_count >= 0),
  constraint posts_status_allowed check (
    status in ('draft', 'queued', 'publishing', 'published', 'failed', 'cancelled')
  ),
  constraint posts_voice_status_allowed check (
    voice_status in ('unchecked', 'passed', 'failed')
  ),
  constraint posts_queued_has_schedule check (
    status <> 'queued' or scheduled_at is not null
  ),
  constraint posts_published_has_public_fields check (
    status <> 'published' or (published_at is not null and linkedin_post_id is not null)
  )
);

create index posts_status_scheduled_at_idx on posts (status, scheduled_at);
create index posts_linkedin_post_id_idx on posts (linkedin_post_id) where linkedin_post_id is not null;

create trigger posts_updated_at
before update on posts
for each row execute function dispatch_set_updated_at();

create table post_assets (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  asset_type text not null,
  storage_path text not null,
  alt_text text,
  linkedin_asset_urn text,
  upload_status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint post_assets_asset_type_allowed check (asset_type in ('image')),
  constraint post_assets_upload_status_allowed check (
    upload_status in ('pending', 'uploaded', 'failed')
  )
);

create index post_assets_post_id_idx on post_assets (post_id);

create table voice_checks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  body_hash text not null,
  status text not null,
  command text not null,
  stdout text,
  stderr text,
  checked_at timestamptz not null default now(),
  constraint voice_checks_status_allowed check (status in ('passed', 'failed'))
);

create index voice_checks_post_id_checked_at_idx on voice_checks (post_id, checked_at desc);

create table profile_copy_versions (
  id uuid primary key default gen_random_uuid(),
  field text not null,
  content text not null,
  version int not null,
  synced boolean not null default false,
  change_note text,
  last_edited_at timestamptz not null default now(),
  marked_synced_at timestamptz,
  constraint profile_copy_field_allowed check (
    field in ('headline', 'about', 'experience', 'featured')
  ),
  constraint profile_copy_version_positive check (version > 0),
  constraint profile_copy_field_version_unique unique (field, version)
);

create index profile_copy_versions_field_version_idx
on profile_copy_versions (field, version desc);

create table templates (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  scenario_tag text not null,
  body text not null,
  notes text,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint templates_type_allowed check (type in ('outreach', 'post')),
  constraint templates_body_not_blank check (length(trim(body)) > 0),
  constraint templates_version_positive check (version > 0)
);

create index templates_type_scenario_idx on templates (type, scenario_tag);

create trigger templates_updated_at
before update on templates
for each row execute function dispatch_set_updated_at();

create table post_stats (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  impressions int,
  likes int,
  comments int,
  shares int,
  raw jsonb,
  pulled_at timestamptz not null default now(),
  constraint post_stats_impressions_nonnegative check (impressions is null or impressions >= 0),
  constraint post_stats_likes_nonnegative check (likes is null or likes >= 0),
  constraint post_stats_comments_nonnegative check (comments is null or comments >= 0),
  constraint post_stats_shares_nonnegative check (shares is null or shares >= 0)
);

create index post_stats_post_id_pulled_at_idx on post_stats (post_id, pulled_at desc);

create table automation_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  summary jsonb,
  error_message text,
  constraint automation_runs_status_allowed check (
    status in ('running', 'succeeded', 'failed')
  )
);

create index automation_runs_job_started_idx on automation_runs (job_name, started_at desc);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_log_actor_allowed check (actor in ('owner', 'mcp', 'cron', 'system')),
  constraint audit_log_action_not_blank check (length(trim(action)) > 0),
  constraint audit_log_entity_type_not_blank check (length(trim(entity_type)) > 0)
);

create index audit_log_entity_idx on audit_log (entity_type, entity_id, created_at desc);
create index audit_log_actor_created_at_idx on audit_log (actor, created_at desc);
