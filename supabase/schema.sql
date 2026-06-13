-- Supabase Schema for Spotifun afroPUNK

-- Artists Table
CREATE TABLE IF NOT EXISTS public.artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Genres Table
CREATE TABLE IF NOT EXISTS public.genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- Tracks Table
CREATE TABLE IF NOT EXISTS public.tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist_id uuid REFERENCES public.artists(id),
  album_id uuid, -- Simplified, normally would have an albums table
  genre_id uuid REFERENCES public.genres(id),
  duration_ms integer NOT NULL,
  stream_storage_key text NOT NULL, -- Path in Supabase Storage
  popularity integer DEFAULT 0,
  is_remix boolean DEFAULT false,
  original_track_id uuid REFERENCES public.tracks(id),
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Playlists Table
CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  cover_url text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Playlist Tracks (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id uuid REFERENCES public.tracks(id) ON DELETE CASCADE,
  PRIMARY KEY (playlist_id, track_id)
);

-- Views Counter Routine (Trigger or Function)
-- Restricted to authenticated users only; uses SECURITY INVOKER so RLS applies.
CREATE OR REPLACE FUNCTION increment_track_views(t_id uuid)
RETURNS void AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  UPDATE public.tracks
  SET views = views + 1
  WHERE id = t_id;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
