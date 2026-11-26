import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as paymentApi from './payment.http';
import type { CreateSubscriptionRequest, ListPaymentsParams, UpdateSubscriptionRequest } from '../model/types';

export const paymentKeys = {
  all: ['payment'] as const,
  plans: () => [...paymentKeys.all, 'plans'] as const,
  mySubscription: () => [...paymentKeys.all, 'my-subscription'] as const,
  payments: (params?: ListPaymentsParams) => [...paymentKeys.all, 'payments', params] as const,
};

export const useSubscriptionPlans = (enabled = true) =>
  useQuery({ queryKey: paymentKeys.plans(), queryFn: paymentApi.listSubscriptionPlans, enabled });

export const useMySubscription = (enabled = true) =>
  useQuery({ queryKey: paymentKeys.mySubscription(), queryFn: paymentApi.getMySubscription, enabled });

export const useMyPayments = (params?: ListPaymentsParams, enabled = true) =>
  useQuery({ queryKey: paymentKeys.payments(params), queryFn: () => paymentApi.listMyPayments(params), enabled });

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSubscriptionRequest) => paymentApi.createSubscription(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, body }: { subscriptionId: string; body: UpdateSubscriptionRequest }) =>
      paymentApi.updateSubscription(subscriptionId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
};
