create table founder_licence_devices (
  id uuid primary key default gen_random_uuid(),
  licence_id uuid not null references founder_licences(id) on delete cascade,
  device_hash text not null,
  device_label text not null,
  first_activated_at timestamptz not null default now(),
  last_verified_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (licence_id, device_hash),
  constraint founder_licence_devices_hash_shape check (device_hash ~ '^[a-f0-9]{64}$'),
  constraint founder_licence_devices_label_length check (length(trim(device_label)) between 1 and 80)
);

create index founder_licence_devices_licence_active_idx
on founder_licence_devices (licence_id, revoked_at);

create trigger founder_licence_devices_updated_at
before update on founder_licence_devices
for each row execute function dispatch_set_updated_at();
