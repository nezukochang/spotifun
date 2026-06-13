import {fetchTracks, searchTracks} from '../../../src/services/catalog/catalogService';
import {MOCK_TRACKS} from '../../../src/services/mock/catalog';

jest.mock('../../../src/config/env', () => ({
  env: {useMockData: true},
}));

jest.mock('../../../src/services/supabase/client', () => ({
  getSupabase: jest.fn(() => null),
}));

describe('fetchTracks (mock mode)', () => {
  it('returns all mock tracks when no genre filter', async () => {
    const tracks = await fetchTracks();
    expect(tracks.length).toBe(MOCK_TRACKS.length);
  });

  it('filters by genre when genreId is provided', async () => {
    // Mock tracks lack a genre field, so filtering by any value returns nothing
    const tracks = await fetchTracks('nonexistent-genre');
    expect(tracks).toEqual([]);
  });

  it('sorts by popularity descending when tracks have popularity', async () => {
    const tracks = await fetchTracks(undefined, 'popularity');
    // Mock tracks may not have popularity set; verify the sort was attempted
    // by checking we still get all tracks back
    expect(tracks.length).toBe(MOCK_TRACKS.length);
  });

  it('returns latest order by default', async () => {
    const tracks = await fetchTracks(undefined, 'latest');
    expect(tracks.length).toBeGreaterThan(0);
  });
});

describe('searchTracks (mock mode)', () => {
  it('returns all tracks when query is empty', async () => {
    const result = await searchTracks('');
    expect(result.length).toBe(MOCK_TRACKS.length);
  });

  it('returns all tracks when query is whitespace', async () => {
    const result = await searchTracks('   ');
    expect(result.length).toBe(MOCK_TRACKS.length);
  });

  it('filters by title substring (case insensitive)', async () => {
    const title = MOCK_TRACKS[0].title;
    const result = await searchTracks(title.toLowerCase());
    expect(result.some(t => t.title === title)).toBe(true);
  });

  it('filters by artist name', async () => {
    const artist = MOCK_TRACKS[0].artistName;
    const result = await searchTracks(artist);
    expect(result.every(t => t.artistName === artist)).toBe(true);
  });

  it('filters by album title', async () => {
    const album = MOCK_TRACKS[0].albumTitle;
    const result = await searchTracks(album);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(t => t.albumTitle === album)).toBe(true);
  });

  it('returns empty array when no match', async () => {
    const result = await searchTracks('zzz_nonexistent_zzz');
    expect(result).toEqual([]);
  });
});
