import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 백엔드에 저장 API가 없는 사용자 데이터(닉네임, 모은 코그니, 대화 기록 등)를
// 사용자별로 이 기기에 보관한다. API가 생기면 이 스토어 대신 서버 값을 쓰면 된다.

export interface CollectedCogni {
  id: string;
  name: string;
  desc: string;
  category: string;
  /** '/v2/xxx.png' 같은 로컬 에셋 경로 또는 서버 icon_url */
  image: string;
  foundAt: string; // ISO
  source: 'onboarding' | 'mirror';
  features?: string[];
}

export interface SavedChatMessage {
  role: 'ai' | 'user';
  text: string;
}

export interface SavedChat {
  id: string;
  /** 'free' = 대화 탭, 'analysis' = 리포트/미러의 "분석 결과 물어보기" */
  kind: 'free' | 'analysis';
  /** 분석 질문일 때 어떤 분석을 보며 물었는지 */
  context?: string;
  sessionId: string | null;
  startedAt: string; // ISO
  endedAt: string; // ISO
  messages: SavedChatMessage[];
}

export interface UserLocal {
  nickname?: string;
  mySentence?: string;
  cognis: CollectedCogni[];
  chats: SavedChat[];
}

const EMPTY: UserLocal = { cognis: [], chats: [] };

interface LocalStore {
  byUser: Record<string, UserLocal>;
  update: (userId: string, fn: (u: UserLocal) => UserLocal) => void;
}

export const useLocalStore = create<LocalStore>()(
  persist(
    (set) => ({
      byUser: {},
      update: (userId, fn) => set((s) => ({ byUser: { ...s.byUser, [userId]: fn(s.byUser[userId] ?? EMPTY) } })),
    }),
    { name: 'metame-local', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

export const EMPTY_USER_LOCAL = EMPTY;
