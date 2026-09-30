'use client';

import { Card, ReportScreen } from '@/components/ui/report';
import { MOCK_REPORT } from '@/lib/mock';

export default function ReportStrengthsPage() {
  return (
    <ReportScreen eyebrow="FINDING" title="발견된 강점 / 약점" sub="근거가 된 기록 횟수를 함께 표시했어요">
      <Card>
        <p className="text-[16px] font-bold text-ink">강점 TOP 3</p>
        <div className="divide-y divide-[#E6E6EC]">
          {MOCK_REPORT.strengths.map((s) => (
            <div key={s.title} className="py-3.5 first:pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-bold text-ink">{s.title}</span>
                <span className="text-[13px] text-sub">{s.count}회</span>
              </div>
              <p className="text-[13px] text-sub mt-1.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-[16px] font-bold text-ink">주의할 패턴 TOP 3</p>
        <div className="flex flex-col gap-2 mt-4">
          {MOCK_REPORT.cautions.map((c) => (
            <div key={c.title} className="flex items-center justify-between rounded-xl bg-[#EDEDF2] px-4 h-11">
              <span className="text-[14px] text-ink">{c.title}</span>
              <span className="text-[13px] text-sub">{c.count}회</span>
            </div>
          ))}
        </div>
      </Card>
    </ReportScreen>
  );
}
