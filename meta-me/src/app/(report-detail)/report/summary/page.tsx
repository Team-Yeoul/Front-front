'use client';

import { useAuthStore } from '@/store';
import { useGetMyProfile } from '@/entities/user';
import { Card, ReportScreen, RingDonut } from '@/components/ui/report';
import { MOCK_REPORT } from '@/lib/mock';

export default function ReportSummaryPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  const accuracy = accessToken ? (profile?.latest_accuracy?.accuracy_percent ?? 0) : MOCK_REPORT.accuracy;
  const delta = MOCK_REPORT.accuracyDelta;

  return (
    <ReportScreen
      nav
      eyebrow={`REPORT ME · ${MOCK_REPORT.weekLabel}`}
      title="이번 주 요약"
      sub={`AI가 이번 주 기록 ${MOCK_REPORT.records}개를 읽고 정리했어요`}
    >
      <Card className="flex flex-col items-center py-8">
        <RingDonut size={184} stroke={32} value={accuracy} extra={Math.min(delta, accuracy)}>
          <span className="text-[13px] text-sub">문장 정확도</span>
          <span className="text-[36px] font-bold text-ink leading-tight">{accuracy}%</span>
          <span className="text-[14px] font-semibold text-primary">▲ {delta}%p</span>
        </RingDonut>
        <div className="flex gap-5 mt-6 text-[13px] text-[#48484F]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> 이번 주
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-yellow" /> 지난주 증가분
          </span>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[26px] font-bold text-ink">{MOCK_REPORT.records}</p>
          <p className="text-[13px] text-sub mt-1">이번 주 기록</p>
        </Card>
        <Card>
          <p className="text-[26px] font-bold text-ink">{MOCK_REPORT.streak}</p>
          <p className="text-[13px] text-sub mt-1">연속 기록일</p>
        </Card>
      </div>
      <Card>
        <p className="text-[12px] font-semibold text-primary">AI 종합 분석</p>
        <p className="text-[15px] text-ink leading-[1.8] mt-3">{MOCK_REPORT.aiSummary}</p>
      </Card>
    </ReportScreen>
  );
}
