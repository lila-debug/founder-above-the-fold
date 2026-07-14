-- Preserve the first Founder Account schema before assembling the Dispatch schema.
-- The legacy marker is owner_settings.email without owner_settings.singleton_key.
-- Nothing is deleted: every old table is moved behind a legacy_founder_v1_ label.
do $$
declare
  legacy_table_name text;
  legacy_tables text[] := array[
    'audit_log',
    'content_pillars',
    'magic_link_tokens',
    'oauth_tokens',
    'owner_settings',
    'post_stats',
    'posts',
    'profile_copy',
    'templates',
    'voice_checks'
  ];
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'owner_settings'
      and column_name = 'email'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'owner_settings'
      and column_name = 'singleton_key'
  ) then
    foreach legacy_table_name in array legacy_tables loop
      if to_regclass(format('public.%I', legacy_table_name)) is not null then
        if to_regclass(format('public.%I', 'legacy_founder_v1_' || legacy_table_name)) is not null then
          raise exception 'Legacy isolation target already exists for %', legacy_table_name;
        end if;

        execute format(
          'alter table public.%I rename to %I',
          legacy_table_name,
          'legacy_founder_v1_' || legacy_table_name
        );
      end if;
    end loop;
  end if;
end;
$$;
