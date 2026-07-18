alter table stripe_checkout_intents
  add column offer_key text not null default 'mac_licence',
  add column checkout_mode text not null default 'payment',
  add constraint stripe_checkout_intents_offer_key_allowed check (
    offer_key in ('mac_licence', 'profile_setup', 'founder_os', 'visibility_ops')
  ),
  add constraint stripe_checkout_intents_checkout_mode_allowed check (
    checkout_mode in ('payment', 'subscription')
  );

create table founder_commerce_access (
  id uuid primary key default gen_random_uuid(),
  purchaser_email text not null,
  offer_key text not null,
  billing_kind text not null,
  stripe_customer_id text,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  stripe_subscription_id text unique,
  status text not null,
  purchased_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint founder_commerce_access_email_normalized check (
    purchaser_email = lower(trim(purchaser_email)) and length(purchaser_email) between 3 and 320
  ),
  constraint founder_commerce_access_offer_key_allowed check (
    offer_key in ('profile_setup', 'founder_os', 'visibility_ops')
  ),
  constraint founder_commerce_access_billing_kind_allowed check (
    billing_kind in ('payment', 'subscription')
  ),
  constraint founder_commerce_access_status_allowed check (
    status in ('active', 'past_due', 'cancelled', 'refunded', 'disputed', 'revoked')
  )
);

create index founder_commerce_access_email_status_idx
on founder_commerce_access (purchaser_email, status);

create trigger founder_commerce_access_updated_at
before update on founder_commerce_access
for each row execute function dispatch_set_updated_at();
