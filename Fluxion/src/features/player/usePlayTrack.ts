import {useCallback, useState} from 'react';
import type {Track} from '../../types/models';
import * as playerService from '../../services/audio/playerService';
import {usePlayerStore} from '../../stores/playerStore';
import {isTrackCached} from '../../services/offline/offlineCacheService';

export function usePlayTrack() {
  const setQueue = usePlayerStore(s => s.setQueue);
  const setPlaybackMeta = usePlayerStore(s => s.setPlaybackMeta);
  const [error, setError] = useState<string | null>(null);

  const play = useCallback(
    async (tracks: Track[], startIndex = 0) => {
      setError(null);
      try {
        setQueue(tracks, startIndex);
        const fromCache = await isTrackCached(tracks[startIndex].id);
        setPlaybackMeta({fromCache, isPlaying: true});
        await playerService.playTracks(tracks, startIndex);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Échec de la lecture';
        console.error('[Player] Playback failed:', e);
        setPlaybackMeta({isPlaying: false});
        setError(message);
        throw e;
      }
    },
    [setQueue, setPlaybackMeta],
  );

  return {play, playError: error};
}
