import {useCallback} from 'react';
import type {Track} from '../../types/models';
import * as playerService from '../../services/audio/playerService';
import {usePlayerStore} from '../../stores/playerStore';
import {isTrackCached} from '../../services/offline/offlineCacheService';

export function usePlayTrack() {
  const setQueue = usePlayerStore(s => s.setQueue);
  const setPlaybackMeta = usePlayerStore(s => s.setPlaybackMeta);

  const play = useCallback(
    async (tracks: Track[], startIndex = 0) => {
      setQueue(tracks, startIndex);
      const fromCache = await isTrackCached(tracks[startIndex].id);
      setPlaybackMeta({fromCache, isPlaying: true});
      await playerService.playTracks(tracks, startIndex);
    },
    [setQueue, setPlaybackMeta],
  );

  return {play};
}
