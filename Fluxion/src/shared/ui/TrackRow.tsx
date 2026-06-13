import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {Track} from '../../types/models';
import {colors, spacing} from '../theme/tokens';
import {formatMs} from '../utils/formatTime';

type Props = {
  track: Track;
  index?: number;
  isCached?: boolean;
  isCaching?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

export function TrackRow({
  track,
  index,
  isCached,
  isCaching,
  onPress,
  onLongPress,
}: Props) {
  return (
    <Pressable
      style={({pressed}) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
      onLongPress={onLongPress}>
      {index != null && <Text style={styles.index}>{index}</Text>}
      <Image source={{uri: track.coverUrl}} style={styles.cover} />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {track.artistName} · {track.albumTitle}
        </Text>
      </View>
      {isCaching ? (
        <ActivityIndicator color={colors.precision} size="small" />
      ) : (
        <View style={styles.right}>
          {isCached && <Text style={styles.badge}>Cache</Text>}
          <Text style={styles.duration}>{formatMs(track.durationMs)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  pressed: {opacity: 0.7},
  index: {width: 24, color: colors.muted, fontVariant: ['tabular-nums']},
  cover: {width: 48, height: 48, borderRadius: 8, backgroundColor: colors.elevated},
  meta: {flex: 1},
  title: {color: colors.text, fontSize: 16, fontWeight: '600'},
  sub: {color: colors.textDim, fontSize: 13, marginTop: 2},
  right: {alignItems: 'flex-end', gap: 4},
  badge: {
    color: colors.precision,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  duration: {color: colors.muted, fontSize: 12, fontVariant: ['tabular-nums']},
});
