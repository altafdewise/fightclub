-- Safe repair for /fightclub/admin error:
-- PGRST205: Could not find the table 'public.fc_challenge_entries'
--
-- This creates only the missing Fight Club challenge-details table.
-- It does NOT delete, truncate, or update existing buyers in fc_bookings.

create extension if not exists pgcrypto;

create table if not exists public.fc_challenge_entries (
  id                      uuid primary key default gen_random_uuid(),
  booking_id              uuid not null references public.fc_bookings(id) on delete cascade,
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

-- Ask Supabase/PostgREST to refresh its schema cache immediately.
notify pgrst, 'reload schema';

-- Verification: table should show as public.fc_challenge_entries and your
-- existing Fight Club bookings count should remain unchanged.
select
  to_regclass('public.fc_challenge_entries') as challenge_entries_table,
  (select count(*) from public.fc_bookings) as existing_fightclub_bookings;
