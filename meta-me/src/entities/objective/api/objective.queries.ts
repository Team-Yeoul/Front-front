'use client';

import { useMutation } from '@tanstack/react-query';
import * as objectiveApi from './objective.http';
import type { CreateObjectiveMirrorRequest } from '../model/types';

export const useCreateObjectiveMirror = () =>
  useMutation({
    mutationFn: (body: CreateObjectiveMirrorRequest) => objectiveApi.createObjectiveMirror(body),
  });
