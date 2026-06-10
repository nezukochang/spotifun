import {create} from 'zustand';
import type {Track} from '../types/models';

type PlayerState = {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  fromCache: boolean;
  setQueue: (tracks: Track[], index?: number) => void;
  setPlaybackMeta: (meta: {
    isPlaying?: boolean;
    positionSec?: number;
    durationSec?: number;
    fromCache?: boolean;
  }) => void;
  currentTrack: () => Track | null;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  positionSec: 0,
  durationSec: 0,
  fromCache: false,

  setQueue: (tracks, index = 0) =>
    set({queue: tracks, currentIndex: index, positionSec: 0}),

  setPlaybackMeta: meta => set(meta),

  currentTrack: () => {
    const {queue, currentIndex} = get();
    return queue[currentIndex] ?? null;
  },
}));
