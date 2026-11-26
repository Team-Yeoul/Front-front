/** 알림함 시간 표시와 구간 나누기. 화면과 따로 두어 화면 없이도 시험할 수 있게 한다. */
const pad2 = (n: number) => String(n).padStart(2, '0');
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const clock = (d: Date) => `${d.getHours() < 12 ? '오전' : '오후'} ${d.getHours() % 12 || 12}:${pad2(d.getMinutes())}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** '10분 전' · '3시간 전' · '어제 오후 9:00' · '월요일' · '11월 2일' */
export function timeLabel(iso: string, now: Date) {
  const d = new Date(iso);
  const min = Math.floor((now.getTime() - d.getTime()) / 60000);
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (days <= 0) return min < 1 ? '방금' : min < 60 ? `${min}분 전` : `${Math.floor(min / 60)}시간 전`;
  if (days === 1) return `어제 ${clock(d)}`;
  if (days < 7) return `${WEEK[d.getDay()]}요일`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function sectionOf(iso: string, now: Date) {
  const days = Math.round((startOfDay(now) - startOfDay(new Date(iso))) / 86400000);
  return days <= 0 ? '오늘' : days < 7 ? '이번 주' : '이전 알림';
}
