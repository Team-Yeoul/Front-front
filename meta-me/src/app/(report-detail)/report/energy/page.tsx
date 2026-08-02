'use client';

import { getEnergyDetail } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { DetailHeader } from '@/components/report/DetailHeader';
import { Chip } from '@/components/report/Chip';
import { BackToSummaryButton } from '@/components/report/BackToSummaryButton';
import { DonutChart } from '@/components/charts/DonutChart';
import type { EnergyDetail, PatternItem } from '@/types';

const MOCK: EnergyDetail = {
  charge: [
    {
      title: '혼자 깊게 몰입하는 시간',
      count: 4,
      description: '막힌 문제를 풀 때 시간 가는 줄 모르고 집중했어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/28', label: '감상 기록' },
      ],
    },
    {
      title: '문제를 끝까지 해결한 순간',
      count: 3,
      description: '끝까지 붙잡고 해결했을 때 큰 성취감을 느꼈어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/26', label: '몰입 기록' },
      ],
    },
  ],
  drain: [
    {
      title: '역할이 애매한 협업',
      count: 4,
      description: '역할이 불분명한 협업에서 에너지가 크게 소진됐어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/28', label: '감상 기록' },
        { date: '6/13', label: '답안 기록' },
      ],
    },
    {
      title: '기준이 불명확한 과제',
      count: 3,
      description: '평가 기준이 명확하지 않을 때 피로감이 컸어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/22', label: '지친 기록' },
      ],
    },
  ],
  chargeCount: 8,
  drainCount: 7,
};

function PatternCard({ badge, item, variant }: { badge: string; item: PatternItem; variant: 'primary' | 'secondary' }) {
  return (
    <div className="mb-5">
      <p className={`text-[12px] font-medium mb-1 ${variant === 'primary' ? 'text-[#8287FF]' : 'text-[#c94f80]'}`}>
        {badge} · 기록 {item.count}개
      </p>
      <h4 className="text-[15px] font-semibold text-gray-900 mb-1.5">{item.title}</h4>
      <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5">{item.description}</p>
      <div className="flex flex-wrap">
        {item.tags.map((t, i) => (
          <Chip key={i} tag={t} variant={variant} />
        ))}
      </div>
    </div>
  );
}

export default function EnergyDetailPage() {
  const data = useReportData(getEnergyDetail, MOCK);

  return (
    <div className="flex flex-col h-full bg-white">
      <DetailHeader title="에너지 충전/소진 패턴" subtitle="이번 리포트에서 발견한 패턴이에요" backHref="/report/summary" />

      <div className="flex-1 overflow-y-auto px-6 pt-5">
        <p className="text-[12px] font-semibold text-[#8287FF] mb-1">충전 패턴</p>
        {data.charge.map((item) => (
          <PatternCard key={item.title} badge="충전" item={item} variant="primary" />
        ))}

        <p className="text-[12px] font-semibold text-[#c94f80] mt-2 mb-1">소진 패턴</p>
        {data.drain.map((item) => (
          <PatternCard key={item.title} badge="소진" item={item} variant="secondary" />
        ))}

        <div className="mt-4 mb-8">
          <p className="text-[13px] font-semibold text-gray-900 mb-4">충전/소진 기록 비율</p>
          <DonutChart
            segments={[
              { label: '충전', value: data.chargeCount },
              { label: '소진', value: data.drainCount },
            ]}
          />
        </div>
      </div>

      <BackToSummaryButton />
    </div>
  );
}
