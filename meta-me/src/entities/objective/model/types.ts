import type { components } from '@/shared/api';

export type ObjectiveMirror = components['schemas']['ObjectiveMirror'];
export type ObjectiveMirrorResponse = components['schemas']['ObjectiveMirrorResponse'];
export type ObjectiveMirrorListResponse = components['schemas']['ObjectiveMirrorListResponse'];
export type CreateObjectiveMirrorRequest =
  components['schemas']['CreateObjectiveMirrorRequest'];

export interface ListObjectiveMirrorsParams {
  page?: number;
  size?: number;
}
