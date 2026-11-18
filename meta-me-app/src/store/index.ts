import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { secureStorage } from './storage';

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  setAuth: (accessToken: string, refreshToken: string, userId: string) => void;
  clearAuth: () => void;
}

export const AUTH_STORAGE_KEY = 'metame-auth';

// 앱을 다시 열어도 로그인이 유지되도록 토큰을 기기 보안 저장소(Keychain/Keystore)에 저장한다.
// 저장소 읽기가 비동기라 skipHydration 후 루트 레이아웃에서 rehydrate가 끝날 때까지 화면을 그리지 않는다.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      setAuth: (accessToken, refreshToken, userId) => set({ accessToken, refreshToken, userId }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, userId: null }),
    }),
    { name: AUTH_STORAGE_KEY, storage: createJSONStorage(() => secureStorage), skipHydration: true },
  ),
);

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

