-- ════════════════════════════════════════════════════════════════
-- FIGHT CLUB — SEASON ONE, SERIES TWO
-- Ticketing + registration schema for the /fightclub section.
--
-- Run this once in the Supabase SQL editor (separate from supabase.sql
-- so the trainer/client schema is never touched). Safe to re-run.
--
-- Tables are prefixed `fc_` to guarantee no collision with existing
-- tables (bookings/acknowledgements names are common).
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Bookings (one row per ticket purchase, viewer or boxer) ────────
create table if not exists fc_bookings (
  id                  uuid primary key default gen_random_uuid(),
  type                text not null check (type in ('viewer', 'boxer')),
  full_name           text not null,
  email               text not null,
  phone               text not null,
  quantity            int null,                       -- viewers only; null for boxers
  amount              int not null,                   -- total in paise (server-computed)
  currency            text not null default 'INR',
  razorpay_order_id   text null unique,           -- null for comp/coupon bookings
  razorpay_payment_id text null,
  coupon_code         text null,                  -- set when the booking was comped via a coupon (e.g. PBC for offline cash)
  status              text not null default 'pending'
                        check (status in ('pending', 'paid', 'failed')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Idempotent column add for projects that already ran the original schema.
alter table fc_bookings add column if not exists coupon_code text;
alter table fc_bookings alter column razorpay_order_id drop not null;

create index if not exists fc_bookings_status_idx     on fc_bookings (status, created_at desc);
create index if not exists fc_bookings_type_idx        on fc_bookings (type);
create index if not exists fc_bookings_order_idx       on fc_bookings (razorpay_order_id);
create index if not exists fc_bookings_created_at_idx  on fc_bookings (created_at desc);

-- ── Boxer entries (1:1 with a boxer-type booking) ─────────────────
create table if not exists fc_boxer_entries (
  id                uuid primary key default gen_random_uuid(),
  booking_id        uuid not null references fc_bookings(id) on delete cascade,
  weight_kg         numeric null,
  weight_class      text null,            -- e.g. Welterweight (boxer-selected division)
  experience        text null,            -- First-timer | Some training | Amateur | Pro
  experience_years  int null,
  selfie_url        text null,            -- storage path inside the boxer-selfies bucket
  created_at        timestamptz not null default now()
);

-- Idempotent column add for projects that already ran the original schema.
alter table fc_boxer_entries add column if not exists weight_class text;

create index if not exists fc_boxer_entries_booking_idx on fc_boxer_entries (booking_id);

-- ── Acknowledgements (digital sign-off, captured before payment) ──
create table if not exists fc_acknowledgements (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid null references fc_bookings(id) on delete set null, -- linked once paid
  full_name           text not null,
  all_points_accepted boolean not null default false,
  accepted_at         timestamptz not null default now(),
  points_version      int not null default 1
);

create index if not exists fc_acknowledgements_booking_idx on fc_acknowledgements (booking_id);

-- ── updated_at trigger for fc_bookings ────────────────────────────
create or replace function fc_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists fc_bookings_updated_at on fc_bookings;
create trigger fc_bookings_updated_at
  before update on fc_bookings
  for each row execute function fc_set_updated_at();

-- ── Storage bucket for boxer selfies (PRIVATE) ────────────────────
-- All reads/writes go through the service role on the server; the
-- bucket is never publicly readable. Admin views via signed URLs.
insert into storage.buckets (id, name, public)
values ('boxer-selfies', 'boxer-selfies', false)
on conflict (id) do nothing;

-- Note: with the bucket private and all access via the service-role
-- key (server-side only), no row-level Storage policies are required.
-- RLS on the tables above is intentionally left disabled because every
-- query runs through the service-role client in server routes only —
-- the anon key never touches these tables.
