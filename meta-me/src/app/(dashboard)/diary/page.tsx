'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useGetDailyRecord, useListDailyRecords } from '@/entities/diary';
import type { DailyRecord } from '@/entities/diary';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/primitives';

type Filter = 'all' | 'objectified' | 'draft';


function DiaryCard({ title, date, tags, onClick }: { title: string; date: string; tags: string[]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full rounded-2xl bg-card border border-line px-4 pt-4 pb-3.5 text-left">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[16px] font-bold text-ink">{title}</span>
        <span className="font-mono text-[13px] text-sub shrink-0">{date.slice(5)}</span>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {tags.map((t) => (
            <span key={t} className="h-6 px-2.5 rounded-full bg-primary-soft text-[12px] font-semibold text-primary inline-flex items-center">
              {t}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

function RealDiaryCard({ record }: { record: DailyRecord }) {
  const router = useRouter();
  const { data } = useGetDailyRecord(record.record_id);
  const q = data?.questions[0];
  const raw = q?.scene_description || q?.user_answer;
  const title = raw && /[가-힣]/.test(raw) ? raw : '기록 보기';
  const tags = (q?.emotion_tag ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t && /[가-힣]/.test(t))
    .slice(0, 3);
  return <DiaryCard title={title} date={record.recorded_date.replaceAll('-', '.')} tags={tags} onClick={() => router.push(`/diary/${record.record_id}`)} />;
}

export default function DiaryListPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data, isError } = useListDailyRecords({ size: 50 }, !!accessToken);
  const [filter, setFilter] = useState<Filter>('all');

  const records = useMemo(() => data?.records ?? [], [data]);

  const groups = useMemo(() => {
    const map = new Map<string, { key: string; node: React.ReactNode }[]>();
    const push = (month: string, key: string, node: React.ReactNode) => {
      if (!map.has(month)) map.set(month, []);
      map.get(month)!.push({ key, node });
    };
    // 임시저장 상태는 API에 없어 모든 기록을 객관화 완료로 본다.
    if (filter !== 'draft') {
      for (const r of records) push(r.recorded_date.replaceAll('-', '.').slice(0, 7), r.record_id, <RealDiaryCard record={r} />);
    }
    return [...map.entries()];
  }, [records, filter]);

  const counts = { all: data?.page_info?.total_elements ?? records.length, objectified: data?.page_info?.total_elements ?? records.length, draft: 0 };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: `전체 ${counts.all}` },
    { key: 'objectified', label: `객관화 완료 ${counts.objectified}` },
    { key: 'draft', label: `임시저장 ${counts.draft}` },
  ];

  return (
    <Screen
      nav
      overlay={
        <button
          onClick={() => router.push('/diary/write')}
          className="absolute right-5 bottom-[88px] z-20 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_8px_24px_rgba(99,103,255,0.4)]"
          aria-label="새 기록 쓰기"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
      }
    >
      <TopBar title="다이어리" backHref="/main" right={<button className="text-[14px] font-semibold text-primary">검색</button>} />
      <div className="flex gap-2 px-5 mt-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`h-9 px-3.5 rounded-full text-[14px] ${filter === f.key ? 'bg-ink text-white font-semibold' : 'bg-surface-2 text-[#48484F]'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="px-5 pb-24">
        {groups.map(([month, items]) => (
          <section key={month} className="mt-5">
            <p className="font-mono text-[13px] text-sub mb-2.5">{month}</p>
            <div className="flex flex-col gap-3">
              {items.map((it) => (
                <div key={it.key}>{it.node}</div>
              ))}
            </div>
          </section>
        ))}
        {isError && <p className="text-center text-[14px] text-sub mt-20">기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
        {data && groups.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-[15px] font-semibold text-ink">{filter === 'draft' ? '임시저장한 기록이 없어요' : '아직 남긴 기록이 없어요'}</p>
            <p className="text-[13px] text-sub mt-1.5">+ 버튼을 눌러 첫 기록을 남겨보세요</p>
          </div>
        )}
      </div>
    </Screen>
  );
}
