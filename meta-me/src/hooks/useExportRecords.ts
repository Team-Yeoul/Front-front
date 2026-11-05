'use client';

import { useQuery } from '@tanstack/react-query';
import { diaryApi, diaryKeys } from '@/entities/diary';
import type { DailyRecord, DailyRecordResponse } from '@/entities/diary';

const PAGE_SIZE = 100;
// 응답이 이상해도 무한히 돌지 않도록 막는 상한 (100 × 50 = 5000건)
const MAX_PAGES = 50;
// 상세 조회를 한꺼번에 몰아 보내지 않도록 몇 개씩 나눠 보낸다.
const DETAIL_CONCURRENCY = 5;

async function fetchAllRecords(): Promise<DailyRecordResponse[]> {
  const records: DailyRecord[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await diaryApi.listDailyRecords({ page, size: PAGE_SIZE });
    records.push(...(res.records ?? []));
    const totalPages = res.page_info?.total_pages ?? 1;
    if (!res.records?.length || page >= totalPages) break;
  }

  // 목록에는 본문이 없어 기록마다 상세를 불러와야 한다.
  const details: DailyRecordResponse[] = [];
  for (let i = 0; i < records.length; i += DETAIL_CONCURRENCY) {
    const chunk = records.slice(i, i + DETAIL_CONCURRENCY);
    details.push(...(await Promise.all(chunk.map((r) => diaryApi.getDailyRecord(r.record_id)))));
  }
  return details.sort((a, b) => b.record.recorded_date.localeCompare(a.record.recorded_date));
}

/** 내보내기 화면용: 내 기록 전체를 본문까지 불러온다. */
export const useExportRecords = (enabled = true) =>
  useQuery({
    queryKey: [...diaryKeys.all, 'export'] as const,
    queryFn: fetchAllRecords,
    enabled,
  });
