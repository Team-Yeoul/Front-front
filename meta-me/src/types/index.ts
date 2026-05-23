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
