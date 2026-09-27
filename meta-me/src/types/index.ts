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
  weeklyTrend: { label: string; value: number }[];
  weeklyDeltaLabel: string;
  personaAxes: PersonaAxis[];
  strength: string;
  weakness: string;
  interestTags: { label: string; count: number }[];
  disinterestTags: { label: string; count: number }[];
  energyAlert: { badge: string; countLabel: string; description: string };
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
  recordedCount: number;
  aiIntro: string;
  accuracyPercent: number;
  accuracyDeltaPercent: number;
  weeklyCount: number;
  streakDays: number;
  aiAnalysis: string;
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

export interface EnergyPatternItem {
  variant: 'boost' | 'drain' | 'void';
  title: string;
  subtitle: string;
}

export interface KeywordDetail {
  interestKeywords: KeywordItem[];
  disinterestKeywords: KeywordItem[];
  energyPatterns: EnergyPatternItem[];
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

export interface PersonaMatch {
  label: string;
  selfValue: number;
  othersValue: number;
}

export interface PersonaCompare {
  quote: string;
  axisLabels: string[];
  selfValues: number[];
  othersValues: number[];
  matches: PersonaMatch[];
  topDiff: { label: string; selfValue: number; othersValue: number; note: string };
}

export interface PersonaDetail {
  summary: string;
  axes: PersonaAxisDetail[];
  shiningMoments: string[];
  cautionMoments: string[];
  note: string;
  compare: PersonaCompare;
}

export interface GrowthDetail {
  trend: { label: string; value: number }[];
  deltaLabel: string;
  insights: { title: string; description: string }[];
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
