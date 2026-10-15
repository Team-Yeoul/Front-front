import { useMutation, useQueryClient } from '@tanstack/react-query';
import { diaryApi, diaryKeys } from '@/entities/diary';
import type { SubmitDailyRecordRequest } from '@/entities/diary';
import { ApiError } from '@/shared/api';

const today = () => new Date().toLocaleDateString('sv-SE');

const findTodayRecord = async () => {
  const { records } = await diaryApi.listDailyRecords({ start_date: today(), end_date: today(), size: 1 });
  return records[0];
};

/**
 * 오늘의 기록을 저장한다. 데일리 기록은 하루 1건이라(409 DIARY_RECORD_ALREADY_EXISTS),
 * 오늘 기록이 있는지 먼저 찾아서 있으면 PATCH로 갱신하고, 없을 때만 새로 만든다.
 * 조회와 생성 사이에 다른 곳에서 먼저 만들어 409가 나면 그 기록을 갱신한다.
 */
export function useSaveTodayRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: SubmitDailyRecordRequest) => {
      const existing = await findTodayRecord();
      if (existing) return diaryApi.updateDailyRecord(existing.record_id, body);
      try {
        return await diaryApi.createDailyRecord(body);
      } catch (err) {
        if (!(err instanceof ApiError) || (err.code !== 'DIARY_RECORD_ALREADY_EXISTS' && err.status !== 409)) throw err;
        const record = await findTodayRecord();
        if (!record) throw err;
        return diaryApi.updateDailyRecord(record.record_id, body);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diaryKeys.all }),
  });
}
