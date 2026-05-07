'use client';

import { useState } from 'react';
import { fetcher } from '@/lib/api';

export function useAI() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function ask(prompt: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher<{ result: string }>('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      setResponse(data.result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { ask, response, loading, error };
}
