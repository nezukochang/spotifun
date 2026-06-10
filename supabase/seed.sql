-- Données de démo Fluxion (à exécuter après 001_initial_schema.sql)
-- URLs = flux SoundHelix (tests uniquement)

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

-- RLS lecture catalogue pour anon + authenticated
create policy "Artists read all" on public.artists for select to anon, authenticated using (true);
create policy "Albums read all" on public.albums for select to anon, authenticated using (true);
