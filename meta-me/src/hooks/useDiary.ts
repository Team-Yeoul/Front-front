'use client';

import { useState } from 'react';
import { fetcher } from '@/lib/api';

export function useDiary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function saveDiary(content: string) {
    setLoading(true);
    setError(null);
    try {
      await fetcher('/api/diary', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { saveDiary, loading, error };
}
