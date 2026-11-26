// v2.openapi.json에만 있는 결제·구독 API. latest 명세에는 빠져 있어 서버 배포 여부를 확인한 뒤 화면에 붙인다.
import { apiRequest } from '@/shared/api';
import type {
  CreateSubscriptionRequest,
  ListPaymentsParams,
  PaymentListResponse,
  SubscriptionPlanListResponse,
  SubscriptionResponse,
  UpdateSubscriptionRequest,
} from '../model/types';

export const listSubscriptionPlans = () => apiRequest<SubscriptionPlanListResponse>('/v1/subscription-plans');

export const getMySubscription = () => apiRequest<SubscriptionResponse>('/v1/users/me/subscription');

export const createSubscription = (body: CreateSubscriptionRequest) =>
  apiRequest<SubscriptionResponse>('/v1/subscriptions', { method: 'POST', body });

/** 해지(status=CANCELED)나 자동 갱신 토글. */
export const updateSubscription = (subscriptionId: string, body: UpdateSubscriptionRequest) =>
  apiRequest<SubscriptionResponse>(`/v1/subscriptions/${subscriptionId}`, { method: 'PATCH', body });

export const listMyPayments = (params?: ListPaymentsParams) =>
  apiRequest<PaymentListResponse>('/v1/users/me/payments', { query: params });
