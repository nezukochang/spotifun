import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {searchTracks} from '../../services/catalog/catalogService';
import {TrackRow} from '../../shared/ui/TrackRow';
import {usePlayTrack} from '../player/usePlayTrack';
import {colors, spacing} from '../../shared/theme/tokens';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const {play} = usePlayTrack();

  const {data, isFetching} = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchTracks(query),
    enabled: query.length >= 0,
  });

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Rechercher</Text>
      <TextInput
        style={styles.input}
        placeholder="Morceau, artiste, album…"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
      />
      {isFetching && (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      )}
      <FlatList
        data={data ?? []}
        keyExtractor={t => t.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun résultat</Text>
        }
        renderItem={({item, index}) => (
          <TrackRow
            track={item}
            onPress={() => play(data ?? [], index)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.void},
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  input: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  loader: {marginVertical: spacing.sm},
  empty: {color: colors.muted, textAlign: 'center', marginTop: 40},
  list: {paddingBottom: 120},
});
