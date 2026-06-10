import {create} from 'zustand';
import * as offlineCache from '../services/offline/offlineCacheService';

type OfflineState = {
  cachedIds: Set<string>;
  cachingId: string | null;
  cacheProgress: number;
  refresh: () => Promise<void>;
  cacheTrack: (trackId: string, track: import('../types/models').Track) => Promise<void>;
  removeTrack: (trackId: string) => Promise<void>;
};

export const useOfflineStore = create<OfflineState>((set, get) => ({
  cachedIds: new Set(),
  cachingId: null,
  cacheProgress: 0,

  refresh: async () => {
    const ids = await offlineCache.getCachedTrackIds();
    set({cachedIds: new Set(ids)});
  },

  cacheTrack: async (trackId, track) => {
    set({cachingId: trackId, cacheProgress: 0});
    try {
      await offlineCache.cacheTrackForOffline(track, pct =>
        set({cacheProgress: pct}),
      );
      await get().refresh();
    } finally {
      set({cachingId: null, cacheProgress: 0});
    }
  },

  removeTrack: async trackId => {
    await offlineCache.removeCachedTrack(trackId);
    await get().refresh();
  },
}));
