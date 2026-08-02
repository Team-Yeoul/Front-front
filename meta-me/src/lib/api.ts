import { apiRequest } from '@/shared/api';
import type {
  ReportStatus,
  ReportSummary,
  EmotionDetail,
  KeywordDetail,
  EnergyDetail,
  PersonaDetail,
  ActionExperimentStatus,
} from '@/types';

export const getReportStatus = () => apiRequest<ReportStatus>('/v1/report/status');

export const getReportSummary = () => apiRequest<ReportSummary>('/v1/report/summary');

export const getEmotionDetail = () => apiRequest<EmotionDetail>('/v1/report/emotion');

export const getKeywordDetail = () => apiRequest<KeywordDetail>('/v1/report/keywords');

export const getEnergyDetail = () => apiRequest<EnergyDetail>('/v1/report/energy');

export const getPersonaDetail = () => apiRequest<PersonaDetail>('/v1/report/persona');

export const getActionExperimentStatus = () =>
  apiRequest<ActionExperimentStatus>('/v1/report/action');
