create table stripe_checkout_intents (
  id uuid primary key default gen_random_uuid(),
  purchaser_email text not null,
  status text not null default 'created',
  stripe_checkout_session_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stripe_checkout_intents_email_normalized check (
    purchaser_email = lower(trim(purchaser_email)) and length(purchaser_email) between 3 and 320
  ),
  constraint stripe_checkout_intents_status_allowed check (
    status in ('created', 'checkout_open', 'paid', 'cancelled', 'failed')
  )
);

create index stripe_checkout_intents_email_created_idx
on stripe_checkout_intents (purchaser_email, created_at desc);

create trigger stripe_checkout_intents_updated_at
before update on stripe_checkout_intents
for each row execute function dispatch_set_updated_at();

create table founder_licences (
  id uuid primary key default gen_random_uuid(),
  purchaser_email text not null,
  stripe_customer_id text,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  status text not null,
  major_version int not null default 1,
  device_allowance int not null default 1,
  purchased_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint founder_licences_email_normalized check (
    purchaser_email = lower(trim(purchaser_email)) and length(purchaser_email) between 3 and 320
  ),
  constraint founder_licences_status_allowed check (
    status in ('active', 'refunded', 'disputed', 'revoked')
  ),
  constraint founder_licences_major_version_positive check (major_version > 0),
  constraint founder_licences_device_allowance_positive check (device_allowance > 0)
);

create index founder_licences_email_status_idx
on founder_licences (purchaser_email, status);

create trigger founder_licences_updated_at
before update on founder_licences
for each row execute function dispatch_set_updated_at();

create table licence_recovery_requests (
  id uuid primary key default gen_random_uuid(),
  licence_id uuid not null references founder_licences(id) on delete cascade,
  requested_email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  opened_at timestamptz,
  created_at timestamptz not null default now(),
  constraint licence_recovery_email_normalized check (
    requested_email = lower(trim(requested_email)) and length(requested_email) between 3 and 320
  ),
  constraint licence_recovery_token_hash_shape check (token_hash ~ '^[a-f0-9]{64}$'),
  constraint licence_recovery_expiry_after_creation check (expires_at > created_at)
);

create index licence_recovery_email_created_idx
on licence_recovery_requests (requested_email, created_at desc);

create index licence_recovery_expiry_idx
on licence_recovery_requests (expires_at);

create table stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  provider_created_at timestamptz not null,
  received_at timestamptz not null default now(),
  applied boolean not null default false,
  constraint stripe_webhook_events_id_not_blank check (length(trim(stripe_event_id)) > 0),
  constraint stripe_webhook_events_type_not_blank check (length(trim(event_type)) > 0)
);
