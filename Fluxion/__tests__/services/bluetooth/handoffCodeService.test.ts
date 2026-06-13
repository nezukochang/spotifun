import {publishHandoffCode, acceptHandoffCode} from '../../../src/services/bluetooth/handoffCodeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {HandoffPayload} from '../../../src/types/models';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const payload: HandoffPayload = {
  sessionId: 'ho-123',
  trackId: 't1',
  positionMs: 5000,
  issuedAt: 1000,
};

describe('publishHandoffCode', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns a 6-character uppercase code', async () => {
    const code = await publishHandoffCode(payload);
    expect(code).toMatch(/^[A-Z0-9]{1,6}$/);
  });

  it('stores the payload in AsyncStorage with the code key', async () => {
    const code = await publishHandoffCode(payload);
    expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
    const [key, value] = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(key).toBe(`@fluxion/handoff_code:${code}`);
    const stored = JSON.parse(value);
    expect(stored.trackId).toBe('t1');
    expect(stored.positionMs).toBe(5000);
    expect(stored.expiresAt).toBeGreaterThan(Date.now());
  });
});

describe('acceptHandoffCode', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the payload when the code is valid and not expired', async () => {
    const stored = {...payload, expiresAt: Date.now() + 300000};
    (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(stored),
    );

    const result = await acceptHandoffCode('ABC123');
    expect(result.trackId).toBe('t1');
    expect(result.positionMs).toBe(5000);
    expect(result.sessionId).toBe('ho-123');
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
      '@fluxion/handoff_code:ABC123',
    );
  });

  it('throws when code is not found', async () => {
    (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    await expect(acceptHandoffCode('INVALID')).rejects.toThrow(
      'Code invalide ou expiré.',
    );
  });

  it('throws when code is expired', async () => {
    const stored = {...payload, expiresAt: Date.now() - 1000};
    (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(stored),
    );
    await expect(acceptHandoffCode('ABC123')).rejects.toThrow('Code expiré.');
    expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
  });

  it('normalizes the code to uppercase and trims whitespace', async () => {
    const stored = {...payload, expiresAt: Date.now() + 300000};
    (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(stored),
    );
    await acceptHandoffCode('  abc123  ');
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
      '@fluxion/handoff_code:ABC123',
    );
  });
});
