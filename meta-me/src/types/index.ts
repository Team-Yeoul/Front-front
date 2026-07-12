export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface OnboardingRequest {
  description: string;
}

export interface OnboardingResponse {
  accuracy_percent: number;
  ai_first_sentence: string;
}

export interface DiaryEntry {
  id: string;
  content: string;
  question?: string;
  mood?: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface CreateDiaryRequest {
  content: string;
  question?: string;
  mood?: number;
  tags?: string[];
}

export interface AIRequest {
  prompt: string;
  context?: string;
}

export interface AIResponse {
  result: string;
}

export interface DiaryListResponse {
  entries: DiaryEntry[];
  total: number;
}

// ── 리포트 ──

export interface HighlightLine {
  text: string;
  highlight: string;
}

export interface ReportStatus {
  unlocked: boolean;
  recordedDays: number;
  requiredDays: number;
  matchPercent: number;
  matchLabel: string;
  matchDescription: string;
  weeklyHighlights: HighlightLine[];
}

export interface DateTag {
  label: string;
  date: string;
}

export interface PersonaAxis {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
}

export interface ReportSummary {
  day: number;
  scope: string;
  title: string;
  matchPercent: number;
  recordedDays: number;
  weeklyHighlights: HighlightLine[];
  emotion: {
    emotionTags: string[];
    cautionTags: string[];
    description: string;
  };
  interest: {
    interestTags: string[];
    disinterestTags: string[];
    description: string;
  };
  energy: {
    chargeTags: string[];
    drainTags: string[];
  };
  personaGrowth: {
    from: number;
    to: number;
    description: string;
  };
  weeklyGrowth: {
    description: string;
    comparisonLabel: string;
    dueLabel: string;
  };
  mirrors: {
    me: string;
    ai: string;
    others: string;
  };
  personaMap: PersonaAxis[];
  personaNote: string;
}

export interface PatternItem {
  title: string;
  count: number;
  description: string;
  tags: DateTag[];
}

export interface EmotionDetail {
  emotions: PatternItem[];
  cautions: PatternItem[];
  trend: { label: string; value: number }[];
}

export interface KeywordItem extends PatternItem {
  category: 'interest' | 'disinterest';
}

export interface KeywordDetail {
  interestKeywords: KeywordItem[];
  disinterestKeywords: KeywordItem[];
  frequency: { label: string; count: number; category: 'interest' | 'disinterest' }[];
}

export interface EnergyDetail {
  charge: PatternItem[];
  drain: PatternItem[];
  chargeCount: number;
  drainCount: number;
}

export interface PersonaAxisDetail extends PersonaAxis {
  description: string;
}

export interface PersonaDetail {
  summary: string;
  axes: PersonaAxisDetail[];
  shiningMoments: string[];
  cautionMoments: string[];
  note: string;
}

export interface ActionExperimentStatus {
  ready: boolean;
  message: string;
}

export interface ObjectifyMirrors {
  myView: {
    title: string;
    content: string;
    tags: DateTag[];
  };
  aiView: {
    unlocked: boolean;
    message: string;
  };
  othersView: {
    unlocked: boolean;
    distribution: { label: string; percent: number }[];
    note: string;
  };
}
