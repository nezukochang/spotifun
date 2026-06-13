import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {alertError} from '../../shared/utils/alertError';
import {commonStyles} from '../../shared/styles/commonStyles';
import {usePlayerStore} from '../../stores/playerStore';
import {sendHandoff, applyHandoff} from '../../services/bluetooth/bleHandoffService';
import {acceptHandoffCode} from '../../services/bluetooth/handoffCodeService';
import {colors, spacing} from '../../shared/theme/tokens';

export function HandoffScreen() {
  const track = usePlayerStore(s => s.currentTrack());
  const positionSec = usePlayerStore(s => s.positionSec);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [receiveCode, setReceiveCode] = useState('');

  const onSend = async () => {
    if (!track) {
      Alert.alert('Lecture', 'Lancez un morceau avant d’envoyer.');
      return;
    }
    setLoading(true);
    try {
      const result = await sendHandoff(track, Math.round(positionSec * 1000));
      setGeneratedCode(result.code);
      Alert.alert(
        'Handoff créé',
        `Code : ${result.code}\n${
          result.bleActive
            ? 'Scan Bluetooth actif.'
            : 'Entrez ce code sur l’autre appareil.'
        }`,
      );
    } catch (e) {
      alertError(e, 'Échec handoff');
    } finally {
      setLoading(false);
    }
  };

  const onReceive = async () => {
    setLoading(true);
    try {
      const payload = await acceptHandoffCode(receiveCode);
      await applyHandoff(payload);
      Alert.alert('Succès', 'Lecture reprise sur cet appareil.');
    } catch (e) {
      alertError(e, 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.screenRootPadded}>
      <Text style={styles.heading}>Partage de lecture</Text>
      <Text style={styles.desc}>
        Envoyez la session en cours (métadonnées + position) — pas de fichier
        audio. Utilisez le code sur un second appareil ou le Bluetooth à proximité.
      </Text>

      {track && (
        <Text style={styles.now}>
          En cours : {track.title} · {Math.floor(positionSec)}s
        </Text>
      )}

      <Pressable
        style={[commonStyles.primaryButton, styles.btnMargin, loading && commonStyles.primaryButtonDisabled]}
        onPress={onSend}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={commonStyles.primaryButtonText}>Générer code & scanner BLE</Text>
        )}
      </Pressable>

      {generatedCode && (
        <Text style={styles.code}>Code actif : {generatedCode}</Text>
      )}

      <View style={styles.divider} />

      <Text style={styles.label}>Recevoir avec un code</Text>
      <TextInput
        style={[commonStyles.input, styles.inputExtra]}
        placeholder="Ex. A3X9K2"
        placeholderTextColor={colors.muted}
        autoCapitalize="characters"
        value={receiveCode}
        onChangeText={setReceiveCode}
      />
      <Pressable style={styles.btnSecondary} onPress={onReceive} disabled={loading}>
        <Text style={styles.btnSecondaryText}>Accepter la lecture</Text>
      </Pressable>

      <Text style={styles.note}>
        Sur émulateur : utilisez le même code copié entre deux instances, ou testez
        sur deux téléphones physiques.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {color: colors.text, fontSize: 24, fontWeight: '700'},
  desc: {color: colors.textDim, marginTop: spacing.sm, lineHeight: 22},
  now: {color: colors.precision, marginTop: spacing.md},
  btnMargin: {
    marginTop: spacing.lg,
  },
  code: {
    color: colors.precision,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.lg,
    letterSpacing: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.elevated,
    marginVertical: spacing.xl,
  },
  label: {color: colors.text, fontWeight: '600', marginBottom: spacing.sm},
  inputExtra: {
    marginBottom: spacing.md,
  },
  btnSecondary: {
    backgroundColor: colors.elevated,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnSecondaryText: {color: colors.precision, fontWeight: '600'},
  note: {color: colors.muted, fontSize: 12, marginTop: spacing.xl},
});
