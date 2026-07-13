import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken, deleteToken, getToken } from '@/lib/secureStorage';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  restoreToken: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      setAuth: async (user, token) => {
        await setToken(token);
        set({ user, token });
      },

      clearAuth: async () => {
        await deleteToken();
        set({ user: null, token: null });
      },

      restoreToken: async () => {
        const token = await getToken();
        set({ token, isLoading: false });
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'mobile-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
