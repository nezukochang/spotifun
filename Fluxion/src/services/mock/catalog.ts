import type {Playlist, Track} from '../../types/models';

/** Morceaux démo — flux publics (SoundHelix) pour tests sans licence */
export const MOCK_TRACKS: Track[] = [
  {
    id: 't1',
    title: 'Precision Pulse',
    artistName: 'Fluxion Studio',
    albumTitle: 'Demo Sessions',
    durationMs: 348000,
    coverUrl: 'https://picsum.photos/seed/flux1/400/400',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 't2',
    title: 'Fluid Motion',
    artistName: 'Fluxion Studio',
    albumTitle: 'Demo Sessions',
    durationMs: 312000,
    coverUrl: 'https://picsum.photos/seed/flux2/400/400',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 't3',
    title: 'Robust Line',
    artistName: 'Apex Wave',
    albumTitle: 'Signal Theory',
    durationMs: 295000,
    coverUrl: 'https://picsum.photos/seed/flux3/400/400',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 't4',
    title: 'Cache Drift',
    artistName: 'Apex Wave',
    albumTitle: 'Signal Theory',
    durationMs: 280000,
    coverUrl: 'https://picsum.photos/seed/flux4/400/400',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 't5',
    title: 'Link Beam',
    artistName: 'Neon Grid',
    albumTitle: 'Handoff EP',
    durationMs: 265000,
    coverUrl: 'https://picsum.photos/seed/flux5/400/400',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: 't6',
    title: 'Sync Orbit',
    artistName: 'Neon Grid',
    albumTitle: 'Handoff EP',
    durationMs: 302000,
    coverUrl: 'https://picsum.photos/seed/flux6/400/400',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
];

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    title: 'Fluxion — Précision',
    description: 'Sélection fluide & précise',
    coverUrl: 'https://picsum.photos/seed/playlist1/400/400',
    trackIds: ['t1', 't2', 't3'],
  },
  {
    id: 'p2',
    title: 'Hors connexion',
    description: 'Idéal pour le cache offline',
    coverUrl: 'https://picsum.photos/seed/playlist2/400/400',
    trackIds: ['t4', 't5', 't6'],
  },
];

export function getMockTrackById(id: string): Track | undefined {
  return MOCK_TRACKS.find(t => t.id === id);
}
