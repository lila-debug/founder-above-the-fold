alter table posts
  add column if not exists language_code text not null default 'en-CA',
  add column if not exists voice_checked_language_code text;

alter table posts
  drop constraint if exists posts_language_code_allowed;

alter table posts
  add constraint posts_language_code_allowed check (
    language_code in ('en-CA', 'en-GB', 'en-US', 'en-AU', 'en', 'fr-FR', 'fr-CA')
  );

alter table posts
  drop constraint if exists posts_voice_checked_language_code_allowed;

alter table posts
  add constraint posts_voice_checked_language_code_allowed check (
    voice_checked_language_code is null or
    voice_checked_language_code in ('en-CA', 'en-GB', 'en-US', 'en-AU', 'en', 'fr-FR', 'fr-CA')
  );

alter table voice_checks
  add column if not exists language_code text not null default 'en-CA';

alter table voice_checks
  drop constraint if exists voice_checks_language_code_allowed;

alter table voice_checks
  add constraint voice_checks_language_code_allowed check (
    language_code in ('en-CA', 'en-GB', 'en-US', 'en-AU', 'en', 'fr-FR', 'fr-CA')
  );
