import TrackPlayer, { Event } from 'react-native-track-player';

export async function PlaybackService(): Promise<void> {
  try {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
    TrackPlayer.addEventListener(Event.RemotePrevious, () =>
      TrackPlayer.skipToPrevious(),
    );
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());
  } catch (e) {
    console.error('PlaybackService error:', e);
  }
}

