import {secrets} from './secrets';

const PLACEHOLDER = 'placeholder';

export const env = {
  supabaseUrl: secrets.SUPABASE_URL.trim(),
  supabaseAnonKey: secrets.SUPABASE_ANON_KEY.trim(),
  get useMockData() {
    return (
      !this.supabaseUrl ||
      !this.supabaseAnonKey ||
      this.supabaseUrl.includes(PLACEHOLDER)
    );
  },
  offlineCacheMaxBytes: 512 * 1024 * 1024,
  bleServiceUuid: '0000ff01-0000-1000-8000-00805f9b34fb',
};
