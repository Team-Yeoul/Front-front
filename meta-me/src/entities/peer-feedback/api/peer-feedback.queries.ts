'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import * as peerFeedbackApi from './peer-feedback.http';
import type { ListPeerFeedbackParams, SubmitPeerFeedbackRequest } from '../model/types';

export const peerFeedbackKeys = {
  all: ['peer-feedback'] as const,
  list: (params?: ListPeerFeedbackParams) => [...peerFeedbackKeys.all, 'list', params] as const,
  invitation: (token: string) => [...peerFeedbackKeys.all, 'invitation', token] as const,
};

export const useCreatePeerFeedbackInvitation = () => useMutation({ mutationFn: peerFeedbackApi.createInvitation });

export const useRevokePeerFeedbackInvitation = () =>
  useMutation({ mutationFn: (invitationId: string) => peerFeedbackApi.revokeInvitation(invitationId) });

export const useListPeerFeedback = (params?: ListPeerFeedbackParams, enabled = true) =>
  useQuery({
    queryKey: peerFeedbackKeys.list(params),
    queryFn: () => peerFeedbackApi.listPeerFeedback(params),
    enabled,
  });

export const useGetPeerFeedbackInvitation = (token: string, enabled = true) =>
  useQuery({
    queryKey: peerFeedbackKeys.invitation(token),
    queryFn: () => peerFeedbackApi.getInvitation(token),
    enabled: enabled && !!token,
  });

// 제출 뒤 링크 상태를 다시 불러오면 410(사용됨)이 돼 완료 화면이 만료 화면으로 바뀌므로 무효화하지 않는다.
export const useSubmitPeerFeedback = (token: string) =>
  useMutation({ mutationFn: (body: SubmitPeerFeedbackRequest) => peerFeedbackApi.submitPeerFeedback(token, body) });
