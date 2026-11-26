import { apiRequest } from '@/shared/api';
import type { MemoryInsight } from '../model/types';

export const listInsights = () => apiRequest<MemoryInsight[]>('/v1/memory/insights');

/** 기억이 맞다고 확인한다. */
export const confirmInsight = (insightId: string) =>
  apiRequest<MemoryInsight>(`/v1/memory/insights/${insightId}/confirm`, { method: 'POST' });

/** 기억 내용을 고친다. 기존 기억은 SUPERSEDED, 고친 내용이 새 ACTIVE 기억으로 생긴다. */
export const correctInsight = (insightId: string, content: string) =>
  apiRequest<MemoryInsight>(`/v1/memory/insights/${insightId}`, { method: 'PUT', body: { content } });

/** 기억과 그 근거를 완전히 지운다. */
export const deleteInsight = (insightId: string) =>
  apiRequest<void>(`/v1/memory/insights/${insightId}`, { method: 'DELETE' });

/** 틀렸다고 철회한다. 기록은 RETRACTED로 남고, AI가 같은 내용을 다시 추론해도 되살리지 않는다. */
export const retractInsight = (insightId: string) =>
  apiRequest<void>(`/v1/memory/insights/${insightId}/retract`, { method: 'POST' });
