import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@clawchat/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setAuth: (user, token) => {
        localStorage.setItem('clawchat_token', token);
        set({ user, token, isLoading: false });
      },
      logout: () => {
        localStorage.removeItem('clawchat_token');
        set({ user: null, token: null, isLoading: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'clawchat-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
