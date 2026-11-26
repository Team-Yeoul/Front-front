import { useQuery } from '@tanstack/react-query';
import { diaryApi, diaryKeys } from '@/entities/diary';
import { toDateKey } from './date';

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

/** 한 번에 받는 기록 수와, 끝없이 받지 않도록 둔 최대 페이지 수 */
const STREAK_PAGE_SIZE = 100;
const STREAK_MAX_PAGES = 40;

/** 받은 날짜만으로 연속이 끊긴 지점까지 확인됐는지: 연속이 시작되기 전날이 받은 범위 안이면 더 받을 필요가 없다. */
function runEndedWithin(dates: Set<string>, today: Date, oldestKey: string) {
  const streak = countStreak(dates, today);
  const before = new Date(today);
  before.setDate(before.getDate() - streak - (dates.has(toDateKey(today)) ? 0 : 1));
  return toDateKey(before) >= oldestKey;
}

/**
 * 연속 기록일. 목록은 한 페이지(최대 100개)씩 오므로, 이어진 날이 끊길 때까지 다음 페이지를 더 받는다.
 * today는 계정 시간대 기준 오늘(useAccountToday)을 넘긴다. 받은 기록 날짜도 함께 돌려준다.
 * 요청이 실패하면(뒤 페이지 실패 포함) 0일로 보이지 않도록 failed와 retry를 함께 돌려준다.
 * 성공했는데 이어진 날이 없으면 streak는 0이다.
 */
export function useStreak(today: Date, enabled = true) {
  const todayKey = toDateKey(today);
  const { data, isPending, isError, isRefetching, refetch } = useQuery({
    // diaryKeys.all 아래에 두어 기록을 저장·수정·삭제하면 함께 다시 센다.
    queryKey: [...diaryKeys.recordLists(), 'streak', todayKey],
    enabled,
    queryFn: async () => {
      const dates = new Set<string>();
      for (let page = 1; page <= STREAK_MAX_PAGES; page++) {
        const res = await diaryApi.listDailyRecords({ size: STREAK_PAGE_SIZE, page });
        res.records.forEach((r) => dates.add(r.recorded_date));
        if (res.records.length === 0 || page >= (res.page_info?.total_pages ?? 1)) break;
        const oldest = res.records.reduce((min, r) => (r.recorded_date < min ? r.recorded_date : min), todayKey);
        if (runEndedWithin(dates, today, oldest)) break;
      }
      return [...dates];
    },
  });
  const recorded = new Set(data ?? []);
  // 예전에 받은 값이 있으면 다시 받다 실패해도 그 값을 그대로 보여 준다.
  const failed = isError && !data;
  return {
    streak: countStreak(recorded, today),
    recorded,
    loaded: !isPending || !enabled,
    failed,
    retrying: isRefetching,
    retry: () => void refetch(),
  };
}
