import TrackPlayer, {State, RepeatMode} from 'react-native-track-player';
import {
  setupPlayer,
  playTrack,
  playTracks,
  togglePlayPause,
  seekTo,
  skipNext,
  skipPrevious,
  setRepeatMode,
  getPlayerState,
  getProgress,
  getActiveTrackId,
  handoffPlay,
} from '../../../src/services/audio/playerService';
import type {Track} from '../../../src/types/models';

jest.mock('../../../src/services/offline/offlineCacheService', () => ({
  getPlaybackUri: jest.fn((track: Track) =>
    Promise.resolve({uri: track.streamUrl, fromCache: false}),
  ),
}));

const track: Track = {
  id: 't1',
  title: 'Test',
  artistName: 'Artist',
  artistId: 'a1',
  albumTitle: 'Album',
  durationMs: 180000,
  coverUrl: 'https://cover.jpg',
  streamUrl: 'https://stream.mp3',
  genre: 'pop',
  popularity: 50,
  views: 100,
  likes: 10,
  isRemix: false,
};

describe('setupPlayer', () => {
  it('calls TrackPlayer.setupPlayer on first call', async () => {
    await setupPlayer();
    expect(TrackPlayer.setupPlayer).toHaveBeenCalled();
    expect(TrackPlayer.updateOptions).toHaveBeenCalled();
  });
});

describe('playTrack', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resets, adds the track, and plays', async () => {
    await playTrack(track);
    expect(TrackPlayer.reset).toHaveBeenCalled();
    expect(TrackPlayer.add).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 't1',
        title: 'Test',
        artist: 'Artist',
        url: 'https://stream.mp3',
        duration: 180,
      }),
    ]);
    expect(TrackPlayer.play).toHaveBeenCalled();
  });
});

describe('playTracks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('adds multiple tracks and skips to startIndex', async () => {
    const tracks = [
      track,
      {...track, id: 't2', title: 'Test 2'},
    ];
    await playTracks(tracks, 1);
    expect(TrackPlayer.add).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({id: 't1'}),
        expect.objectContaining({id: 't2'}),
      ]),
    );
    expect(TrackPlayer.skip).toHaveBeenCalledWith(1);
    expect(TrackPlayer.play).toHaveBeenCalled();
  });

  it('does not skip when startIndex is 0', async () => {
    await playTracks([track], 0);
    expect(TrackPlayer.skip).not.toHaveBeenCalled();
  });
});

describe('togglePlayPause', () => {
  beforeEach(() => jest.clearAllMocks());

  it('pauses when currently playing', async () => {
    (TrackPlayer.getPlaybackState as jest.Mock).mockResolvedValue({
      state: State.Playing,
    });
    await togglePlayPause();
    expect(TrackPlayer.pause).toHaveBeenCalled();
  });

  it('plays when currently paused', async () => {
    (TrackPlayer.getPlaybackState as jest.Mock).mockResolvedValue({
      state: State.Paused,
    });
    await togglePlayPause();
    expect(TrackPlayer.play).toHaveBeenCalled();
  });
});

describe('seekTo', () => {
  it('delegates to TrackPlayer.seekTo', async () => {
    await seekTo(42);
    expect(TrackPlayer.seekTo).toHaveBeenCalledWith(42);
  });
});

describe('skipNext / skipPrevious', () => {
  it('delegates skipNext', async () => {
    await skipNext();
    expect(TrackPlayer.skipToNext).toHaveBeenCalled();
  });

  it('delegates skipPrevious', async () => {
    await skipPrevious();
    expect(TrackPlayer.skipToPrevious).toHaveBeenCalled();
  });
});

describe('setRepeatMode', () => {
  it('delegates to TrackPlayer.setRepeatMode', async () => {
    await setRepeatMode(RepeatMode.Off);
    expect(TrackPlayer.setRepeatMode).toHaveBeenCalledWith(RepeatMode.Off);
  });
});

describe('getPlayerState', () => {
  it('returns the playback state', async () => {
    const result = await getPlayerState();
    expect(result).toEqual({state: 'paused'});
  });
});

describe('getProgress', () => {
  it('returns progress', async () => {
    const result = await getProgress();
    expect(result).toEqual({position: 0, duration: 0});
  });
});

describe('getActiveTrackId', () => {
  it('returns track id when active', async () => {
    (TrackPlayer.getActiveTrack as jest.Mock).mockResolvedValue({id: 't1'});
    const result = await getActiveTrackId();
    expect(result).toBe('t1');
  });

  it('returns null when no active track', async () => {
    (TrackPlayer.getActiveTrack as jest.Mock).mockResolvedValue(undefined);
    const result = await getActiveTrackId();
    expect(result).toBeNull();
  });
});

describe('handoffPlay', () => {
  beforeEach(() => jest.clearAllMocks());

  it('plays the track and seeks to position in seconds', async () => {
    await handoffPlay(track, 5000);
    expect(TrackPlayer.seekTo).toHaveBeenCalledWith(5);
    expect(TrackPlayer.play).toHaveBeenCalled();
  });
});
