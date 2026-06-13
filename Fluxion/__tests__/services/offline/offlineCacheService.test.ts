import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {
  getCachedTrackIds,
  isTrackCached,
  getPlaybackUri,
  removeCachedTrack,
  clearOfflineCache,
} from '../../../src/services/offline/offlineCacheService';
import type {Track} from '../../../src/types/models';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('../../../src/config/env', () => ({
  env: {offlineCacheMaxBytes: 512 * 1024 * 1024},
}));

const mockAS = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockFS = ReactNativeBlobUtil.fs as jest.Mocked<typeof ReactNativeBlobUtil.fs>;

const track: Track = {
  id: 't1',
  title: 'Test',
  artistName: 'Artist',
  artistId: 'a1',
  albumTitle: 'Album',
  durationMs: 180000,
  coverUrl: '',
  streamUrl: 'https://stream.mp3',
  genre: 'pop',
  popularity: 50,
  views: 100,
  likes: 10,
  isRemix: false,
};

describe('offlineCacheService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getCachedTrackIds', () => {
    it('returns keys from the stored index', async () => {
      const index = {t1: {trackId: 't1', localPath: '/p', byteSize: 100, cachedAt: 1}};
      (mockAS.getItem as jest.Mock).mockResolvedValue(JSON.stringify(index));
      const ids = await getCachedTrackIds();
      expect(ids).toEqual(['t1']);
    });

    it('returns empty array when index is empty', async () => {
      (mockAS.getItem as jest.Mock).mockResolvedValue(null);
      const ids = await getCachedTrackIds();
      expect(ids).toEqual([]);
    });
  });

  describe('isTrackCached', () => {
    it('returns true when entry exists and file is on disk', async () => {
      const index = {t1: {trackId: 't1', localPath: '/p/t1.cache', byteSize: 100, cachedAt: 1}};
      (mockAS.getItem as jest.Mock).mockResolvedValue(JSON.stringify(index));
      (mockFS.exists as jest.Mock).mockResolvedValue(true);
      expect(await isTrackCached('t1')).toBe(true);
    });

    it('returns false when entry does not exist', async () => {
      (mockAS.getItem as jest.Mock).mockResolvedValue(JSON.stringify({}));
      expect(await isTrackCached('t1')).toBe(false);
    });
  });

  describe('getPlaybackUri', () => {
    it('returns local file URI when cached', async () => {
      const index = {t1: {trackId: 't1', localPath: '/p/t1.cache', byteSize: 100, cachedAt: 1}};
      (mockAS.getItem as jest.Mock).mockResolvedValue(JSON.stringify(index));
      (mockFS.exists as jest.Mock).mockResolvedValue(true);
      const result = await getPlaybackUri(track);
      expect(result.uri).toBe('file:///p/t1.cache');
      expect(result.fromCache).toBe(true);
    });

    it('returns stream URL when not cached', async () => {
      (mockAS.getItem as jest.Mock).mockResolvedValue(JSON.stringify({}));
      const result = await getPlaybackUri(track);
      expect(result.uri).toBe('https://stream.mp3');
      expect(result.fromCache).toBe(false);
    });
  });

  describe('removeCachedTrack', () => {
    it('removes the file and updates the index', async () => {
      const index = {t1: {trackId: 't1', localPath: '/p/t1.cache', byteSize: 100, cachedAt: 1}};
      (mockAS.getItem as jest.Mock).mockResolvedValue(JSON.stringify(index));
      (mockFS.exists as jest.Mock).mockResolvedValue(true);

      await removeCachedTrack('t1');
      expect(mockFS.unlink).toHaveBeenCalledWith('/p/t1.cache');
      expect(mockAS.setItem).toHaveBeenCalledWith(
        '@fluxion/offline_index',
        JSON.stringify({}),
      );
    });

    it('does nothing when track is not in index', async () => {
      (mockAS.getItem as jest.Mock).mockResolvedValue(JSON.stringify({}));
      await removeCachedTrack('unknown');
      expect(mockFS.unlink).not.toHaveBeenCalled();
    });
  });

  describe('clearOfflineCache', () => {
    it('removes all files and clears the index', async () => {
      const index = {
        t1: {trackId: 't1', localPath: '/p/t1.cache', byteSize: 100, cachedAt: 1},
        t2: {trackId: 't2', localPath: '/p/t2.cache', byteSize: 200, cachedAt: 2},
      };
      (mockAS.getItem as jest.Mock).mockResolvedValue(JSON.stringify(index));
      (mockFS.exists as jest.Mock).mockResolvedValue(true);

      await clearOfflineCache();
      expect(mockFS.unlink).toHaveBeenCalledTimes(2);
      expect(mockAS.setItem).toHaveBeenCalledWith(
        '@fluxion/offline_index',
        JSON.stringify({}),
      );
    });
  });
});
