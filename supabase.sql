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

-- Weekly coaching check-ins
create table if not exists weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  trainer_id uuid references admins(id) on delete cascade,
  weight numeric null,
  energy_level int null check (energy_level between 1 and 5),
  sleep_quality int null check (sleep_quality between 1 and 5),
  workout_adherence int null check (workout_adherence between 1 and 5),
  diet_adherence int null check (diet_adherence between 1 and 5),
  notes text,
  trainer_feedback text null,
  trainer_replied_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists weekly_checkins_client_created_idx
  on weekly_checkins (client_id, created_at desc);

-- Client ↔ Trainer assignments (one trainer per client)
create table if not exists client_trainer_assignments (
  client_id uuid primary key references clients(id) on delete cascade,
  trainer_id uuid not null references admins(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists client_trainer_assignments_trainer_id_idx
  on client_trainer_assignments (trainer_id);

-- Conversations (one per client)
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  trainer_id uuid not null references admins(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint conversations_client_unique unique (client_id)
);

create index if not exists conversations_trainer_id_idx
  on conversations (trainer_id);

-- Chat messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null,
  sender_role text not null check (sender_role in ('client', 'trainer', 'hq')),
  sender_type text not null check (sender_type in ('client','trainer')) default 'client',
  client_id uuid null references clients(id) on delete set null,
  trainer_id uuid null references admins(id) on delete set null,
  message_text text null,
  image_url text null,
  client_temp_id text null,
  is_read boolean not null default false,
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_type text not null check (user_type in ('client','trainer','hq')),
  user_id uuid not null,
  title text not null,
  message text not null,
  type text not null,
  link text null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications (user_type, user_id, created_at desc);
create index if not exists notifications_is_read_idx on notifications (is_read);

-- Backfill sender_type from sender_role for existing rows
alter table messages
  add column if not exists sender_type text;
update messages set sender_type = sender_role where sender_type is null;
alter table messages alter column sender_type set not null;
alter table messages drop constraint if exists messages_sender_type_check;
alter table messages add constraint messages_sender_type_check check (sender_type in ('client','trainer'));
alter table messages add column if not exists client_id uuid null references clients(id) on delete set null;
alter table messages add column if not exists trainer_id uuid null references admins(id) on delete set null;
alter table messages add column if not exists read_at timestamptz null;
alter table messages add column if not exists client_temp_id text null;

create index if not exists messages_conversation_created_idx
  on messages (conversation_id, created_at);

-- Realtime and RLS for messages
alter publication supabase_realtime add table messages;
alter table if exists messages enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'messages_select_participants'
  ) then
    create policy messages_select_participants on messages
      for select
      using (
        exists (
          select 1
          from conversations c
          where c.id = messages.conversation_id
            and (c.client_id = auth.uid() or c.trainer_id = auth.uid())
        )
      );
  end if;
end$$;

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
