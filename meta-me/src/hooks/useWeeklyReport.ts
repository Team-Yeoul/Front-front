import { toDateKey } from '@/lib/date';
import { useAuthStore } from '@/store';
import { useListDailyRecords } from '@/entities/diary';
import { useGenerateReport, useListReports } from '@/entities/report';
import { useGetMyProfile } from '@/entities/user';
import { useStreak } from '@/lib/streak';
import { useAccountToday } from '@/hooks/useSaveTodayRecord';

/** 리포트를 만들 수 있는 이번 주 최소 기록 수 */
export const MIN_RECORDS_FOR_REPORT = 3;

const toKey = toDateKey;

function weekRange(now: Date) {
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // 월요일 시작
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toKey(start), end: toKey(end), label: `${start.getMonth() + 1}월 ${start.getDate()}일 주간` };
}

/** 이번 주 기록 수·연속 기록일·정확도와, 서버에 있는 최신 주간 리포트. */
export function useWeeklyReport() {
  const token = useAuthStore((s) => s.accessToken);
  // 서버가 recorded_date를 계정 시간대로 정하므로 오늘·이번 주도 그 기준으로 잡는다.
  const { today: todayDate, todayKey: today } = useAccountToday();
  const week = weekRange(todayDate);
  const {
    data: weekRecords,
    isError: recordsFailed,
    refetch: refetchRecords,
    isFetching: recordsFetching,
    isPending: recordsQueryPending,
  } = useListDailyRecords({ start_date: week.start, end_date: week.end, size: 50 }, !!token);
  // 필터 없이 최근 리포트를 받아 이번 주 주간(WEEKLY) 리포트만 고른다.
  const { data: reports, isLoading, isError: reportsFailed, refetch: refetchReports } = useListReports({ size: 20 }, !!token);
  const { data: profile } = useGetMyProfile(!!token);
  const generate = useGenerateReport();

  const { streak, loaded: streakLoaded, failed: streakFailed, retry: retryStreak } = useStreak(todayDate, !!token);

  const recordCount = weekRecords?.records.length ?? 0;
  // 지난 주 리포트를 이번 주 것으로 보이지 않게, 기간에 오늘이 들어 있는 주간 리포트만 고른다.
  const report =
    reports?.reports?.find(
      (r) => r.report_type === 'WEEKLY' && r.period_start.slice(0, 10) <= today && today <= r.period_end.slice(0, 10),
    ) ?? null;
  const error = reportsFailed
    ? '리포트를 불러오지 못했어요'
    : generate.isError
      ? '리포트를 만들지 못했어요. 잠시 후 다시 시도해 주세요'
      : '';
  return {
    week,
    /** 이번 주 기록 목록 */
    records: weekRecords?.records ?? [],
    /** 이번 주 기록 목록을 못 불러왔는지(빈 그래프를 '기록 없음'으로 보이지 않게 쓴다) */
    recordsFailed: recordsFailed && !weekRecords,
    /** 이번 주 기록 목록을 아직 받는 중인지. 받기 전에는 0개(빈 주)로 보이지 않게 자리만 잡아 둔다. */
    recordsPending: !!token && !weekRecords && !recordsFailed && recordsQueryPending,
    retryRecords: () => void refetchRecords(),
    recordsRetrying: recordsFetching,
    recordCount,
    /** 연속 기록일. 받는 중이거나 못 받았으면 null(0일과 구분한다). */
    streak: streakLoaded && !streakFailed ? streak : null,
    streakFailed,
    retryStreak,
    /** 가장 최근에 측정한 문장 정확도. 아직 측정한 적이 없거나 못 불러왔으면 null(0%와 구분한다). */
    accuracy: profile?.latest_accuracy?.accuracy_percent ?? null,
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

/**
 * AI 종합 분석 문장. v1 리포트는 narrative.headline · narrative.body에 담겨 온다.
 * 예전 형식의 리포트를 위해 summary 등 이전 키를 대신 읽는다.
 */
export function reportNarrative(content: Record<string, unknown> | undefined): string[] {
  const n = content?.narrative as { headline?: unknown; body?: unknown } | undefined;
  const lines = [n?.headline, n?.body].filter((v): v is string => typeof v === 'string' && !!v.trim());
  return lines.length > 0 ? lines : pickContent(content, ['summary', 'ai_summary', 'overview', 'analysis']);
}
