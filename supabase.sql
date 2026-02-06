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

create table if not exists client_undertakings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references clients(id) on delete cascade,
  agreed_at timestamptz not null default now(),
  all_checkboxes_confirmed boolean not null default true,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_undertakings_client_id_idx
  on client_undertakings (client_id);

-- Daily Reset Audit Logs Table
create table if not exists reset_audit_logs (
  id uuid primary key default gen_random_uuid(),
  reset_date date not null unique,
  platform_timezone text not null,
  reset_time_utc timestamptz not null,
  clients_processed int not null default 0,
  clients_succeeded int not null default 0,
  clients_failed int not null default 0,
  streaks_evaluated int not null default 0,
  streaks_incremented int not null default 0,
  status text not null,
  error_message text,
  attempt_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reset_audit_logs_reset_date_idx
  on reset_audit_logs (reset_date);

create index if not exists reset_audit_logs_status_idx
  on reset_audit_logs (status);

-- Platform Settings Table
create table if not exists platform_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value text not null,
  data_type text,
  description text,
  admin_editable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_settings_key_idx
  on platform_settings (setting_key);

-- Insert default timezone setting
insert into platform_settings (setting_key, setting_value, data_type, description, admin_editable)
values ('PLATFORM_TIMEZONE', 'America/New_York', 'string', 'Timezone for daily reset (IANA format)', true)
on conflict (setting_key) do nothing;

-- Modify client_day_summaries to track reset
alter table client_day_summaries
  add column if not exists reset_at timestamptz;

create index if not exists client_day_summaries_reset_at_idx
  on client_day_summaries (client_id, reset_at nulls first);

-- Update sessions table to allow 'hq' session type
alter table sessions drop constraint if exists sessions_type_check;
alter table sessions add constraint sessions_type_check check (type in ('admin', 'client', 'hq'));
