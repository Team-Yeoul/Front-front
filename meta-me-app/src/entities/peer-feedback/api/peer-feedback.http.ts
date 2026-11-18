import { apiRequest } from '@/shared/api';
import type {
  ListPeerFeedbackParams,
  PeerFeedbackInvitationResponse,
  PeerFeedbackInvitationStatus,
  PeerFeedbackListResponse,
  SubmitPeerFeedbackRequest,
  SubmitPeerFeedbackResponse,
} from '../model/types';

/** 친구 평가 초대 링크를 발급한다. 7일 동안 유효하고, 한 번 제출되면 만료된다. */
export const createInvitation = () =>
  apiRequest<PeerFeedbackInvitationResponse>('/v1/users/me/peer-feedback/invitations', { method: 'POST' });

export const revokeInvitation = (invitationId: string) =>
  apiRequest<void>(`/v1/users/me/peer-feedback/invitations/${invitationId}`, { method: 'DELETE' });

export const listPeerFeedback = (params?: ListPeerFeedbackParams) =>
  apiRequest<PeerFeedbackListResponse>('/v1/users/me/peer-feedback', { query: params });

/** 로그인 없이 링크가 쓸 수 있는지 확인한다. 없는 링크는 404, 만료·사용·취소된 링크는 410. */
export const getInvitation = (token: string) =>
  apiRequest<PeerFeedbackInvitationStatus>(`/v1/peer-feedback/${token}`, { auth: false });

export const submitPeerFeedback = (token: string, body: SubmitPeerFeedbackRequest) =>
  apiRequest<SubmitPeerFeedbackResponse>(`/v1/peer-feedback/${token}`, { method: 'POST', body, auth: false });
