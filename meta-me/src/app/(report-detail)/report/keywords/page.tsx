'use client';

import Link from 'next/link';
import { getKeywordDetail } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { DetailHeader } from '@/components/report/DetailHeader';
import { Chip } from '@/components/report/Chip';
import { BarChart } from '@/components/charts/BarChart';
import type { KeywordDetail, KeywordItem } from '@/types';

const MOCK: KeywordDetail = {
  interestKeywords: [
    {
      category: 'interest',
      title: '코딩',
      count: 5,
      description: '동향 6회 · 공감 4회 — 몰입하는 시간 언급이 많았어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/22', label: '지친 기록' },
        { date: '6/13', label: '답안 기록' },
      ],
    },
    {
      category: 'interest',
      title: 'AI',
      count: 4,
      description: '동향 5회 · 공감 4회 — 새로운 도구를 익힐 때 흥미가 드러났어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/22', label: '지친 기록' },
        { date: '6/13', label: '답안 기록' },
      ],
    },
    {
      category: 'interest',
      title: '구조 이해',
      count: 3,
      description: '동향 7회 · 공감 5회 — 전체 맥락을 파악할 때 만족감이 컸어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/22', label: '지친 기록' },
      ],
    },
    {
      category: 'interest',
      title: '기획',
      count: 2,
      description: '동향 3회 · 공감 2회 — 방향을 설계하는 과정을 즐겼어요.',
      tags: [{ date: '6/13', label: '답안 기록' }],
    },
  ],
  disinterestKeywords: [
    {
      category: 'disinterest',
      title: '반복 암기',
      count: 3,
      description: '동향 4회 · 부정 감정 3회 — 같은 내용을 반복할 때 피로가 나타났어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/22', label: '지친 기록' },
      ],
    },
    {
      category: 'disinterest',
      title: '애매한 역할',
      count: 4,
      description: '동향 10회 · 부정 감정 4회 — 역할이 불분명한 협업에서 스트레스가 컸어요.',
      tags: [
        { date: '6/30', label: '조절과제 기록' },
        { date: '6/22', label: '지친 기록' },
        { date: '6/13', label: '답안 기록' },
      ],
    },
  ],
  frequency: [
    { label: '코딩', count: 10, category: 'interest' },
    { label: 'AI', count: 8, category: 'interest' },
    { label: '구조이해', count: 7, category: 'interest' },
    { label: '기획', count: 5, category: 'interest' },
    { label: '반복암기', count: 4, category: 'disinterest' },
    { label: '애매한역할', count: 3, category: 'disinterest' },
  ],
};

function KeywordCard({ item }: { item: KeywordItem }) {
  return (
    <div className="mb-5">
      <div className="flex items-baseline gap-2 mb-1">
        <h4 className="text-[15px] font-semibold text-gray-900">{item.title}</h4>
        <span className="text-[11px] text-gray-400">기록 {item.count}개</span>
      </div>
      <p className="text-[13px] text-gray-600 leading-relaxed mb-2">{item.description}</p>
      <div className="flex flex-wrap">
        {item.tags.map((t, i) => (
          <Chip key={i} tag={t} variant={item.category === 'interest' ? 'primary' : 'secondary'} />
        ))}
      </div>
    </div>
  );
}

export default function KeywordDetailPage() {
  const data = useReportData(getKeywordDetail, MOCK);

  return (
    <div className="flex flex-col h-full bg-white">
      <DetailHeader title="흥미/무흥미 키워드" subtitle="이번 리포트에서 발견한 키워드 3가지" />

      <div className="flex-1 overflow-y-auto px-6 pt-5">
        <p className="text-[12px] font-semibold text-[#8287FF] mb-3">흥미 키워드</p>
        {data.interestKeywords.map((item) => (
          <KeywordCard key={item.title} item={item} />
        ))}

        <p className="text-[12px] font-semibold text-[#c94f80] mt-2 mb-3">무흥미/피로 키워드</p>
        {data.disinterestKeywords.map((item) => (
          <KeywordCard key={item.title} item={item} />
        ))}

        <div className="mt-4 mb-8">
          <p className="text-[13px] font-semibold text-gray-900 mb-3">키워드별 등장 횟수</p>
          <BarChart data={data.frequency} />
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
