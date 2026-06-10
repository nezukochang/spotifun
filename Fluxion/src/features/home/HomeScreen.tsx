import { ScrollView, Pressable } from 'react-native';

const GENRES = ['Tous', 'Afrobeat', 'Amapiano', 'Makossa', 'Highlife', 'Afrotrap'];

export function HomeScreen() {
  const [selectedGenre, setSelectedGenre] = React.useState('Tous');
  const [sortBy, setSortBy] = React.useState<'latest' | 'popularity'>('latest');

  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks', selectedGenre, sortBy],
    queryFn: () => fetchTracks(selectedGenre === 'Tous' ? undefined : selectedGenre, sortBy),
  });

  const { play } = usePlayTrack();
  const cachedIds = useOfflineStore(s => s.cachedIds);
  const cachingId = useOfflineStore(s => s.cachingId);
  const cacheTrack = useOfflineStore(s => s.cacheTrack);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Spotifun afroPUNK</Text>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreList}>
          {GENRES.map(g => (
            <Pressable
              key={g}
              onPress={() => setSelectedGenre(g)}
              style={[styles.genreChip, selectedGenre === g && styles.genreChipActive]}>
              <Text style={[styles.genreText, selectedGenre === g && styles.genreTextActive]}>{g}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sortRow}>
          <Pressable onPress={() => setSortBy('latest')}>
            <Text style={[styles.sortText, sortBy === 'latest' && styles.sortActive]}>Nouveautés</Text>
          </Pressable>
          <Pressable onPress={() => setSortBy('popularity')}>
            <Text style={[styles.sortText, sortBy === 'popularity' && styles.sortActive]}>Populaires</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={tracks ?? []}
        keyExtractor={t => t.id}
        renderItem={({ item, index }) => (
          <TrackRow
            track={item}
            index={index + 1}
            isCached={cachedIds.has(item.id)}
            isCaching={cachingId === item.id}
            onPress={() => play(tracks ?? [], index)}
            onLongPress={() => {
              if (cachedIds.has(item.id)) {
                Alert.alert('Cache', 'Disponible hors connexion.');
                return;
              }
              cacheTrack(item.id, item).catch(e =>
                Alert.alert('Erreur', e instanceof Error ? e.message : 'Échec'),
              );
            }}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.void },
  center: { flex: 1, backgroundColor: colors.void, alignItems: 'center', justifyContent: 'center' },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    letterSpacing: -0.5,
  },
  filterSection: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  genreList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  genreChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.elevated,
  },
  genreChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  genreText: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  genreTextActive: { color: colors.void },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  sortText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  sortActive: { color: colors.precision },
  list: { paddingBottom: 120, paddingTop: spacing.sm },
});

