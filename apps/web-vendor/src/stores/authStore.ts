import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Role {
  id: number;
  name: string;
  label?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string | null;
  phone?: string | null;
  language_pref?: string;
  date_of_birth?: string | null;
  country?: string | null;
  nationality?: string | null;
  address?: string | null;
  bio?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (patch: Partial<User>) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('sanctum-token', token);
        set({ user, token });
      },
      updateUser: (patch) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : null,
        }));
      },
      clearAuth: () => {
        localStorage.removeItem('sanctum-token');
        set({ user: null, token: null });
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'vendor-auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
