import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { ApiError } from './http-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      // 404(아직 만들어지지 않은 리소스) 같은 4xx는 다시 요청해도 같으므로 재시도하지 않는다.
      retry: (failureCount, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 1,
    },
  },
});

// 쿼리 키에 사용자 구분이 없으므로, 로그인한 사용자가 바뀌면(로그아웃·탈퇴·다른 계정 로그인) 이전 사용자의 캐시를 비운다.
useAuthStore.subscribe((state, prev) => {
  if (state.userId !== prev.userId) queryClient.clear();
});
