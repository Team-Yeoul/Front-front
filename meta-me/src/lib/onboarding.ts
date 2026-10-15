import { userApi } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { useLocalStore } from '@/store';

/** 서버가 '온보딩 기록 없음'이라고 명확히 답했는지. 그 밖의 404·오류로는 온보딩을 다시 시키지 않는다. */
export const isOnboardingMissing = (err: unknown) => err instanceof ApiError && err.code === 'ONBOARDING_NOT_FOUND';

/** 로그인 직후 갈 곳. 서버에 온보딩 기록이 없고(ONBOARDING_NOT_FOUND) 이 기기에서도 마친 적이 없을 때만 온보딩으로 보낸다. */
export async function loginDestination(userId: string) {
  if (useLocalStore.getState().byUser[userId]?.onboardedAt) return '/main';
  try {
    await userApi.getOnboardingResult();
    return '/main';
  } catch (err) {
    return isOnboardingMissing(err) ? '/onboarding' : '/main';
  }
}
