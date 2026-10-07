'use client';

import { useState } from 'react';
import { Screen } from '@/components/ui/Screen';
import { ChatFab, TopBar } from '@/components/ui/primitives';
import { MyTabs } from '@/components/ui/MyTabs';
import { AskSheet } from '@/components/ui/AskSheet';
import { ContentList, ReportLocked } from '@/components/ui/report';
import { MIN_RECORDS_FOR_REPORT, pickContent, useWeeklyReport } from '@/hooks/useWeeklyReport';

export default function MyReportPage() {
  const [ask, setAsk] = useState(false);
  const r = useWeeklyReport();
  const c = r.report?.content;

  return (
    <Screen
      bg="#F2F2F7"
      overlay={
        <>
          <ChatFab className="absolute right-5 bottom-6 z-20" onClick={() => setAsk(true)} />
          <AskSheet open={ask} onClose={() => setAsk(false)} context="리포트 미" />
        </>
      }
    >
      <div className="bg-white">
        <TopBar title="리포트 미" backHref="/mypage" />
        <MyTabs active="report" />
      </div>
      <div className="px-4 pt-4 pb-24 flex flex-col gap-3">
        <div className="rounded-3xl bg-primary px-5 py-5">
          <p className="text-[13px] text-white/75">현재 메타인지 정확도</p>
          <p className="text-[34px] font-bold text-white leading-none mt-3">{r.accuracy}%</p>
          <div className="flex gap-6 mt-4 text-white">
            <div>
              <p className="text-[18px] font-bold">{r.recordCount}</p>
              <p className="text-[12px] text-white/70">이번 주 기록</p>
            </div>
            <div>
              <p className="text-[18px] font-bold">{r.streak}</p>
              <p className="text-[12px] text-white/70">연속 기록일</p>
            </div>
          </div>
        </div>
        {r.report ? (
          <>
            <ContentList title="강점" items={pickContent(c, ['strengths', 'strength'])} />
            <ContentList title="약점" items={pickContent(c, ['weaknesses', 'weakness'])} />
            <ContentList title="키워드" items={pickContent(c, ['interests', 'keywords'])} />
          </>
        ) : (
          !r.loading && (
            <ReportLocked recordCount={r.recordCount} min={MIN_RECORDS_FOR_REPORT} canGenerate={r.canGenerate} generating={r.generating} onGenerate={r.generate} error={r.error} />
          )
        )}
      </div>
    </Screen>
  );
}
