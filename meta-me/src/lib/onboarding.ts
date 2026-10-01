import { ApiError } from '@/shared/api';

/** 서버가 '온보딩 기록 없음'이라고 명확히 답했는지. 그 밖의 404·오류로는 온보딩을 다시 시키지 않는다. */
export const isOnboardingMissing = (err: unknown) => err instanceof ApiError && err.code === 'ONBOARDING_NOT_FOUND';
