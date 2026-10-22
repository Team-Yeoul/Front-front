import type { components, paths } from '@/shared/api';

type Json<T> = T extends { content: { 'application/json': infer B } } ? B : never;

export type PeerFeedback = components['schemas']['PeerFeedback'];
export type PeerFeedbackInvitationResponse = Json<
  paths['/v1/users/me/peer-feedback/invitations']['post']['responses'][201]
>;
export type PeerFeedbackListResponse = Json<paths['/v1/users/me/peer-feedback']['get']['responses'][200]>;
export type PeerFeedbackInvitationStatus = Json<paths['/v1/peer-feedback/{token}']['get']['responses'][200]>;
export type SubmitPeerFeedbackRequest = Json<paths['/v1/peer-feedback/{token}']['post']['requestBody']>;
export type SubmitPeerFeedbackResponse = Json<paths['/v1/peer-feedback/{token}']['post']['responses'][201]>;

export interface ListPeerFeedbackParams {
  page?: number;
  size?: number;
}
