import { toDateKey } from '@/lib/date';
import { useAuthStore, useLocalStore } from '@/store';

/**
 * 오늘의 기분(직접 쓰는 기록 0단계, 시안 12q0). 고른 기분의 색으로 그날 기록 화면이 칠해진다.
 * 서버에 기분 필드가 아직 없어 계정별·날짜별로 기기(UserLocal.moods)에 저장한다.
 */
export interface Mood {
  label: string;
  /** 다이어리 달력 등에 쓰는 점 색 */
  dot: string;
  /** 화면 배경 (위 → 아래 두 색) */
  bg: [string, string];
  /** 버튼·선택 칩 색과 그 위 글자색 */
  accent: string;
  onAccent: string;
  /** 연한 카드 배경 */
  card: string;
  /** 진한 글자 · 보조 글자 · 꼬리표 글자 */
  ink: string;
  sub: string;
  label2: string;
  /** 진행 막대 바탕 */
  track: string;
  image: string;
}

export const MOODS: Mood[] = [
  {
    label: '아주 불쾌함',
    dot: '#B9C3E8',
    bg: ['#E3E8F7', '#C9D4EF'],
    accent: '#4F72C4',
    onAccent: '#FFFFFF',
    card: '#EEF2FB',
    ink: '#24304F',
    sub: '#4F5B7A',
    label2: '#3B5BA8',
    track: '#C3CDEA',
    image: '/images/diary/mood-1.png',
  },
  {
    label: '불쾌함',
    dot: '#D2C8EC',
    bg: ['#EEE9F8', '#DBD1F1'],
    accent: '#7E68C8',
    onAccent: '#FFFFFF',
    card: '#F5F1FC',
    ink: '#2E2650',
    sub: '#5E5480',
    label2: '#6650B8',
    track: '#D2C8EC',
    image: '/images/diary/mood-2.png',
  },
  {
    label: '보통',
    dot: '#E7E2D6',
    bg: ['#F4F2ED', '#E5E1D7'],
    accent: '#76715F',
    onAccent: '#FFFFFF',
    card: '#F9F7F2',
    ink: '#33302A',
    sub: '#6B6656',
    label2: '#5E594A',
    track: '#DCD7CA',
    image: '/images/diary/mood-3.png',
  },
  {
    label: '기분 좋음',
    dot: '#F2C53D',
    bg: ['#F6ECC6', '#EEDFA6'],
    accent: '#F2C53D',
    onAccent: '#3D3420',
    card: '#FBF4DC',
    ink: '#3D3420',
    sub: '#6B5E36',
    label2: '#8F6B00',
    track: '#E3D298',
    image: '/images/diary/mood-4.png',
  },
  {
    label: '아주 기분 좋음',
    dot: '#F7B27A',
    bg: ['#FCE9D8', '#F8D0AE'],
    accent: '#D2621A',
    onAccent: '#FFFFFF',
    card: '#FDF2E8',
    ink: '#45250F',
    sub: '#7A4E2E',
    label2: '#B4520F',
    track: '#F0C9A6',
    image: '/images/diary/mood-5.png',
  },
];

/** 처음 고를 때 가운데보다 한 칸 밝은 '기분 좋음'에서 시작한다(시안 기준 화면). */
export const DEFAULT_MOOD = 3;

// 예전에는 날짜만 키로 기기 전체에 저장해(metame-moods) 어느 계정의 기분인지 알 수 없었다.
// 다른 계정의 기록에 섞이지 않게 그 저장본은 버리고, 지금은 계정별 기기 저장소(UserLocal.moods)에 둔다.
try {
  globalThis.localStorage?.removeItem('metame-moods');
} catch {}

const EMPTY_MOODS: Record<string, number> = {};

/** 지금 계정이 날짜별로 고른 기분(YYYY-MM-DD → 기분 번호). */
export function useMoods(): Record<string, number> {
  const userId = useAuthStore((s) => s.userId);
  return useLocalStore((s) => (userId ? s.byUser[userId]?.moods : undefined)) ?? EMPTY_MOODS;
}

/** 그날(YYYY-MM-DD) 지금 계정이 고른 기분 번호. 없으면 undefined */
export function getMood(date: string = toDateKey(new Date())): number | undefined {
  const { userId } = useAuthStore.getState();
  const v = userId ? useLocalStore.getState().byUser[userId]?.moods?.[date] : undefined;
  return typeof v === 'number' && MOODS[v] ? v : undefined;
}

/** 지금 계정의 그날 기분을 저장한다. 로그인하지 않았으면 저장하지 않는다. */
export function saveMood(index: number, date: string = toDateKey(new Date())) {
  const { userId } = useAuthStore.getState();
  if (!userId) return;
  useLocalStore.getState().update(userId, (u) => ({ ...u, moods: { ...u.moods, [date]: index } }));
}

/**
 * 다크 모드에 맞춘 기분 색. useTheme()의 fg·bg를 넘긴다(라이트에서는 그대로 돌려준다).
 * 배경 그라데이션은 디자인 시스템의 다크 기분 배경으로, 연한 카드·막대는 같은 색조의 어두운 면으로,
 * 진한 글자는 밝은 톤으로 바뀐다. 점·버튼 색은 그대로 둔다.
 */
export function themedMood(m: Mood, t: { fg: (c: string) => string; bg: (c: string) => string }): Mood {
  return {
    ...m,
    bg: [t.bg(m.bg[0]), t.bg(m.bg[1])],
    card: t.bg(m.card),
    track: t.bg(m.track),
    ink: t.fg(m.ink),
    sub: t.fg(m.sub),
    label2: t.fg(m.label2),
  };
}
