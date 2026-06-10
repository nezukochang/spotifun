import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from '../theme/tokens';

export function OfflineBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Mode hors ligne — lecture depuis le cache</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.elevated,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.precision + '44',
  },
  text: {color: colors.precision, fontSize: 13, textAlign: 'center'},
});
