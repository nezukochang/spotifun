-- ═══════════════════════════════════════════════════════════════
-- FLUXION — Coller TOUT ce fichier dans Supabase → SQL Editor → Run
-- (projet vide, première installation)
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ─── Tables ───────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.albums (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid not null references public.artists (id) on delete cascade,
  title text not null,
  cover_url text,
  released_at date,
  created_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id uuid primary key default uuid_generate_v4(),
  album_id uuid references public.albums (id) on delete set null,
  artist_id uuid not null references public.artists (id) on delete cascade,
  title text not null,
  duration_ms integer not null check (duration_ms > 0),
  track_number integer,
  stream_storage_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists tracks_title_trgm on public.tracks using gin (title gin_trgm_ops);

create table if not exists public.playlists (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  is_public boolean not null default false,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playlist_tracks (
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  track_id uuid not null references public.tracks (id) on delete cascade,
  position integer not null,
  added_at timestamptz not null default now(),
  primary key (playlist_id, track_id)
);

create table if not exists public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  track_id uuid not null references public.tracks (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table if not exists public.play_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  track_id uuid not null references public.tracks (id) on delete cascade,
  position_ms integer not null default 0,
  played_at timestamptz not null default now()
);

create index if not exists play_events_user_played_at on public.play_events (user_id, played_at desc);

create table if not exists public.devices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  device_name text,
  ble_identifier text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.offline_cache_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  track_id uuid not null references public.tracks (id) on delete cascade,
  device_id uuid not null references public.devices (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, track_id, device_id)
);

create table if not exists public.handoff_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_device_id uuid not null references public.devices (id) on delete cascade,
  target_device_id uuid references public.devices (id) on delete set null,
  track_id uuid not null references public.tracks (id) on delete cascade,
  position_ms integer not null default 0,
  token_hash text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── Trigger profil à l'inscription ───────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── RLS ──────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.likes enable row level security;
alter table public.play_events enable row level security;
alter table public.devices enable row level security;
alter table public.offline_cache_entries enable row level security;
alter table public.handoff_sessions enable row level security;
alter table public.artists enable row level security;
alter table public.albums enable row level security;
alter table public.tracks enable row level security;

-- Policies (drop + recreate = réexécutable)
do $$ begin
  drop policy if exists "Catalog read tracks" on public.tracks;
  drop policy if exists "Artists read all" on public.artists;
  drop policy if exists "Albums read all" on public.albums;
  drop policy if exists "Profiles read all authenticated" on public.profiles;
  drop policy if exists "Profiles update own" on public.profiles;
  drop policy if exists "Playlists read own or public" on public.playlists;
  drop policy if exists "Playlists crud own" on public.playlists;
  drop policy if exists "Playlist tracks read" on public.playlist_tracks;
  drop policy if exists "Likes own" on public.likes;
  drop policy if exists "Play events insert own" on public.play_events;
  drop policy if exists "Devices own" on public.devices;
  drop policy if exists "Offline cache own" on public.offline_cache_entries;
  drop policy if exists "Handoff own" on public.handoff_sessions;
end $$;

create policy "Catalog read tracks" on public.tracks for select to authenticated using (true);
create policy "Artists read all" on public.artists for select to authenticated using (true);
create policy "Albums read all" on public.albums for select to authenticated using (true);
create policy "Profiles read all authenticated" on public.profiles for select to authenticated using (true);
create policy "Profiles update own" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Playlists read own or public" on public.playlists for select to authenticated using (owner_id = auth.uid() or is_public = true);
create policy "Playlists crud own" on public.playlists for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Playlist tracks read" on public.playlist_tracks for select to authenticated using (
  exists (select 1 from public.playlists p where p.id = playlist_id and (p.owner_id = auth.uid() or p.is_public = true))
);
create policy "Likes own" on public.likes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Play events insert own" on public.play_events for insert to authenticated with check (user_id = auth.uid());
create policy "Devices own" on public.devices for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Offline cache own" on public.offline_cache_entries for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Handoff own" on public.handoff_sessions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── Données démo (morceaux de test) ──────────────────────────

insert into public.artists (id, name, image_url) values
  ('a0000000-0000-4000-8000-000000000001', 'Fluxion Studio', 'https://picsum.photos/seed/a1/400/400'),
  ('a0000000-0000-4000-8000-000000000002', 'Apex Wave', 'https://picsum.photos/seed/a2/400/400'),
  ('a0000000-0000-4000-8000-000000000003', 'Neon Grid', 'https://picsum.photos/seed/a3/400/400')
on conflict (id) do nothing;

insert into public.albums (id, artist_id, title, cover_url) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Demo Sessions', 'https://picsum.photos/seed/al1/400/400'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Signal Theory', 'https://picsum.photos/seed/al2/400/400'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'Handoff EP', 'https://picsum.photos/seed/al3/400/400')
on conflict (id) do nothing;

insert into public.tracks (id, album_id, artist_id, title, duration_ms, track_number, stream_storage_key) values
  ('t0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Precision Pulse', 348000, 1, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
  ('t0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Fluid Motion', 312000, 2, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
  ('t0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Robust Line', 295000, 1, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
  ('t0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Cache Drift', 280000, 2, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
  ('t0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'Link Beam', 265000, 1, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'),
  ('t0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'Sync Orbit', 302000, 2, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3')
on conflict (id) do nothing;

-- Fin — vérifiez : select count(*) from public.tracks;  → doit afficher 6
