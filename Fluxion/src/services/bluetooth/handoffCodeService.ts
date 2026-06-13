import AsyncStorage from '@react-native-async-storage/async-storage';
import type {HandoffPayload} from '../../types/models';

const PREFIX = '@fluxion/handoff_code:';
const TTL_MS = 5 * 60 * 1000;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

type Stored = HandoffPayload & {expiresAt: number};

declare const crypto: { getRandomValues<T extends ArrayBufferView>(array: T): T };

function generateSecureCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

export async function publishHandoffCode(
  payload: HandoffPayload,
): Promise<string> {
  const code = generateSecureCode();
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
  const {expiresAt: _, ...payload} = stored;
  return payload;
}
