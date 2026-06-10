-- Fluxion — schéma initial Supabase
-- Exécuter dans l’éditeur SQL Supabase ou via CLI: supabase db push

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Profils (lié à auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Artistes & albums
create table public.artists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.albums (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid not null references public.artists (id) on delete cascade,
  title text not null,
  cover_url text,
  released_at date,
  created_at timestamptz not null default now()
);

-- Morceaux (métadonnées uniquement — audio sur CDN externe)
create table public.tracks (
  id uuid primary key default uuid_generate_v4(),
  album_id uuid references public.albums (id) on delete set null,
  artist_id uuid not null references public.artists (id) on delete cascade,
  title text not null,
  duration_ms integer not null check (duration_ms > 0),
  track_number integer,
  stream_storage_key text not null, -- clé côté CDN / bucket privé
  created_at timestamptz not null default now()
);

create index tracks_title_trgm on public.tracks using gin (title gin_trgm_ops);

-- Playlists
create table public.playlists (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  is_public boolean not null default false,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.playlist_tracks (
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  track_id uuid not null references public.tracks (id) on delete cascade,
  position integer not null,
  added_at timestamptz not null default now(),
  primary key (playlist_id, track_id)
);

-- Likes & historique
create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  track_id uuid not null references public.tracks (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table public.play_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  track_id uuid not null references public.tracks (id) on delete cascade,
  position_ms integer not null default 0,
  played_at timestamptz not null default now()
);

create index play_events_user_played_at on public.play_events (user_id, played_at desc);

-- Appareils (handoff, notifications)
create table public.devices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  device_name text,
  ble_identifier text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Suivi cache offline côté serveur (révocation)
create table public.offline_cache_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  track_id uuid not null references public.tracks (id) on delete cascade,
  device_id uuid not null references public.devices (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, track_id, device_id)
);

-- Sessions handoff Bluetooth / multi-device
create table public.handoff_sessions (
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

-- Trigger profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.likes enable row level security;
alter table public.play_events enable row level security;
alter table public.devices enable row level security;
alter table public.offline_cache_entries enable row level security;
alter table public.handoff_sessions enable row level security;

-- Catalogue lecture publique (ajuster selon licence)
alter table public.artists enable row level security;
alter table public.albums enable row level security;
alter table public.tracks enable row level security;

create policy "Catalog read for authenticated"
  on public.tracks for select to authenticated using (true);

create policy "Profiles read all authenticated"
  on public.profiles for select to authenticated using (true);

create policy "Profiles update own"
  on public.profiles for update to authenticated using (auth.uid() = id);

create policy "Playlists read own or public"
  on public.playlists for select to authenticated
  using (owner_id = auth.uid() or is_public = true);

create policy "Playlists crud own"
  on public.playlists for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Likes own"
  on public.likes for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Play events insert own"
  on public.play_events for insert to authenticated
  with check (user_id = auth.uid());

create policy "Devices own"
  on public.devices for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Offline cache own"
  on public.offline_cache_entries for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Handoff own"
  on public.handoff_sessions for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
