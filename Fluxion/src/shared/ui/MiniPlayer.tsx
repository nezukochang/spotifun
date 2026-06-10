import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {colors, spacing} from '../theme/tokens';

type Props = {
  title: string;
  artist: string;
  artwork: string;
  isPlaying: boolean;
  fromCache: boolean;
  onPress: () => void;
  onPlayPause: () => void;
};

export function MiniPlayer({
  title,
  artist,
  artwork,
  isPlaying,
  fromCache,
  onPress,
  onPlayPause,
}: Props) {
  const scale = useSharedValue(1);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image source={{uri: artwork}} style={styles.cover} />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artist}
          {fromCache ? ' · Cache' : ''}
        </Text>
      </View>
      <Animated.View style={btnStyle}>
        <Pressable
          onPress={e => {
            e.stopPropagation?.();
            scale.value = withSpring(0.92, {damping: 14}, () => {
              scale.value = withSpring(1);
            });
            onPlayPause();
          }}
          style={styles.playBtn}
          hitSlop={12}>
          <Text style={styles.playIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.elevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  cover: {width: 48, height: 48, borderRadius: 8},
  meta: {flex: 1},
  title: {color: colors.text, fontWeight: '600', fontSize: 15},
  artist: {color: colors.textDim, fontSize: 13},
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {color: '#fff', fontSize: 16, fontWeight: '700'},
});
