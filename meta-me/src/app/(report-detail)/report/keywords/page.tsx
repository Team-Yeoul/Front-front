'use client';

import { getKeywordDetail } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { CarouselChrome } from '@/components/report/CarouselChrome';
import { EnergyPatternCard } from '@/components/report/EnergyPatternCard';
import type { KeywordDetail } from '@/types';

const MOCK: KeywordDetail = {
  interestKeywords: [
    { category: 'interest', title: '글쓰기', count: 9, description: '', tags: [] },
    { category: 'interest', title: '러닝', count: 6, description: '', tags: [] },
    { category: 'interest', title: '전시', count: 4, description: '', tags: [] },
  ],
  disinterestKeywords: [
    { category: 'disinterest', title: '긴 회의', count: 7, description: '', tags: [] },
    { category: 'disinterest', title: '숫자 정리', count: 3, description: '', tags: [] },
  ],
  energyPatterns: [
    { variant: 'boost', title: '에너지 부스터', subtitle: '아침 러닝 · 혼자 쓰는 시간' },
    { variant: 'drain', title: '에너지 뱀파이어', subtitle: '늦은 밤 알림 확인 · 5회' },
    { variant: 'void', title: '에너지 블랙홀', subtitle: '목적 없는 스크롤 · 평균 42분' },
  ],
};

function KeywordChip({ label, count, active }: { label: string; count: number; active: boolean }) {
  return (
    <span
      className={`text-[13px] font-medium px-3.5 py-1.5 rounded-full mr-2 mb-2 inline-block ${
        active ? 'bg-[#8287FF] text-white' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {label} {count}
    </span>
  );
}

export default function KeywordDetailPage() {
  const data = useReportData(getKeywordDetail, MOCK);

  return (
    <CarouselChrome
      title="키워드와 에너지"
      subtitle="관심이 몰린 주제와 기분을 움직인 것들"
      step={3}
      total={5}
      nextHref="/report/persona"
    >
      <div className="bg-white border border-gray-100 rounded-3xl px-5 py-5 mb-4 shadow-sm">
        <p className="text-[12px] text-gray-400 mb-1.5">자주 관심을 보인 주제</p>
        <div className="mb-3">
          {data.interestKeywords.map((k, i) => (
            <KeywordChip key={k.title} label={k.title} count={k.count} active={i === 0} />
          ))}
        </div>
        <p className="text-[12px] text-gray-400 mb-1.5">흥미가 낮게 나타난 주제</p>
        <div>
          {data.disinterestKeywords.map((k) => (
            <KeywordChip key={k.title} label={k.title} count={k.count} active={false} />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">에너지 패턴</h3>
        <div className="flex flex-col gap-2.5">
          {data.energyPatterns.map((p) => (
            <EnergyPatternCard key={p.title} variant={p.variant} title={p.title} subtitle={p.subtitle} />
          ))}
        </div>
      </div>
    </CarouselChrome>
  );
}
