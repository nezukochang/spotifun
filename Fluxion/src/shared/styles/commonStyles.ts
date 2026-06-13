import {StyleSheet} from 'react-native';
import {colors, spacing} from '../theme/tokens';

export const commonStyles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: colors.void,
  },
  screenRootPadded: {
    flex: 1,
    backgroundColor: colors.void,
    padding: spacing.lg,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    padding: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 120,
  },
});
