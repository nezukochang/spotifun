import {findTrackIndexById, identifyRemixes} from '../../../src/services/catalog/remixLogic';
import type {Track} from '../../../src/types/models';

function makeTrack(overrides: Partial<Track> & {id: string}): Track {
  return {
    title: 'Test Track',
    artistName: 'Artist',
    artistId: 'a1',
    albumTitle: 'Album',
    durationMs: 200000,
    coverUrl: '',
    streamUrl: '',
    genre: 'pop',
    popularity: 50,
    views: 100,
    likes: 10,
    isRemix: false,
    ...overrides,
  };
}

describe('findTrackIndexById', () => {
  it('returns the index of an existing ID in a sorted array', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    expect(findTrackIndexById(ids, 'c')).toBe(2);
  });

  it('returns the index for the first element', () => {
    const ids = ['a', 'b', 'c'];
    expect(findTrackIndexById(ids, 'a')).toBe(0);
  });

  it('returns the index for the last element', () => {
    const ids = ['a', 'b', 'c'];
    expect(findTrackIndexById(ids, 'c')).toBe(2);
  });

  it('returns -1 when the ID is not found', () => {
    const ids = ['a', 'b', 'c'];
    expect(findTrackIndexById(ids, 'z')).toBe(-1);
  });

  it('returns -1 for an empty array', () => {
    expect(findTrackIndexById([], 'a')).toBe(-1);
  });

  it('works with a single-element array', () => {
    expect(findTrackIndexById(['x'], 'x')).toBe(0);
    expect(findTrackIndexById(['x'], 'y')).toBe(-1);
  });
});

describe('identifyRemixes', () => {
  it('returns empty map when there are no remix relationships', () => {
    const tracks = [
      makeTrack({id: '1', title: 'Song A', artistId: 'a1'}),
      makeTrack({id: '2', title: 'Song B', artistId: 'a2'}),
    ];
    const result = identifyRemixes(tracks);
    expect(result.size).toBe(0);
  });

  it('groups tracks linked by originalTrackId', () => {
    const tracks = [
      makeTrack({id: '1', title: 'Original Song', artistId: 'a1'}),
      makeTrack({
        id: '2',
        title: 'Remix Version',
        artistId: 'a2',
        isRemix: true,
        originalTrackId: '1',
      }),
    ];
    const result = identifyRemixes(tracks);
    // Both tracks form their own group since the second isn't yet a key when processed
    expect(result.size).toBe(2);
    expect(result.get('1')).toHaveLength(2);
    expect(result.get('2')).toHaveLength(2);
  });

  it('groups tracks with similar titles by the same artist', () => {
    const tracks = [
      makeTrack({id: '1', title: 'Sunset', artistId: 'a1'}),
      makeTrack({id: '2', title: 'Sunset Extended Mix', artistId: 'a1'}),
    ];
    const result = identifyRemixes(tracks);
    expect(result.size).toBe(2);
    const group = result.get('1')!;
    expect(group).toHaveLength(2);
    expect(group.map(t => t.id)).toContain('2');
  });

  it('does not group tracks with similar titles by different artists', () => {
    const tracks = [
      makeTrack({id: '1', title: 'Sunset', artistId: 'a1'}),
      makeTrack({id: '2', title: 'Sunset', artistId: 'a2'}),
    ];
    const result = identifyRemixes(tracks);
    expect(result.size).toBe(0);
  });

  it('handles reverse originalTrackId links', () => {
    const tracks = [
      makeTrack({id: '1', title: 'Track A', artistId: 'a1', originalTrackId: '2'}),
      makeTrack({id: '2', title: 'Track B', artistId: 'a2'}),
    ];
    const result = identifyRemixes(tracks);
    expect(result.size).toBe(2);
    expect(result.get('1')).toHaveLength(2);
    expect(result.get('2')).toHaveLength(2);
  });

  it('does not create a group for a single track with no matches', () => {
    const tracks = [makeTrack({id: '1', title: 'Unique', artistId: 'a1'})];
    const result = identifyRemixes(tracks);
    expect(result.size).toBe(0);
  });

  it('handles an empty track list', () => {
    const result = identifyRemixes([]);
    expect(result.size).toBe(0);
  });
});
