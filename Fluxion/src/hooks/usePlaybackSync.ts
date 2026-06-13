import { useEffect } from 'react';
import TrackPlayer, { Event, State, useProgress } from 'react-native-track-player';
import { usePlayerStore } from '../stores/playerStore';
import { isTrackCached } from '../services/offline/offlineCacheService';

export function usePlaybackSync() {
  const progress = useProgress(500);
  const setPlaybackMeta = usePlayerStore(s => s.setPlaybackMeta);

  useEffect(() => {
    setPlaybackMeta({
      positionSec: progress.position,
      durationSec: progress.duration,
    });
  }, [progress.position, progress.duration, setPlaybackMeta]);

  useEffect(() => {
    const sub = TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
      setPlaybackMeta({
        isPlaying: state === State.Playing || state === State.Buffering,
      });
      try {
        const track = await TrackPlayer.getActiveTrack();
        if (track?.id) {
          setPlaybackMeta({ fromCache: await isTrackCached(track.id) });
        }
      } catch (e) {
        console.warn('[PlaybackSync] Failed to read active track:', e);
      }
    });
    return () => sub.remove();
  }, [setPlaybackMeta]);

}
