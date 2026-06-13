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
import {commonStyles} from '../../shared/styles/commonStyles';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const {play} = usePlayTrack();

  const {data, isFetching} = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchTracks(query),
    enabled: query.length >= 0,
  });

  return (
    <View style={commonStyles.screenRoot}>
      <Text style={[commonStyles.heading, styles.headingExtra]}>Rechercher</Text>
      <TextInput
        style={[commonStyles.input, styles.inputExtra]}
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
        contentContainerStyle={commonStyles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headingExtra: {
    paddingBottom: spacing.sm,
  },
  inputExtra: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  loader: {marginVertical: spacing.sm},
  empty: {color: colors.muted, textAlign: 'center', marginTop: 40},

});
