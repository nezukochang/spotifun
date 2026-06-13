import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {colors} from '../theme/tokens';

type Props = {
  size?: 'small' | 'large';
};

export function LoadingScreen({size = 'large'}: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.void,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
