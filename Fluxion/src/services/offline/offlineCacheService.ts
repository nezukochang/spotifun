import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import type {Track} from '../../types/models';
import {env} from '../../config/env';

const INDEX_KEY = '@fluxion/offline_index';
const CACHE_DIR = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/fluxion-cache`;

type CacheEntry = {
  trackId: string;
  localPath: string;
  byteSize: number;
  cachedAt: number;
};

async function readIndex(): Promise<Record<string, CacheEntry>> {
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  return raw ? (JSON.parse(raw) as Record<string, CacheEntry>) : {};
}

async function writeIndex(index: Record<string, CacheEntry>): Promise<void> {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

async function ensureCacheDir(): Promise<void> {
  const exists = await ReactNativeBlobUtil.fs.isDir(CACHE_DIR);
  if (!exists) {
    await ReactNativeBlobUtil.fs.mkdir(CACHE_DIR);
  }
}

function totalBytes(index: Record<string, CacheEntry>): number {
  return Object.values(index).reduce((sum, e) => sum + e.byteSize, 0);
}

export async function getCachedTrackIds(): Promise<string[]> {
  const index = await readIndex();
  return Object.keys(index);
}

export async function isTrackCached(trackId: string): Promise<boolean> {
  const index = await readIndex();
  const entry = index[trackId];
  if (!entry) {
    return false;
  }
  return ReactNativeBlobUtil.fs.exists(entry.localPath);
}

export async function getPlaybackUri(
  track: Track,
): Promise<{uri: string; fromCache: boolean}> {
  const index = await readIndex();
  const entry = index[track.id];
  if (entry && (await ReactNativeBlobUtil.fs.exists(entry.localPath))) {
    return {uri: `file://${entry.localPath}`, fromCache: true};
  }
  return {uri: track.streamUrl, fromCache: false};
}

export async function cacheTrackForOffline(
  track: Track,
  onProgress?: (pct: number) => void,
): Promise<void> {
  await ensureCacheDir();
  const index = await readIndex();
  if (await isTrackCached(track.id)) {
    return;
  }

  const dest = `${CACHE_DIR}/${track.id}.cache`;
  const res = await ReactNativeBlobUtil.config({
    fileCache: true,
    path: dest,
  })
    .fetch('GET', track.streamUrl)
    .progress((received: string, total: string) => {
      const r = Number(received);
      const t = Number(total);
      if (t > 0 && onProgress) {
        onProgress(Math.round((r / t) * 100));
      }
    });

  const stat = await ReactNativeBlobUtil.fs.stat(res.path());
  const newSize = totalBytes(index) + stat.size;

  if (newSize > env.offlineCacheMaxBytes) {
    await ReactNativeBlobUtil.fs.unlink(res.path());
    throw new Error('Quota de cache hors ligne atteint.');
  }

  index[track.id] = {
    trackId: track.id,
    localPath: res.path(),
    byteSize: stat.size,
    cachedAt: Date.now(),
  };
  await writeIndex(index);
}

export async function removeCachedTrack(trackId: string): Promise<void> {
  const index = await readIndex();
  const entry = index[trackId];
  if (entry) {
    if (await ReactNativeBlobUtil.fs.exists(entry.localPath)) {
      await ReactNativeBlobUtil.fs.unlink(entry.localPath);
    }
    delete index[trackId];
    await writeIndex(index);
  }
}

export async function clearOfflineCache(): Promise<void> {
  const index = await readIndex();
  for (const entry of Object.values(index)) {
    if (await ReactNativeBlobUtil.fs.exists(entry.localPath)) {
      await ReactNativeBlobUtil.fs.unlink(entry.localPath);
    }
  }
  await writeIndex({});
}
