import React, {useCallback, useState} from 'react';
import {LayoutChangeEvent, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme/tokens';

type Props = {
  positionSec: number;
  durationSec: number;
  onSeek: (sec: number) => void;
};

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PlayerScrubber({positionSec, durationSec, onSeek}: Props) {
  const [width, setWidth] = useState(1);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const ratio = durationSec > 0 ? Math.min(positionSec / durationSec, 1) : 0;

  const seekAt = (x: number) => {
    const r = Math.max(0, Math.min(x / width, 1));
    onSeek(r * durationSec);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.bar}
        onLayout={onLayout}
        onPress={e => seekAt(e.nativeEvent.locationX)}>
        <View style={[styles.fill, {width: `${ratio * 100}%`}]} />
        <View style={[styles.thumb, {left: ratio * width - 8}]} />
      </Pressable>
      <View style={styles.labels}>
        <Text style={styles.time}>{fmt(positionSec)}</Text>
        <Text style={styles.time}>{fmt(durationSec)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: 20},
  bar: {
    height: 4,
    backgroundColor: colors.elevated,
    borderRadius: 2,
    overflow: 'visible',
  },
  fill: {
    height: 4,
    backgroundColor: colors.precision,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.precision,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  time: {
    color: colors.muted,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
