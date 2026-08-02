'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';

export function useReportData<T>(fetchFn: () => Promise<T>, fallback: T) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [data, setData] = useState<T>(fallback);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    fetchFn()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        console.error('[useReportData] 리포트 데이터 로딩 실패, 예시 데이터로 대체합니다.', err);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return data;
}
