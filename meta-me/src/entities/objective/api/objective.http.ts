import { apiRequest } from '@/shared/api';
import type { CreateObjectiveMirrorRequest, ObjectiveMirrorResponse } from '../model/types';

export const createObjectiveMirror = (body: CreateObjectiveMirrorRequest) =>
  apiRequest<ObjectiveMirrorResponse>('/v1/objective-mirrors', { method: 'POST', body });
