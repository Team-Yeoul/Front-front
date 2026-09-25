'use client';

import { getReportSummary } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { CarouselChrome } from '@/components/report/CarouselChrome';
import { StatCard } from '@/components/report/StatCard';
import { DonutChart } from '@/components/charts/DonutChart';
import type { ReportSummary } from '@/types';

const MOCK_SUMMARY: ReportSummary = {
  recordedCount: 12,
  aiIntro: 'AI가 이번 주 기록 12개를 읽고 정리했어요',
  accuracyPercent: 76,
  accuracyDeltaPercent: 8,
  weeklyCount: 12,
  streakDays: 5,
  aiAnalysis:
    '마감이 있는 일에서 몰입이 가장 깊었어요. 반대로 시작 전 준비가 길어지는 날이 세 번 있었고, 그런 날은 기록도 짧았습니다. 감정을 언어로 정리하는 능력은 지난주보다 뚜렷하게 좋아졌습니다.',
};

export default function ReportSummaryPage() {
  const summary = useReportData(getReportSummary, MOCK_SUMMARY);
  const baseline = summary.accuracyPercent - summary.accuracyDeltaPercent;

  return (
    <CarouselChrome title="이번 주 요약" subtitle={summary.aiIntro} step={1} total={5} nextHref="/report/emotion">
      <div className="bg-white border border-gray-100 rounded-3xl px-5 py-6 mb-5 shadow-sm flex flex-col items-center">
        <p className="text-[13px] text-gray-400 mb-4">문장 정확도</p>
        <DonutChart
          centerLabel={`${summary.accuracyPercent}%`}
          centerSubLabel={`▲ ${summary.accuracyDeltaPercent}%p`}
          colors={['#8287FF', '#F5D949']}
          segments={[
            { label: '이번 주', value: baseline, displayValue: `${summary.accuracyPercent}%` },
            { label: '지난주 증가분', value: summary.accuracyDeltaPercent, displayValue: `${summary.accuracyDeltaPercent}%p` },
          ]}
        />
      </div>

      <div className="flex gap-3 mb-5">
        <StatCard value={summary.weeklyCount} label="이번 주 기록" />
        <StatCard value={summary.streakDays} label="연속 기록일" />
      </div>

      <div className="mb-6">
        <p className="text-[12px] font-semibold text-[#8287FF] mb-2">AI 종합 분석</p>
        <p className="text-[13px] text-gray-700 leading-relaxed">{summary.aiAnalysis}</p>
      </div>
    </CarouselChrome>
  );
}
