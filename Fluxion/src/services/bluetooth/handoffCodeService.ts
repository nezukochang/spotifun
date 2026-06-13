import AsyncStorage from '@react-native-async-storage/async-storage';
import type {HandoffPayload} from '../../types/models';

const PREFIX = '@fluxion/handoff_code:';
const TTL_MS = 5 * 60 * 1000;

type Stored = HandoffPayload & {expiresAt: number};

export async function publishHandoffCode(
  payload: HandoffPayload,
): Promise<string> {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stored: Stored = {
    ...payload,
    expiresAt: Date.now() + TTL_MS,
  };
  await AsyncStorage.setItem(`${PREFIX}${code}`, JSON.stringify(stored));
  return code;
}

export async function acceptHandoffCode(code: string): Promise<HandoffPayload> {
  const key = `${PREFIX}${code.trim().toUpperCase()}`;
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    throw new Error('Code invalide ou expiré.');
  }
  const stored = JSON.parse(raw) as Stored;
  if (Date.now() > stored.expiresAt) {
    await AsyncStorage.removeItem(key);
    throw new Error('Code expiré.');
  }
  await AsyncStorage.removeItem(key);
  const payload: HandoffPayload = {
    sessionId: stored.sessionId,
    trackId: stored.trackId,
    positionMs: stored.positionMs,
    issuedAt: stored.issuedAt,
  };
  return payload;
}
