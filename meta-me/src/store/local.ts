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
  /**
   * 답변 생성만 실패한 AI 안내 말풍선에 붙는 다시 받기 대상(세션·브랜치).
   * 대화와 함께 저장돼, 이어서 대화할 때도 '답 다시 받기'로 이 답만 다시 만들 수 있다.
   */
  retry?: { sessionId: string; branchId: string };
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
  /** 메타미가 기기에서 건넸지만 아직 답하지 않은 질문. 이어서 대화할 때 다음 답과 함께 보낸다. */
  pendingQuestion?: string;
}

/** 이 기기가 받은 푸시 알림. 알림함 API가 없어 받은 알림을 기기에 모아 알림함에 보여 준다. */
export interface InboxPush {
  id: string;
  title: string;
  body: string;
  at: string; // ISO
}

export interface UserLocal {
  nickname?: string;
  mySentence?: string;
  /** 이 기기에서 온보딩 화면을 끝까지 마친 시각. 서버 제출이 실패해도 온보딩을 반복시키지 않는 데 쓴다. */
  onboardedAt?: string;
  cognis: CollectedCogni[];
  chats: SavedChat[];
  /** 지난 대화에서 위에 고정한 대화 id (고정한 순서, 최근 것이 앞). 기기에만 저장한다. */
  pinnedChats?: string[];
  /** 기록을 수정한 시각(record_id → ISO). 그보다 먼저 만든 객관화 문장은 예전 글 기준이라 쓰지 않는다. */
  recordEditedAt?: Record<string, string>;
  /** 민감정보(기록·AI 분석) 처리 동의. 서버에 동의 API가 생기면 그쪽으로 옮긴다. */
  sensitiveConsent?: { agreed: boolean; at: string };
  /** 알림함을 마지막으로 읽은 시각. 그 뒤에 생긴 알림을 '안 읽음'으로 본다. */
  inboxReadAt?: string;
  /** 받은 푸시 알림 (최근 것이 앞, 최대 50개) */
  inboxPushes?: InboxPush[];
  /** Google로 새로 가입해 아직 약관 동의를 하지 않은 상태. 동의할 때까지 약관 화면으로만 보낸다. */
  termsPending?: boolean;
  /** 날짜(YYYY-MM-DD) → 그날 고른 기분 번호. 서버에 기분 필드가 없어 계정별로 기기에 둔다(탈퇴하면 함께 지운다). */
  moods?: Record<string, number>;
}

const EMPTY: UserLocal = { cognis: [], chats: [] };

interface LocalStore {
  byUser: Record<string, UserLocal>;
  update: (userId: string, fn: (u: UserLocal) => UserLocal) => void;
  /** 탈퇴한 사용자의 기기 데이터를 지운다. */
  remove: (userId: string) => void;
}

export const useLocalStore = create<LocalStore>()(
  persist(
    (set) => ({
      byUser: {},
      update: (userId, fn) => set((s) => ({ byUser: { ...s.byUser, [userId]: fn(s.byUser[userId] ?? EMPTY) } })),
      remove: (userId) =>
        set((s) => {
          const byUser = { ...s.byUser };
          delete byUser[userId];
          return { byUser };
        }),
    }),
    { name: 'metame-local', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

export const EMPTY_USER_LOCAL = EMPTY;
