import {signIn, signUp, signOut, getCurrentUser} from '../../../src/services/auth/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('../../../src/config/env', () => ({
  env: {useMockData: true},
}));

jest.mock('../../../src/services/supabase/client', () => ({
  getSupabase: jest.fn(() => null),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('authService (mock mode)', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('signIn', () => {
    it('returns a mock user profile', async () => {
      const user = await signIn('test@example.com', 'pass');
      expect(user.id).toBe('demo-user');
      expect(user.email).toBe('test@example.com');
      expect(user.displayName).toBe('test');
      expect(user.isPremium).toBe(false);
    });

    it('uses default email and display name when email is empty', async () => {
      const user = await signIn('', 'pass');
      expect(user.email).toBe('demo@fluxion.app');
      expect(user.displayName).toBe('Auditeur');
    });

    it('stores the user in AsyncStorage', async () => {
      await signIn('test@example.com', 'pass');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@fluxion/mock_user',
        expect.any(String),
      );
    });
  });

  describe('signUp', () => {
    it('delegates to signIn in mock mode', async () => {
      const user = await signUp('new@example.com', 'pass');
      expect(user.email).toBe('new@example.com');
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('removes the mock user from AsyncStorage', async () => {
      await signOut();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        '@fluxion/mock_user',
      );
    });
  });

  describe('getCurrentUser', () => {
    it('returns the stored user', async () => {
      const stored = {
        id: 'demo-user',
        email: 'test@example.com',
        displayName: 'test',
        isPremium: false,
      };
      (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(stored),
      );
      const user = await getCurrentUser();
      expect(user).toEqual(stored);
    });

    it('returns null when no user is stored', async () => {
      (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const user = await getCurrentUser();
      expect(user).toBeNull();
    });
  });
});
