'use client';

import { useRouter } from 'next/navigation';
import { getGrowthDetail } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { CarouselChrome } from '@/components/report/CarouselChrome';
import { WeeklyAccuracyBars } from '@/components/report/WeeklyAccuracyBars';
import type { GrowthDetail } from '@/types';

const MOCK: GrowthDetail = {
  trend: [
    { label: '7월 2주', value: 65 },
    { label: '3주', value: 68 },
    { label: '4주', value: 71 },
    { label: '이번 주', value: 76 },
  ],
  deltaLabel: '+8%',
  insights: [
    {
      title: '마감이 생기면 몰입하지만, 마감이 없으면 준비 단계에서 멈춰요.',
      description: '이번 주 기록 12개 중 7개에서 같은 흐름이 반복됐습니다.',
    },
    {
      title: '밤에 남긴 기록은 낮보다 감정 표현이 두 배 많았어요.',
      description: '',
    },
  ],
};

export default function GrowthDetailPage() {
  const router = useRouter();
  const data = useReportData(getGrowthDetail, MOCK);
  const current = data.trend[data.trend.length - 1]?.value ?? 0;

  return (
    <CarouselChrome
      title="성장 지표와 핵심 발견"
      subtitle="지난주와 비교해 무엇이 달라졌는지"
      step={5}
      total={5}
      footer={
        <button
          onClick={() => router.push('/report')}
          className="w-full h-14 bg-gray-900 text-white rounded-2xl text-base font-semibold"
        >
          나의 문장 업데이트 보기
        </button>
      }
    >
      <div className="bg-[#8287FF] rounded-3xl px-5 py-5 mb-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[12px] text-white/80">메타인지 정확도 · 4주 추이</p>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[32px] font-bold text-white leading-none">{current}%</span>
          <span className="text-[12px] font-semibold text-gray-900 bg-[#F5D949] px-2 py-0.5 rounded-full">
            {data.deltaLabel}
          </span>
        </div>
        <WeeklyAccuracyBars data={data.trend} variant="onPurple" />
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {data.insights.map((insight, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl px-4 py-4">
            <p className="text-[11px] font-semibold text-[#8287FF] mb-1.5">이번 주 핵심 발견 {i + 1}</p>
            <p className="text-[14px] font-semibold text-gray-900 leading-relaxed">{insight.title}</p>
            {insight.description && <p className="text-[12px] text-gray-400 mt-1.5">{insight.description}</p>}
          </div>
        ))}
      </div>
    </CarouselChrome>
  );
}
