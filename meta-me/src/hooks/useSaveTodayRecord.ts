import { useMutation, useQueryClient } from '@tanstack/react-query';
import { diaryApi, diaryKeys } from '@/entities/diary';
import type { SubmitDailyRecordRequest } from '@/entities/diary';
import { ApiError } from '@/shared/api';

const today = () => new Date().toLocaleDateString('sv-SE');

/**
 * 오늘의 기록을 저장한다. 데일리 기록은 하루 1건이라(409 DIARY_RECORD_ALREADY_EXISTS),
 * 오늘 기록이 이미 있으면 그 기록을 찾아 PATCH로 갱신한다.
 */
export function useSaveTodayRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: SubmitDailyRecordRequest) => {
      try {
        return await diaryApi.createDailyRecord(body);
      } catch (err) {
        if (!(err instanceof ApiError) || (err.code !== 'DIARY_RECORD_ALREADY_EXISTS' && err.status !== 409)) throw err;
        const { records } = await diaryApi.listDailyRecords({ start_date: today(), end_date: today(), size: 1 });
        if (!records[0]) throw err;
        return diaryApi.updateDailyRecord(records[0].record_id, body);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diaryKeys.all }),
  });
}
