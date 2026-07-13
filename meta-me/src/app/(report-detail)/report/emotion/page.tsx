'use client';

import Link from 'next/link';
import { getEmotionDetail } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { DetailHeader } from '@/components/report/DetailHeader';
import { Chip } from '@/components/report/Chip';
import { LineChart } from '@/components/charts/LineChart';
import type { EmotionDetail } from '@/types';

const MOCK: EmotionDetail = {
  emotions: [
    {
      title: '문제 해결력',
      count: 2,
      description: '막힌 상황에서 직접 해결책을 찾는 편이었어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/28', label: '감상 기록' },
      ],
    },
    {
      title: '몰입 지속력',
      count: 3,
      description: '혼자 정리하기·코드를 짤 때 집중 흐름이 자주 나타났어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/25', label: '몰입 기록' },
      ],
    },
  ],
  cautions: [
    {
      title: '혼자 대안하기',
      count: 3,
      description: '막힌 문제를 혼자 해결하려는 판단이 반복적으로 보일 수 있어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/22', label: '지친 기록' },
        { date: '6/13', label: '답안 기록' },
      ],
    },
  ],
  trend: [
    { label: '3주 전', value: 2 },
    { label: '2주 전', value: 3 },
    { label: '1주 전', value: 4 },
    { label: '이번 주', value: 6 },
  ],
};

function PatternCard({
  badge,
  title,
  count,
  description,
  tags,
}: {
  badge: string;
  title: string;
  count: number;
  description: string;
  tags: EmotionDetail['emotions'][number]['tags'];
}) {
  return (
    <div className="mb-6">
      <p className="text-[12px] font-medium text-[#8287FF] mb-1">
        {badge} · 기록 {count}개
      </p>
      <h4 className="text-[15px] font-semibold text-gray-900 mb-1.5">{title}</h4>
      <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5">&ldquo;{description}&rdquo;</p>
      <div className="flex flex-wrap">
        {tags.map((t, i) => (
          <Chip key={i} tag={t} variant="primary" />
        ))}
      </div>
    </div>
  );
}

export default function EmotionDetailPage() {
  const data = useReportData(getEmotionDetail, MOCK);

  return (
    <div className="flex flex-col h-full bg-white">
      <DetailHeader title="감정/주의 패턴" subtitle="이번 리포트에서 발견한 패턴이에요" backHref="/report/summary" />

      <div className="flex-1 overflow-y-auto px-6 pt-5">
        {data.emotions.map((e, i) => (
          <PatternCard key={e.title} badge={`감정 ${i + 1}`} title={e.title} count={e.count} description={e.description} tags={e.tags} />
        ))}
        {data.cautions.map((c, i) => (
          <PatternCard key={c.title} badge={`주의 ${i + 1}`} title={c.title} count={c.count} description={c.description} tags={c.tags} />
        ))}

        <div className="mt-2 mb-8">
          <p className="text-[13px] font-semibold text-gray-900 mb-3">최근 4주 패턴 변화 추이</p>
          <LineChart data={data.trend} />
          <p className="text-[11px] text-gray-400 text-center mt-1">혼자 대안하기 언급 횟수</p>
        </div>
      </div>

      <div className="px-6 py-5">
        <Link href="/report/summary">
          <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-base font-semibold">
            리포트로 돌아가기
          </button>
        </Link>
      </div>
    </div>
  );
}
