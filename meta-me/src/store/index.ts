import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  nickname: string | null;
  setAuth: (accessToken: string, refreshToken: string, userId: string) => void;
  setNickname: (nickname: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      nickname: null,
      setAuth: (accessToken, refreshToken, userId) => set({ accessToken, refreshToken, userId }),
      setNickname: (nickname) => set({ nickname }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, userId: null, nickname: null }),
    }),
    { name: 'auth-storage' },
  ),
);
