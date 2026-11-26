const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * 기기 시간대 기준 YYYY-MM-DD.
 * 웹은 toLocaleDateString('sv-SE')를 썼지만, 앱 JS 엔진(Hermes)의 로케일 지원이 플랫폼마다 달라 직접 만든다.
 * 서버 recorded_date와 비교할 '오늘'은 기기 날짜가 아니라 {@link todayIn}으로 만든다.
 */
export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** 서버가 recorded_date를 정하는 기본 시간대(NotificationSetting.timezone 기본값) */
export const DEFAULT_TIMEZONE = 'Asia/Seoul';

/**
 * timeZone 기준 오늘 날짜를, 그 연·월·일을 가진 기기 시각 자정 Date로 돌려준다.
 * 서버는 recorded_date를 계정 시간대로 정하므로, 해외에서도 '오늘'·이번 주·연속 기록이 서버와 같은 날을 가리키게 한다.
 * 결과는 setDate 같은 달력 계산을 그대로 쓰고 toDateKey로 recorded_date와 비교하면 된다.
 */
export function todayIn(timeZone: string = DEFAULT_TIMEZONE, now: Date = new Date()): Date {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const [y, m, d] = [get('year'), get('month'), get('day')];
    if (y && m && d) return new Date(y, m - 1, d);
  } catch {
    // 시간대 이름을 모르는 기기면 기기 날짜로 대신한다.
  }
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
