-- ============================================================
-- Cyberpunk Combat Zone Companion — Supabase Schema
-- Run this ONCE in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. User data table: one row per user, campaigns stored as JSONB
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  campaigns jsonb not null default '[]',
  display_settings jsonb not null default '{"cardColumns": 4, "fontScale": 100}',
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.user_data enable row level security;

-- 3. RLS Policies: each user can only access their own row
create policy "Users can read their own data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own data"
  on public.user_data for update
  using (auth.uid() = user_id);

create policy "Users can delete their own data"
  on public.user_data for delete
  using (auth.uid() = user_id);

-- 4. Auto-update updated_at on change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_user_data_updated
  before update on public.user_data
  for each row
  execute function public.handle_updated_at();

-- 5. Auto-create user_data row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_data (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
