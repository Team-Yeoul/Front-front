import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  setAuth: (accessToken: string, refreshToken: string, userId: string) => void;
  clearAuth: () => void;
}

export const AUTH_STORAGE_KEY = 'metame-auth';

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
    { name: AUTH_STORAGE_KEY, storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

/**
 * 다른 탭이 저장한 최신 토큰을 이 탭으로 가져온다. 탭마다 메모리에 토큰을 따로 들고 있어서,
 * 다른 탭이 갱신(서버가 예전 refresh token을 폐기)한 뒤 예전 토큰으로 갱신을 시도하면 로그아웃되는 문제를 막는다.
 */
export const syncAuthFromStorage = () => useAuthStore.persist.rehydrate();

export * from './local';

interface TermsAgreement {
  service: boolean;
  privacy: boolean;
  sensitive: boolean;
  marketing: boolean;
}

interface TermsStore extends TermsAgreement {
  setTerms: (terms: TermsAgreement) => void;
  reset: () => void;
}

const initialTerms: TermsAgreement = { service: false, privacy: false, sensitive: false, marketing: false };

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
  /** Home indicator color — 'light' = white bar for a page whose background fills the bottom edge. */
  indicator?: 'light' | 'dark';
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
