const toDateKey = (d: Date) => d.toLocaleDateString('sv-SE');

/**
 * 기록한 날짜(YYYY-MM-DD) 목록으로 연속 기록일을 센다.
 * 오늘 아직 기록하지 않았으면 어제부터 거슬러 센다(오늘 안 썼다고 연속이 끊긴 건 아니므로).
 */
export function countStreak(recordedDates: Iterable<string>, today = new Date()): number {
  const days = new Set(recordedDates);
  const d = new Date(today);
  if (!days.has(toDateKey(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(toDateKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
