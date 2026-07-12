'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';

export function useReportData<T>(fetchFn: (token: string) => Promise<T>, fallback: T) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [data, setData] = useState<T>(fallback);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    fetchFn(accessToken)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return data;
}
