import {usePlayerStore} from '../../src/stores/playerStore';
import type {Track} from '../../src/types/models';

const track: Track = {
  id: 't1',
  title: 'Test',
  artistName: 'Artist',
  artistId: 'a1',
  albumTitle: 'Album',
  durationMs: 180000,
  coverUrl: '',
  streamUrl: '',
  genre: 'pop',
  popularity: 50,
  views: 100,
  likes: 10,
  isRemix: false,
};

describe('playerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      queue: [],
      currentIndex: 0,
      isPlaying: false,
      positionSec: 0,
      durationSec: 0,
      fromCache: false,
    });
  });

  it('initializes with empty queue and default values', () => {
    const state = usePlayerStore.getState();
    expect(state.queue).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.isPlaying).toBe(false);
    expect(state.positionSec).toBe(0);
    expect(state.durationSec).toBe(0);
    expect(state.fromCache).toBe(false);
  });

  it('setQueue sets queue and resets positionSec', () => {
    usePlayerStore.getState().setPlaybackMeta({positionSec: 42});
    usePlayerStore.getState().setQueue([track], 0);
    const state = usePlayerStore.getState();
    expect(state.queue).toHaveLength(1);
    expect(state.currentIndex).toBe(0);
    expect(state.positionSec).toBe(0);
  });

  it('setQueue with custom index', () => {
    const tracks = [track, {...track, id: 't2'}];
    usePlayerStore.getState().setQueue(tracks, 1);
    expect(usePlayerStore.getState().currentIndex).toBe(1);
  });

  it('setPlaybackMeta updates partial state', () => {
    usePlayerStore.getState().setPlaybackMeta({isPlaying: true, durationSec: 180});
    const state = usePlayerStore.getState();
    expect(state.isPlaying).toBe(true);
    expect(state.durationSec).toBe(180);
    expect(state.positionSec).toBe(0);
  });

  it('currentTrack returns the track at currentIndex', () => {
    const tracks = [track, {...track, id: 't2', title: 'Second'}];
    usePlayerStore.getState().setQueue(tracks, 1);
    expect(usePlayerStore.getState().currentTrack()?.id).toBe('t2');
  });

  it('currentTrack returns null when queue is empty', () => {
    expect(usePlayerStore.getState().currentTrack()).toBeNull();
  });
});
