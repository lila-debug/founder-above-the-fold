insert into profile_copy_versions (
  field,
  content,
  version,
  synced,
  change_note,
  marked_synced_at
)
select
  'headline',
  'Fractional CPO for AI-native founders | Product strategy, sharper roadmaps, and operating systems that help teams ship what matters',
  3,
  false,
  'Seeded from the landing page fractional CPO headline.',
  null
where not exists (
  select 1 from profile_copy_versions where field = 'headline'
)
on conflict (field, version) do nothing;

insert into profile_copy_versions (
  field,
  content,
  version,
  synced,
  change_note,
  marked_synced_at
)
select
  'about',
  'I help founders turn messy product signals into clear product decisions. Through Prototype Cafe, I work as a fractional CPO for teams that need senior product judgement before they are ready for a full-time product executive.',
  5,
  true,
  'Seeded from the landing page About copy and voice-system notes.',
  now()
where not exists (
  select 1 from profile_copy_versions where field = 'about'
)
on conflict (field, version) do nothing;

insert into profile_copy_versions (
  field,
  content,
  version,
  synced,
  change_note,
  marked_synced_at
)
select
  'experience',
  'Fractional product leadership across strategy, discovery, roadmap design, AI-native workflows, launch planning, and product operating systems.',
  2,
  true,
  'Seeded from the landing page experience summary.',
  now()
where not exists (
  select 1 from profile_copy_versions where field = 'experience'
)
on conflict (field, version) do nothing;
