import { apiRequest } from '@/shared/api';
import type {
  CreateObjectiveMirrorRequest,
  ListObjectiveMirrorsParams,
  ObjectiveMirrorListResponse,
  ObjectiveMirrorResponse,
} from '../model/types';

export const createObjectiveMirror = (body: CreateObjectiveMirrorRequest) =>
  apiRequest<ObjectiveMirrorResponse>('/v1/objective-mirrors', { method: 'POST', body });

export const listObjectiveMirrors = (params?: ListObjectiveMirrorsParams) =>
  apiRequest<ObjectiveMirrorListResponse>('/v1/objective-mirrors', { query: params });

export const getObjectiveMirror = (mirrorId: string) =>
  apiRequest<ObjectiveMirrorResponse>(`/v1/objective-mirrors/${mirrorId}`);
