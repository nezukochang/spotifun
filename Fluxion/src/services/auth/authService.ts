import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../../types/models';
import { env } from '../../config/env';
import { getSupabase } from '../supabase/client';

const MOCK_USER_KEY = '@fluxion/mock_user';

export async function signIn(
  email: string,
  password: string,
): Promise<UserProfile> {
  if (env.useMockData) {
    const user: UserProfile = {
      id: 'demo-user',
      email: email.trim() || 'demo@fluxion.app',
      displayName: email.split('@')[0] || 'Auditeur',
      isPremium: false,
    };

    await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    return user;
  }
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase.auth.signInWithPassword({

    email,
    password,
  });
  if (error) {
    throw error;
  }
  return {
    id: data.user!.id,
    email: data.user!.email ?? email,
    displayName:
      (data.user!.user_metadata?.full_name as string) ??
      email.split('@')[0],
    isPremium: (data.user!.user_metadata?.is_premium as boolean) ?? false,
  };

}

export async function signUp(
  email: string,
  password: string,
): Promise<UserProfile> {
  if (env.useMockData) {
    return signIn(email, password);
  }
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw error;
  }
  if (!data.user) {
    throw new Error('Inscription en attente de confirmation email.');
  }
  return {
    id: data.user.id,
    email: data.user.email ?? email,
    displayName: email.split('@')[0],
    isPremium: false,
  };

}

export async function signOut(): Promise<void> {
  if (env.useMockData) {
    await AsyncStorage.removeItem(MOCK_USER_KEY);
    return;
  }
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }

}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (env.useMockData) {
    const raw = await AsyncStorage.getItem(MOCK_USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  }
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();

  if (!data.session?.user) {
    return null;
  }
  const u = data.session.user;
  return {
    id: u.id,
    email: u.email ?? '',
    displayName:
      (u.user_metadata?.full_name as string) ?? u.email?.split('@')[0] ?? 'User',
    isPremium: (u.user_metadata?.is_premium as boolean) ?? false,
  };

}
