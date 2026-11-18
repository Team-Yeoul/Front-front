const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * 기기 시간대 기준 YYYY-MM-DD.
 * 웹은 toLocaleDateString('sv-SE')를 썼지만, 앱 JS 엔진(Hermes)의 로케일 지원이 플랫폼마다 달라 직접 만든다.
 */
export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
