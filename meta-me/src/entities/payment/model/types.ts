import type { components } from '@/shared/api';

export type SubscriptionPlan = components['schemas']['SubscriptionPlan'];
export type SubscriptionPlanListResponse = components['schemas']['SubscriptionPlanListResponse'];
export type Subscription = components['schemas']['Subscription'];
export type SubscriptionResponse = components['schemas']['SubscriptionResponse'];
export type CreateSubscriptionRequest = components['schemas']['CreateSubscriptionRequest'];
export type UpdateSubscriptionRequest = components['schemas']['UpdateSubscriptionRequest'];
export type Payment = components['schemas']['Payment'];
export type PaymentListResponse = components['schemas']['PaymentListResponse'];

export interface ListPaymentsParams {
  page?: number;
  size?: number;
}
