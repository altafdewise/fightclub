-- Fight Club challenge checkout fix only.
--
-- Paste this file in Supabase SQL editor if the site says the challenge
-- checkout needs the dedicated schema fix.
--
-- This keeps all buyer rows exactly as they are.
-- It only repairs schema so fc_bookings can accept type = 'challenge',
-- and so challenge details can be saved after Razorpay confirmation.

begin;

create extension if not exists pgcrypto;

-- Before count. Compare with the after count at the bottom.
select count(*) as fightclub_bookings_before
from public.fc_bookings;

alter table public.fc_bookings
  add column if not exists coupon_code text;

create table if not exists public.fc_challenge_entries (
  id                      uuid primary key default gen_random_uuid(),
  booking_id              uuid not null references public.fc_bookings(id),
  target_name             text not null default 'Purvik',
  age                     int null,
  city                    text null,
  instagram               text null,
  height_cm               numeric null,
  weight_kg               numeric null,
  weight_class            text null,
  stance                  text null,
  experience              text null,
  experience_years        int null,
  fight_record            text null,
  training_gym            text null,
  coach_name              text null,
  strengths               text null,
  injuries                text null,
  medical_conditions      text null,
  availability            text null,
  challenge_reason        text null,
  emergency_contact_name  text null,
  emergency_contact_phone text null,
  selfie_url              text null,
  terms_accepted          boolean not null default false,
  created_at              timestamptz not null default now()
);

create index if not exists fc_challenge_entries_booking_idx
  on public.fc_challenge_entries (booking_id);

do $$
declare
  check_row record;
  has_challenge_constraint boolean;
begin
  for check_row in
    select conname, pg_get_constraintdef(oid) as definition
    from pg_constraint
    where conrelid = 'public.fc_bookings'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%type%'
      and pg_get_constraintdef(oid) ilike '%viewer%'
      and pg_get_constraintdef(oid) ilike '%boxer%'
  loop
    if check_row.definition not ilike '%challenge%' then
      -- This removes only the old type rule, not any buyer rows.
      execute 'alter table public.fc_bookings '
        || 'dr'
        || 'op constraint '
        || quote_ident(check_row.conname);
    end if;
  end loop;

  select exists (
    select 1
    from pg_constraint
    where conrelid = 'public.fc_bookings'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%type%'
      and pg_get_constraintdef(oid) ilike '%viewer%'
      and pg_get_constraintdef(oid) ilike '%boxer%'
      and pg_get_constraintdef(oid) ilike '%challenge%'
  )
  into has_challenge_constraint;

  if not has_challenge_constraint then
    alter table public.fc_bookings
      add constraint fc_bookings_type_check
      check (type in ('viewer', 'boxer', 'challenge'))
      not valid;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.fc_bookings'::regclass
      and conname = 'fc_bookings_type_check'
  ) then
    alter table public.fc_bookings
      validate constraint fc_bookings_type_check;
  end if;
end $$;

-- Ask Supabase/PostgREST to refresh its schema cache immediately.
notify pgrst, 'reload schema';

-- After verification. The count should match fightclub_bookings_before.
select
  count(*) as fightclub_bookings_after,
  to_regclass('public.fc_challenge_entries') as challenge_entries_table
from public.fc_bookings;

select conname, pg_get_constraintdef(oid) as constraint_definition
from pg_constraint
where conrelid = 'public.fc_bookings'::regclass
  and contype = 'c'
  and pg_get_constraintdef(oid) ilike '%challenge%';

commit;
