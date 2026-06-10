import {create} from 'zustand';
import type {UserProfile} from '../types/models';
import * as authService from '../services/auth/authService';

type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  hydrate: async () => {
    const user = await authService.getCurrentUser();
    set({user, initialized: true});
  },

  signIn: async (email, password) => {
    set({loading: true});
    try {
      const user = await authService.signIn(email, password);
      set({user});
    } finally {
      set({loading: false});
    }
  },

  signUp: async (email, password) => {
    set({loading: true});
    try {
      const user = await authService.signUp(email, password);
      set({user});
    } finally {
      set({loading: false});
    }
  },

  signOut: async () => {
    await authService.signOut();
    set({user: null});
  },
}));
