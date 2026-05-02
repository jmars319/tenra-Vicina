create extension if not exists pgcrypto;

do $$
begin
  create type public.signal_category as enum (
    'food-coffee',
    'music-nightlife',
    'outdoors',
    'study-work',
    'games',
    'help-favors',
    'general'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.signal_status as enum ('active', 'expired', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_status as enum ('visible', 'hidden', 'reported');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.report_status as enum ('open', 'reviewed', 'closed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  bio text check (bio is null or char_length(bio) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  description text not null check (char_length(description) between 1 and 240),
  category public.signal_category not null default 'general',
  approximate_location_label text not null check (
    char_length(approximate_location_label) between 3 and 80
  ),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  visibility_radius_miles integer not null default 3 check (
    visibility_radius_miles in (1, 3, 5, 10)
  ),
  status public.signal_status not null default 'active',
  content_status public.content_status not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint signals_expire_after_start check (expires_at > starts_at),
  constraint signals_max_duration check (expires_at <= starts_at + interval '24 hours')
);

create table if not exists public.signal_interests (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (signal_id, user_id)
);

create table if not exists public.signal_comments (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references public.signals(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 280),
  content_status public.content_status not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_user_id),
  check (blocker_id <> blocked_user_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  signal_id uuid references public.signals(id) on delete cascade,
  comment_id uuid references public.signal_comments(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 80),
  details text check (details is null or char_length(details) <= 500),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  constraint reports_have_target check (
    signal_id is not null or comment_id is not null or reported_user_id is not null
  )
);

create index if not exists signals_active_lookup_idx
  on public.signals (status, content_status, starts_at, expires_at);
create index if not exists signals_lat_lng_idx on public.signals (latitude, longitude);
create index if not exists signals_author_idx on public.signals (author_id, created_at desc);
create index if not exists signal_interests_signal_idx
  on public.signal_interests (signal_id);
create index if not exists signal_comments_signal_idx
  on public.signal_comments (signal_id, created_at);
create index if not exists user_blocks_blocker_idx on public.user_blocks (blocker_id);
create index if not exists reports_reporter_idx on public.reports (reporter_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists signals_set_updated_at on public.signals;
create trigger signals_set_updated_at
before update on public.signals
for each row execute function public.set_updated_at();

drop trigger if exists signal_comments_set_updated_at on public.signal_comments;
create trigger signal_comments_set_updated_at
before update on public.signal_comments
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1), 'Neighbor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_for_new_user on auth.users;
create trigger create_profile_for_new_user
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.signals enable row level security;
alter table public.signal_interests enable row level security;
alter table public.signal_comments enable row level security;
alter table public.user_blocks enable row level security;
alter table public.reports enable row level security;

drop policy if exists "Profiles are readable" on public.profiles;
create policy "Profiles are readable"
on public.profiles for select
using (true);

drop policy if exists "Users create own profile" on public.profiles;
create policy "Users create own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Visible active signals are readable" on public.signals;
create policy "Visible active signals are readable"
on public.signals for select
using (
  content_status = 'visible'
  and status = 'active'
  and expires_at > now()
  and (
    auth.uid() is null
    or not exists (
      select 1
      from public.user_blocks blocks
      where blocks.blocker_id = auth.uid()
        and blocks.blocked_user_id = signals.author_id
    )
  )
);

drop policy if exists "Users create own signals" on public.signals;
create policy "Users create own signals"
on public.signals for insert
with check (
  auth.uid() = author_id
  and status = 'active'
  and content_status = 'visible'
);

drop policy if exists "Users update own signals" on public.signals;
create policy "Users update own signals"
on public.signals for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "Users delete own signals" on public.signals;
create policy "Users delete own signals"
on public.signals for delete
using (auth.uid() = author_id);

drop policy if exists "Visible signal interests are readable" on public.signal_interests;
create policy "Visible signal interests are readable"
on public.signal_interests for select
using (
  exists (
    select 1
    from public.signals visible_signal
    where visible_signal.id = signal_interests.signal_id
      and visible_signal.content_status = 'visible'
      and visible_signal.status = 'active'
      and visible_signal.expires_at > now()
  )
);

drop policy if exists "Users create own interests" on public.signal_interests;
create policy "Users create own interests"
on public.signal_interests for insert
with check (auth.uid() = user_id);

drop policy if exists "Users delete own interests" on public.signal_interests;
create policy "Users delete own interests"
on public.signal_interests for delete
using (auth.uid() = user_id);

drop policy if exists "Visible signal comments are readable" on public.signal_comments;
create policy "Visible signal comments are readable"
on public.signal_comments for select
using (
  content_status = 'visible'
  and exists (
    select 1
    from public.signals visible_signal
    where visible_signal.id = signal_comments.signal_id
      and visible_signal.content_status = 'visible'
      and visible_signal.status = 'active'
      and visible_signal.expires_at > now()
  )
);

drop policy if exists "Users create own comments" on public.signal_comments;
create policy "Users create own comments"
on public.signal_comments for insert
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.signals visible_signal
    where visible_signal.id = signal_comments.signal_id
      and visible_signal.content_status = 'visible'
      and visible_signal.status = 'active'
      and visible_signal.expires_at > now()
  )
);

drop policy if exists "Users update own comments" on public.signal_comments;
create policy "Users update own comments"
on public.signal_comments for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "Users delete own comments" on public.signal_comments;
create policy "Users delete own comments"
on public.signal_comments for delete
using (auth.uid() = author_id);

drop policy if exists "Blocks are private to blocker" on public.user_blocks;
create policy "Blocks are private to blocker"
on public.user_blocks for select
using (auth.uid() = blocker_id);

drop policy if exists "Users create own blocks" on public.user_blocks;
create policy "Users create own blocks"
on public.user_blocks for insert
with check (auth.uid() = blocker_id and blocker_id <> blocked_user_id);

drop policy if exists "Users delete own blocks" on public.user_blocks;
create policy "Users delete own blocks"
on public.user_blocks for delete
using (auth.uid() = blocker_id);

drop policy if exists "Users create reports" on public.reports;
create policy "Users create reports"
on public.reports for insert
with check (auth.uid() = reporter_id);

drop policy if exists "Users read own reports" on public.reports;
create policy "Users read own reports"
on public.reports for select
using (auth.uid() = reporter_id);
