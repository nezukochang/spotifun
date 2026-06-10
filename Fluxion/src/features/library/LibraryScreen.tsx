import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {fetchPlaylists, fetchTracks} from '../../services/catalog/catalogService';
import {useAuthStore} from '../../stores/authStore';
import {usePlayTrack} from '../player/usePlayTrack';
import {useOfflineStore} from '../../stores/offlineStore';
import {MOCK_TRACKS} from '../../services/mock/catalog';
import {colors, spacing} from '../../shared/theme/tokens';
import type {Playlist, Track} from '../../types/models';

export function LibraryScreen() {
  const user = useAuthStore(s => s.user);
  const {play} = usePlayTrack();
  const cacheTrack = useOfflineStore(s => s.cacheTrack);
  const cachedIds = useOfflineStore(s => s.cachedIds);
  const refresh = useOfflineStore(s => s.refresh);

  const {data: playlists, isLoading} = useQuery({
    queryKey: ['playlists', user?.id],
    queryFn: () => fetchPlaylists(user!.id),
    enabled: !!user,
  });

  const playPlaylist = async (playlist: Playlist) => {
    const all = await fetchTracks();
    const tracks = playlist.trackIds
      .map(id => all.find(t => t.id === id))
      .filter((t): t is Track => !!t);
    if (tracks.length) {
      await play(tracks, 0);
    }
  };

  const cachePlaylist = async (playlist: Playlist) => {
    for (const id of playlist.trackIds) {
      const track = MOCK_TRACKS.find(t => t.id === id);
      if (track && !cachedIds.has(id)) {
        await cacheTrack(id, track);
      }
    }
    await refresh();
    Alert.alert('Cache', 'Playlist disponible hors connexion.');
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Bibliothèque</Text>
      <FlatList
        data={playlists ?? []}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Pressable onPress={() => playPlaylist(item)}>
              <Image source={{uri: item.coverUrl}} style={styles.cover} />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub}>{item.description}</Text>
            </Pressable>
            <Pressable
              style={styles.cacheBtn}
              onPress={() => cachePlaylist(item)}>
              <Text style={styles.cacheBtnText}>Disponible hors connexion</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.void},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    padding: spacing.lg,
  },
  list: {paddingHorizontal: spacing.lg, paddingBottom: 120, gap: spacing.lg},
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cover: {width: '100%', height: 140, borderRadius: 12, marginBottom: spacing.sm},
  title: {color: colors.text, fontSize: 18, fontWeight: '700'},
  sub: {color: colors.textDim, marginTop: 4},
  cacheBtn: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.elevated,
    borderRadius: 8,
    alignItems: 'center',
  },
  cacheBtnText: {color: colors.precision, fontWeight: '600'},
});
