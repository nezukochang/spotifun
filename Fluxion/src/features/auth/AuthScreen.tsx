import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useAuthStore} from '../../stores/authStore';
import {colors, spacing} from '../../shared/theme/tokens';
import {commonStyles} from '../../shared/styles/commonStyles';
import {env} from '../../config/env';

export function AuthScreen() {
  const [email, setEmail] = useState('demo@fluxion.app');
  const [password, setPassword] = useState('demo1234');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {signIn, signUp, loading} = useAuthStore();

  const submit = async () => {
    setError(null);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.logo}>ƒ</Text>
        <Text style={styles.title}>Fluxion</Text>
        <Text style={styles.sub}>Fluidité · Robustesse · Précision</Text>
      </View>

      {env.useMockData && (
        <Text style={styles.hint}>
          Mode démo — connectez-vous avec n&apos;importe quel email / mot de passe
        </Text>
      )}

      <TextInput
        style={[commonStyles.input, styles.inputExtra]}
        placeholder="Email"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[commonStyles.input, styles.inputExtra]}
        placeholder="Mot de passe"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[commonStyles.primaryButton, styles.btnMargin, loading && commonStyles.primaryButtonDisabled]}
        onPress={submit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[commonStyles.primaryButtonText, styles.btnTextExtra]}>
            {isSignUp ? 'Créer un compte' : 'Se connecter'}
          </Text>
        )}
      </Pressable>

      <Pressable onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.switch}>
          {isSignUp
            ? 'Déjà un compte ? Se connecter'
            : 'Pas de compte ? S’inscrire'}
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.void,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {alignItems: 'center', marginBottom: spacing.xl},
  logo: {fontSize: 64, color: colors.accent, fontWeight: '200'},
  title: {fontSize: 32, color: colors.text, fontWeight: '700'},
  sub: {color: colors.textDim, marginTop: spacing.sm},
  hint: {
    color: colors.precision,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  inputExtra: {
    fontSize: 16,
  },
  btnMargin: {
    marginTop: spacing.sm,
  },
  btnTextExtra: {fontSize: 16},
  switch: {color: colors.accentGlow, textAlign: 'center', marginTop: spacing.md},
  error: {color: colors.warm, textAlign: 'center'},
});
