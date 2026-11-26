import type { components } from '@/shared/api';

/** AI가 기억한 내용 한 개. 목록에는 ACTIVE와 CONTESTED만 나온다. confidence가 낮으면 추정으로 표시한다. */
export type MemoryInsight = components['schemas']['InsightView'];
export type InsightType = components['schemas']['InsightType'];
export type InsightStatus = components['schemas']['InsightStatus'];
