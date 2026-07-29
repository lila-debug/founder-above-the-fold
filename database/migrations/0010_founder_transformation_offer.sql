alter table stripe_checkout_intents
  alter column offer_key set default 'founder_transformation',
  drop constraint stripe_checkout_intents_offer_key_allowed,
  add constraint stripe_checkout_intents_offer_key_allowed check (
    offer_key in (
      'founder_transformation',
      'mac_licence',
      'profile_setup',
      'founder_os',
      'visibility_ops'
    )
  );

alter table founder_commerce_access
  drop constraint founder_commerce_access_offer_key_allowed,
  add constraint founder_commerce_access_offer_key_allowed check (
    offer_key in (
      'founder_transformation',
      'profile_setup',
      'founder_os',
      'visibility_ops'
    )
  );

comment on column stripe_checkout_intents.offer_key is
  'founder_transformation is the only current public offer; legacy values remain for historical records.';
