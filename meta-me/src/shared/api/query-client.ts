import { QueryClient } from '@tanstack/react-query';
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
