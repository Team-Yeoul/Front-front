import { useAuthStore } from '@/store';
import { useListDailyRecords } from '@/entities/diary';
import { useGenerateReport, useListReports } from '@/entities/report';
import { useGetMyProfile } from '@/entities/user';

/** 리포트를 만들 수 있는 이번 주 최소 기록 수 */
export const MIN_RECORDS_FOR_REPORT = 3;

const toKey = (d: Date) => d.toLocaleDateString('sv-SE');

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
  const { data: reports, isLoading } = useListReports({ report_type: 'WEEK', size: 1 }, !!token);
  const { data: profile } = useGetMyProfile(!!token);
  const generate = useGenerateReport();

  const days = new Set((allRecords?.records ?? []).map((r) => r.recorded_date));
  let streak = 0;
  const d = new Date();
  if (!days.has(toKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(toKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  const recordCount = weekRecords?.records.length ?? 0;
  return {
    week,
    recordCount,
    streak,
    accuracy: profile?.latest_accuracy?.accuracy_percent ?? 0,
    report: reports?.reports[0] ?? null,
    loading: isLoading,
    canGenerate: recordCount >= MIN_RECORDS_FOR_REPORT,
    generating: generate.isPending,
    generate: () => generate.mutate({ report_type: 'WEEKLY', period_start: week.start, period_end: week.end }),
  };
}

/** 리포트 content(JSON) 중 원하는 키를 찾아 문자열 목록으로 만든다. */
export function pickContent(content: Record<string, unknown> | undefined, keys: string[]): string[] {
  if (!content) return [];
  for (const k of keys) {
    const v = content[k];
    if (Array.isArray(v)) return v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x)));
    if (typeof v === 'string' && v.trim()) return [v];
    if (typeof v === 'number') return [String(v)];
  }
  return [];
}
