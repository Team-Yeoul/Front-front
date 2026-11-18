import { toDateKey } from '@/lib/date';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { diaryApi, diaryKeys, useListDailyRecords } from '@/entities/diary';
import type { SubmitDailyRecordRequest } from '@/entities/diary';
import { ApiError } from '@/shared/api';
import { useAuthStore } from '@/store';

const today = () => toDateKey(new Date());

/** 오늘 기록이 이미 있어서 새로 만들 수 없을 때. recordId가 있으면 수정 화면으로 보낼 수 있다. */
export class TodayRecordExistsError extends Error {
  constructor(readonly recordId: string | null) {
    super('오늘 기록이 이미 있어요');
    this.name = 'TodayRecordExistsError';
  }
}

/**
 * 오늘의 기록을 새로 저장한다. 데일리 기록은 하루 1건이라(409 DIARY_RECORD_ALREADY_EXISTS),
 * 이미 있으면 기존 기록을 덮어쓰지 않고 {@link TodayRecordExistsError}를 던져 수정 화면으로 안내하게 한다.
 */
export function useSaveTodayRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: SubmitDailyRecordRequest) => {
      try {
        return await diaryApi.createDailyRecord(body);
      } catch (err) {
        if (!(err instanceof ApiError) || (err.code !== 'DIARY_RECORD_ALREADY_EXISTS' && err.status !== 409)) throw err;
        // 서버의 '오늘'은 사용자 timezone 기준이라 기기 날짜로 못 찾을 수 있다. 최근 기록 중 가장 늦은 날짜를 고른다.
        const { records } = await diaryApi.listDailyRecords({ size: 5 }).catch(() => ({ records: [] }));
        const latest = [...records].sort((a, b) => b.recorded_date.localeCompare(a.recorded_date))[0];
        throw new TodayRecordExistsError(latest?.record_id ?? null);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diaryKeys.all }),
  });
}

/** 오늘 이미 남긴 기록. 새로 쓰기 화면에 들어오기 전에 확인해 덮어쓰기 대신 수정으로 안내한다. */
export function useTodayRecord(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const key = today();
  const { data, isLoading } = useListDailyRecords({ start_date: key, end_date: key, size: 1 }, enabled && !!accessToken);
  return { record: data?.records.find((r) => r.recorded_date === key) ?? null, isLoading: enabled && !!accessToken && isLoading };
}
