import type { Playlist, Track, Comment } from '../../types/models';

import { env } from '../../config/env';
import { getSupabase } from '../supabase/client';
import { MOCK_PLAYLISTS, MOCK_TRACKS } from '../mock/catalog';

interface SupabaseRow {
  id: string;
  title: string;
  duration_ms: number;
  artist_id: string;
  stream_storage_key: string;
  popularity?: number;
  views?: number;
  likes?: number;
  is_remix?: boolean;
  original_track_id?: string;
  artists?: { name: string };
  genres?: { name: string };
  albumTitle?: string;
  coverUrl?: string;
}

export async function fetchTracks(genreId?: string, sortBy: 'popularity' | 'latest' = 'latest'): Promise<Track[]> {
  if (env.useMockData) {
    let list = [...MOCK_TRACKS];
    if (genreId) list = list.filter(t => t.genre === genreId);
    if (sortBy === 'popularity') list.sort((a, b) => b.popularity - a.popularity);
    return list;
  }
  const supabase = getSupabase()!;
  let query = supabase.from('tracks').select(`
    *,
    artists ( name ),
    genres ( name )
  `);

  if (genreId) {
    query = query.eq('genre_id', genreId);
  }

  if (sortBy === 'popularity') {
    query = query.order('popularity', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: SupabaseRow) => ({
    id: row.id,
    title: row.title,
    durationMs: row.duration_ms,
    artistName: row.artists?.name ?? 'Unknown',
    artistId: row.artist_id,
    albumTitle: row.albumTitle ?? 'Album',
    coverUrl: row.coverUrl ?? '',
    streamUrl: row.stream_storage_key,
    genre: row.genres?.name ?? 'Unknown',
    popularity: row.popularity ?? 0,
    views: row.views ?? 0,
    likes: row.likes ?? 0,
    isRemix: row.is_remix ?? false,
    originalTrackId: row.original_track_id,
  }));
}


export async function fetchComments(trackId: string, page: number = 0): Promise<Comment[]> {
  const PAGE_SIZE = 20;

  if (env.useMockData) {
    return []; // Mock comments if needed
  }

  const supabase = getSupabase()!;


  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('track_id', trackId)
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (error) throw error;
  return data ?? [];
}


export async function searchTracks(query: string): Promise<Track[]> {
  const all = await fetchTracks();
  const q = query.trim().toLowerCase();
  if (!q) {
    return all;
  }
  return all.filter(
    t =>
      t.title.toLowerCase().includes(q) ||
      t.artistName.toLowerCase().includes(q) ||
      t.albumTitle.toLowerCase().includes(q),
  );
}
