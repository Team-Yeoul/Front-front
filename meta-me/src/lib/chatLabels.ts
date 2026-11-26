import { toDateKey } from '@/lib/date';
import type { SavedChat } from '@/store';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/** 오늘 / 어제 / 8월 1일 · 금 */
export function dayGroup(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const key = toDateKey;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (key(d) === key(today)) return '오늘';
  if (key(d) === key(yesterday)) return '어제';
  return `${d.getMonth() + 1}월 ${d.getDate()}일 · ${WEEK[d.getDay()]}`;
}

export const hhmm = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const chatKindLabel = (c: SavedChat) => (c.kind === 'analysis' ? '분석 질문' : '자유 대화');

/** 목록 제목: 분석 질문은 내가 처음 한 질문, 자유 대화는 AI의 첫 질문. 메시지를 아직 못 불러온 서버 대화는 종류 이름. */
export function chatTitle(c: SavedChat) {
  const firstUser = c.messages.find((m) => m.role === 'user')?.text ?? '';
  const title = c.kind === 'analysis' ? firstUser : (c.messages.find((m) => m.role === 'ai')?.text.split(/(?<=[?.!])\s/)[0] ?? firstUser);
  return title || chatKindLabel(c);
}

export function chatPreview(c: SavedChat) {
  const firstUser = c.messages.findIndex((m) => m.role === 'user');
  const after = c.kind === 'analysis' ? c.messages.slice(firstUser + 1).find((m) => m.role === 'ai') : c.messages[firstUser];
  return after?.text ?? '';
}
