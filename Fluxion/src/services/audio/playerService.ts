import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
  State,
} from 'react-native-track-player';
import type {Track} from '../../types/models';
import {getPlaybackUri} from '../offline/offlineCacheService';

let initialized = false;

export async function setupPlayer(): Promise<void> {
  if (initialized) {
    return;
  }
  await TrackPlayer.setupPlayer({
    autoHandleInterruptions: true,
  });
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior:
        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
    ],
    progressUpdateEventInterval: 1,
  });
  initialized = true;
}

function toPlayerTrack(track: Track, url: string) {
  return {
    id: track.id,
    url,
    title: track.title,
    artist: track.artistName,
    album: track.albumTitle,
    artwork: track.coverUrl,
    duration: track.durationMs / 1000,
  };
}

export async function playTracks(
  tracks: Track[],
  startIndex = 0,
): Promise<void> {
  await setupPlayer();
  await TrackPlayer.reset();

  const queue = await Promise.all(
    tracks.map(async t => {
      const {uri} = await getPlaybackUri(t);
      return toPlayerTrack(t, uri);
    }),
  );

  await TrackPlayer.add(queue);
  if (startIndex > 0) {
    await TrackPlayer.skip(startIndex);
  }
  await TrackPlayer.play();
}

export async function playTrack(track: Track): Promise<void> {
  await playTracks([track], 0);
}

export async function togglePlayPause(): Promise<void> {
  const state = await TrackPlayer.getPlaybackState();
  if (state.state === State.Playing) {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
}

export async function seekTo(seconds: number): Promise<void> {
  await TrackPlayer.seekTo(seconds);
}

export async function skipNext(): Promise<void> {
  await TrackPlayer.skipToNext();
}

export async function skipPrevious(): Promise<void> {
  await TrackPlayer.skipToPrevious();
}

export async function setRepeatMode(mode: RepeatMode): Promise<void> {
  await TrackPlayer.setRepeatMode(mode);
}

export async function getPlayerState() {
  return TrackPlayer.getPlaybackState();
}

export async function getProgress() {
  return TrackPlayer.getProgress();
}

export async function getActiveTrackId(): Promise<string | null> {
  const track = await TrackPlayer.getActiveTrack();
  return track?.id ?? null;
}

export async function handoffPlay(
  track: Track,
  positionMs: number,
): Promise<void> {
  await playTrack(track);
  await TrackPlayer.seekTo(positionMs / 1000);
  await TrackPlayer.play();
}
