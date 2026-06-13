import {Alert} from 'react-native';

/**
 * Show an Alert.alert for a caught error with a sensible fallback message.
 */
export function alertError(
  error: unknown,
  fallback = 'Erreur inconnue',
): void {
  Alert.alert('Erreur', error instanceof Error ? error.message : fallback);
}
