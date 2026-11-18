import { toDateKey } from '@/lib/date';
import { useAuthStore } from '@/store';
import { useListDailyRecords } from '@/entities/diary';
import { useGenerateReport, useListReports } from '@/entities/report';
import { useGetMyProfile } from '@/entities/user';
import { countStreak } from '@/lib/streak';

/** 리포트를 만들 수 있는 이번 주 최소 기록 수 */
export const MIN_RECORDS_FOR_REPORT = 3;

const toKey = toDateKey;

function weekRange(now = new Date()) {
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // 월요일 시작
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toKey(start), end: toKey(end), label: `${start.getMonth() + 1}월 ${start.getDate()}일 주간` };
}

/** 이번 주 기록 수·연속 기록일·정확도와, 서버에 있는 최신 주간 리포트. */
export function useWeeklyReport() {
  const token = useAuthStore((s) => s.accessToken);
  const week = weekRange();
  const { data: weekRecords } = useListDailyRecords({ start_date: week.start, end_date: week.end, size: 50 }, !!token);
  const { data: allRecords } = useListDailyRecords({ size: 100 }, !!token);
  // 목록 필터는 명세상 WEEK인데 서버가 400으로 거절하고, 리포트 자체는 WEEKLY로 내려온다.
  // 필터 값 불일치를 피하려고 필터 없이 받아 주간 리포트만 고른다.
  const { data: reports, isLoading, isError: reportsFailed, refetch: refetchReports } = useListReports({ size: 20 }, !!token);
  const { data: profile } = useGetMyProfile(!!token);
  const generate = useGenerateReport();

  const streak = countStreak((allRecords?.records ?? []).map((r) => r.recorded_date));

  const recordCount = weekRecords?.records.length ?? 0;
  // 지난 주 리포트를 이번 주 것으로 보이지 않게, 기간에 오늘이 들어 있는 주간 리포트만 고른다.
  const today = toKey(new Date());
  const report =
    reports?.reports.find(
      (r) => r.report_type === 'WEEKLY' && r.period_start.slice(0, 10) <= today && today <= r.period_end.slice(0, 10),
    ) ?? null;
  const error = reportsFailed
    ? '리포트를 불러오지 못했어요'
    : generate.isError
      ? '리포트를 만들지 못했어요. 잠시 후 다시 시도해 주세요'
      : '';
  return {
    week,
    recordCount,
    streak,
    accuracy: profile?.latest_accuracy?.accuracy_percent ?? 0,
    report,
    loading: isLoading,
    canGenerate: recordCount >= MIN_RECORDS_FOR_REPORT,
    generating: generate.isPending,
    error,
    generate: () =>
      reportsFailed ? refetchReports() : generate.mutate({ report_type: 'WEEKLY', period_start: week.start, period_end: week.end }),
  };
}

/** 배열 원소가 객체일 때 JSON 원문 대신 사람이 읽을 문장 필드를 고른다. */
function toText(x: unknown): string {
  if (typeof x === 'string') return x;
  if (typeof x === 'number') return String(x);
  if (x && typeof x === 'object') {
    for (const k of ['text', 'title', 'content', 'description', 'name', 'keyword', 'sentence']) {
      const v = (x as Record<string, unknown>)[k];
      if (typeof v === 'string' && v.trim()) return v;
    }
  }
  return '';
}

/** 리포트 content(JSON) 중 원하는 키를 찾아 문자열 목록으로 만든다. */
export function pickContent(content: Record<string, unknown> | undefined, keys: string[]): string[] {
  if (!content) return [];
  for (const k of keys) {
    const v = content[k];
    if (Array.isArray(v)) return v.map(toText).filter(Boolean);
    if (typeof v === 'string' && v.trim()) return [v];
    if (typeof v === 'number') return [String(v)];
  }
  return [];
}
