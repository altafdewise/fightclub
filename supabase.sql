create extension if not exists pgcrypto;

create table if not exists client_day_summaries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  date date not null,
  total_items int not null default 0,
  completed_items int not null default 0,
  completion_pct int not null default 0,
  is_submitted boolean not null default false,
  is_win_day boolean not null default false,
  submitted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_day_summaries_client_date_unique unique (client_id, date)
);

create index if not exists client_day_summaries_client_date_idx
  on client_day_summaries (client_id, date);

alter table daily_checklist_items
  add column if not exists video_url text;
