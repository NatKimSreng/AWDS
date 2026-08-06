import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  language_pref?: string;
  role?: string;
  created_at?: string;
  date_of_birth?: string | null;
  country?: string | null;
  nationality?: string | null;
  address?: string | null;
  bio?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  stats?: {
    total_bookings: number;
    upcoming_bookings: number;
    completed_bookings: number;
    favorites_count: number;
    unread_messages_count: number;
  } | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  isAuthenticated: () => boolean;
}

const TOKEN_KEY = "marketing-sanctum-token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      setAuth: (user, token) => {
        setStoredToken(token);
        set({ user, token, isLoading: false });
      },

      updateUser: (patch) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : null,
        }));
      },

      clearAuth: () => {
        setStoredToken(null);
        set({ user: null, token: null, isLoading: false });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: "marketing-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    }
  )
);
