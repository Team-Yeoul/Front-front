import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DiaryEntry, User } from '@/types';

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  setAuth: (accessToken: string, refreshToken: string, userId: string) => void;
  clearAuth: () => void;
}

// 새로고침해도 로그인이 유지되도록 localStorage에 저장한다.
// SSR과 첫 렌더가 어긋나지 않게 skipHydration 후 <AuthGate>에서 rehydrate한다.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      setAuth: (accessToken, refreshToken, userId) => set({ accessToken, refreshToken, userId }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, userId: null }),
    }),
    { name: 'metame-auth', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

export * from './local';

interface DiaryStore {
  entries: DiaryEntry[];
  setEntries: (entries: DiaryEntry[]) => void;
  addEntry: (entry: DiaryEntry) => void;
  removeEntry: (id: string) => void;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

interface UIStore {
  isLoading: boolean;
  setLoading: (v: boolean) => void;
}

export const useDiaryStore = create<DiaryStore>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
  removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
}));

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export const useUIStore = create<UIStore>((set) => ({
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));

interface TermsAgreement {
  service: boolean;
  privacy: boolean;
  marketing: boolean;
}

interface TermsStore extends TermsAgreement {
  setTerms: (terms: TermsAgreement) => void;
  reset: () => void;
}

const initialTerms: TermsAgreement = { service: false, privacy: false, marketing: false };

export const useTermsStore = create<TermsStore>((set) => ({
  ...initialTerms,
  setTerms: (terms) => set(terms),
  reset: () => set(initialTerms),
}));

export interface StatusBarTheme {
  /** CSS background for the mock status bar (desktop preview only). */
  bg: string;
  /** Icon/text color scheme — 'light' = white icons for a colored/dark bg. */
  fg: 'light' | 'dark';
}

interface StatusBarStore {
  theme: StatusBarTheme;
  setTheme: (theme: StatusBarTheme) => void;
}

export const DEFAULT_STATUS_BAR_THEME: StatusBarTheme = { bg: '#ffffff', fg: 'dark' };

export const useStatusBarStore = create<StatusBarStore>((set) => ({
  theme: DEFAULT_STATUS_BAR_THEME,
  setTheme: (theme) => set({ theme }),
}));
