'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store';
import { useMe } from '@/hooks/useMe';
import { useExportRecords } from '@/hooks/useExportRecords';
import { downloadExportHtml, groupByMonth, summarize, toEntries } from '@/lib/recordExport';
import { Screen } from '@/components/ui/Screen';
import { Button, TopBar } from '@/components/ui/primitives';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-card border border-line px-4 py-3.5">
      <p className="text-[22px] font-bold text-ink">{value}</p>
      <p className="text-[12px] text-sub">{label}</p>
    </div>
  );
}

export default function ExportRecordsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const me = useMe();
  const { data, isError, refetch, isFetching } = useExportRecords(!!accessToken);

  const entries = useMemo(() => toEntries(data ?? []), [data]);
  const summary = useMemo(() => summarize(entries), [entries]);
  const months = useMemo(() => groupByMonth(entries), [entries]);

  const footer =
    entries.length > 0 ? (
      <Button onClick={() => downloadExportHtml(entries, me.nickname)}>파일로 저장하기</Button>
    ) : undefined;

  return (
    <Screen footer={footer}>
      <TopBar title="기록 내보내기" backHref="/settings" />
      <div className="px-5 pb-8">
        {!data && !isError && <p className="text-center text-[14px] text-sub mt-24">기록을 모으는 중...</p>}
        {isError && (
          <div className="text-center mt-24">
            <p className="text-[14px] text-sub">기록을 불러오지 못했어요.</p>
            <button onClick={() => refetch()} disabled={isFetching} className="mt-3 text-[14px] font-semibold text-primary">
              다시 시도
            </button>
          </div>
        )}
        {data && entries.length === 0 && (
          <p className="text-center text-[15px] font-semibold text-ink mt-24">아직 내보낼 기록이 없어요</p>
        )}

        {entries.length > 0 && (
          <>
            <p className="font-mono text-[13px] text-sub mt-1">
              {summary.from} – {summary.to}
            </p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Stat value={summary.total} label="전체 기록" />
              <Stat value={summary.months} label="기록한 달" />
              <Stat value={summary.myselfMoments} label="나다운 순간" />
            </div>
            {summary.topTags.length > 0 && (
              <div className="rounded-2xl bg-card border border-line px-4 py-3.5 mt-2">
                <p className="text-[12px] font-semibold text-sub">자주 느낀 감정</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {summary.topTags.map((t) => (
                    <span key={t.tag} className="h-6 px-2.5 rounded-full bg-primary-soft text-[12px] font-semibold text-primary inline-flex items-center">
                      {t.tag} {t.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {months.map(([month, items]) => (
              <section key={month} className="mt-6">
                <p className="font-mono text-[13px] text-sub mb-2.5">
                  {month} · {items.length}개
                </p>
                <div className="flex flex-col gap-3">
                  {items.map((e) => (
                    <article key={e.id} className="rounded-2xl bg-card border border-line px-4 py-4">
                      <p className="font-mono text-[12px] text-sub">
                        {e.date} ({e.weekday})
                      </p>
                      {e.question && <p className="text-[15px] font-bold text-ink mt-1.5">Q. {e.question}</p>}
                      {e.answer && <p className="text-[14px] text-ink leading-[1.7] mt-1.5 whitespace-pre-line">{e.answer}</p>}
                      {e.scene && (
                        <>
                          <p className="text-[12px] font-semibold text-primary mt-3">기억나는 장면</p>
                          <p className="text-[14px] text-[#48484F] leading-[1.7] mt-0.5 whitespace-pre-line">{e.scene}</p>
                        </>
                      )}
                      {e.myselfMoment && (
                        <>
                          <p className="text-[12px] font-semibold text-primary mt-3">나다운 순간</p>
                          <p className="text-[14px] text-[#48484F] leading-[1.7] mt-0.5 whitespace-pre-line">{e.myselfMoment}</p>
                        </>
                      )}
                      {e.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {e.tags.map((t) => (
                            <span key={t} className="h-6 px-2.5 rounded-full bg-primary-soft text-[12px] font-semibold text-primary inline-flex items-center">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </Screen>
  );
}
