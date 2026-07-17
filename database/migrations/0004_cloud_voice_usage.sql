create table cloud_voice_daily_usage (
  usage_day date primary key,
  request_count int not null default 0,
  audio_bytes bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint cloud_voice_request_count_nonnegative check (request_count >= 0),
  constraint cloud_voice_audio_bytes_nonnegative check (audio_bytes >= 0)
);

comment on table cloud_voice_daily_usage is
  'Daily aggregate cloud voice fuse. Stores counts and byte totals only; never audio or transcripts.';
