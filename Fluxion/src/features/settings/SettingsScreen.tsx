import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { clearOfflineCache } from '../../services/offline/offlineCacheService';
import { useOfflineStore } from '../../stores/offlineStore';
import { colors, spacing } from '../../shared/theme/tokens';

export function SettingsScreen() {
  const { user, signOut, setUser } = useAuthStore();
  const refresh = useOfflineStore(s => s.refresh);
  const [language, setLanguage] = React.useState('Français');
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [volume, _setVolume] = React.useState(80);

  const clearCache = () => {
    Alert.alert('Vider le cache', 'Supprimer tous les morceaux en cache ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Vider',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearOfflineCache();
            await refresh();
            Alert.alert('OK', 'Cache vidé.');
          } catch (e) {
            console.error('[Settings] Failed to clear cache:', e);
            Alert.alert('Erreur', e instanceof Error ? e.message : 'Impossible de vider le cache.');
          }
        },
      },
    ]);
  };

  const togglePremium = () => {
    if (user) {
      setUser({ ...user, isPremium: !user.isPremium });
      Alert.alert('Spotifun Premium', user.isPremium ? 'Retour à la version standard.' : 'Félicitations ! Vous êtes Premium.');
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Réglages</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profil</Text>
        <Text style={styles.row}>Compte : {user?.displayName}</Text>
        <Text style={styles.row}>Statut : {user?.isPremium ? '🌟 Premium' : 'Standard'}</Text>
        <Pressable style={styles.premiumBtn} onPress={togglePremium}>
          <Text style={styles.premiumBtnText}>{user?.isPremium ? 'Gérer mon abonnement' : 'Passer à Premium'}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <Pressable style={styles.optionRow} onPress={() => setLanguage(language === 'Français' ? 'English' : 'Français')}>
          <Text style={styles.optionLabel}>Langue</Text>
          <Text style={styles.optionValue}>{language}</Text>
        </Pressable>
        <Pressable style={styles.optionRow} onPress={() => setIsDarkMode(!isDarkMode)}>
          <Text style={styles.optionLabel}>Thème</Text>
          <Text style={styles.optionValue}>{isDarkMode ? 'Sombre' : 'Clair'}</Text>
        </Pressable>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Volume</Text>
          <Text style={styles.optionValue}>{volume}%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stockage</Text>
        <Pressable style={styles.btn} onPress={clearCache}>
          <Text style={styles.btnText}>Vider le cache hors ligne</Text>
        </Pressable>
      </View>

      <Pressable style={[styles.btn, styles.btnDanger]} onPress={signOut}>
        <Text style={styles.btnText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.void, padding: spacing.lg },
  heading: { color: colors.text, fontSize: 32, fontWeight: '800', marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionTitle: { color: colors.accent, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: spacing.md },
  row: { color: colors.text, fontSize: 16, marginBottom: spacing.xs },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.elevated,
  },
  optionLabel: { color: colors.text, fontSize: 16 },
  optionValue: { color: colors.textDim, fontSize: 14 },
  premiumBtn: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  premiumBtnText: { color: colors.void, fontWeight: '700' },
  btn: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnDanger: { backgroundColor: colors.elevated, marginTop: spacing.xl },
  btnText: { color: colors.text, fontWeight: '600' },
});

