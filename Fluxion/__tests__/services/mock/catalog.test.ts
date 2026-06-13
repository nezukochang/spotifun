import {MOCK_TRACKS, MOCK_PLAYLISTS, getMockTrackById} from '../../../src/services/mock/catalog';

describe('mock catalog data', () => {
  it('MOCK_TRACKS is a non-empty array', () => {
    expect(Array.isArray(MOCK_TRACKS)).toBe(true);
    expect(MOCK_TRACKS.length).toBeGreaterThan(0);
  });

  it('each mock track has required fields', () => {
    for (const t of MOCK_TRACKS) {
      expect(t.id).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.artistName).toBeTruthy();
      expect(t.durationMs).toBeGreaterThan(0);
      expect(t.streamUrl).toBeTruthy();
    }
  });

  it('MOCK_PLAYLISTS is a non-empty array', () => {
    expect(Array.isArray(MOCK_PLAYLISTS)).toBe(true);
    expect(MOCK_PLAYLISTS.length).toBeGreaterThan(0);
  });

  it('each playlist references valid track IDs', () => {
    const trackIds = new Set(MOCK_TRACKS.map(t => t.id));
    for (const pl of MOCK_PLAYLISTS) {
      for (const tid of pl.trackIds) {
        expect(trackIds.has(tid)).toBe(true);
      }
    }
  });
});

describe('getMockTrackById', () => {
  it('returns the track when it exists', () => {
    const track = getMockTrackById('t1');
    expect(track).toBeDefined();
    expect(track!.id).toBe('t1');
  });

  it('returns undefined for a nonexistent ID', () => {
    expect(getMockTrackById('nonexistent')).toBeUndefined();
  });
});
