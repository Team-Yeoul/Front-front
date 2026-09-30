'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useGetDailyRecord, useListDailyRecords } from '@/entities/diary';
import type { DailyRecord } from '@/entities/diary';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/primitives';
import { MOCK_DIARIES } from '@/lib/mock';

type Filter = 'all' | 'objectified' | 'draft';

const toDot = (iso: string) => new Date(iso).toLocaleDateString('sv-SE').replaceAll('-', '.');

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
  return <DiaryCard title={title} date={toDot(record.created_at)} tags={tags} onClick={() => router.push(`/diary/${record.record_id}`)} />;
}

export default function DiaryListPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data } = useListDailyRecords({ size: 50 }, !!accessToken);
  const [filter, setFilter] = useState<Filter>('all');

  const real = !!accessToken && !!data;

  const groups = useMemo(() => {
    const map = new Map<string, { key: string; node: React.ReactNode }[]>();
    const push = (month: string, key: string, node: React.ReactNode) => {
      if (!map.has(month)) map.set(month, []);
      map.get(month)!.push({ key, node });
    };
    if (real) {
      for (const r of data.records) push(toDot(r.created_at).slice(0, 7), r.record_id, <RealDiaryCard record={r} />);
    } else {
      for (const d of MOCK_DIARIES.filter((x) => filter === 'all' || x.status === filter)) {
        push(d.date.slice(0, 7), d.id, <DiaryCard title={d.title} date={d.date} tags={d.tags} onClick={() => router.push(`/diary/${d.id}`)} />);
      }
    }
    return [...map.entries()];
  }, [real, data, filter, router]);

  // 임시저장 상태는 API에 없어 로그인 시엔 모든 기록을 객관화 완료로 센다.
  const counts = real ? { all: data.records.length, objectified: data.records.length, draft: 0 } : { all: 42, objectified: 28, draft: 3 };

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
        {groups.length === 0 && <p className="text-center text-[14px] text-sub mt-16">아직 기록이 없어요.</p>}
      </div>
    </Screen>
  );
}
