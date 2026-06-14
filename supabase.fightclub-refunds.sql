-- ════════════════════════════════════════════════════════════════
-- FIGHT CLUB — REFUND REQUESTS (additive migration)
--
-- Run this ONCE in the Supabase SQL editor. It ONLY creates the new
-- fc_refund_requests table — it does not touch, alter, or drop any
-- existing table, so all current bookings/boxers/challenges data is
-- left exactly as-is. Safe to re-run (uses "if not exists").
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

create table if not exists fc_refund_requests (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('viewer', 'boxer')),
  full_name   text not null,
  email       text not null,
  phone       text not null,
  booking_id  text null,                     -- the FCH ticket id, if they have it
  upi_id      text not null,                 -- where to send the money
  amount_inr  int null,                      -- amount they paid (rupees), optional
  reason      text not null,
  status      text not null default 'pending'
                check (status in ('pending', 'refunded')),
  created_at  timestamptz not null default now()
);

create index if not exists fc_refund_requests_status_idx
  on fc_refund_requests (status, created_at desc);
