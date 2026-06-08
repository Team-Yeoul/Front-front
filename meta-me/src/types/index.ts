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
