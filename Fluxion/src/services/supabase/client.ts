import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient, SupabaseClient} from '@supabase/supabase-js';
import {env} from '../../config/env';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (env.useMockData) {
    return null;
  }
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
