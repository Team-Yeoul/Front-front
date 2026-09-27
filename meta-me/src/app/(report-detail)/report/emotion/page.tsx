'use client';

import { getEmotionDetail } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { CarouselChrome } from '@/components/report/CarouselChrome';
import { RankedPatternRow } from '@/components/report/RankedPatternRow';
import type { EmotionDetail } from '@/types';

const MOCK: EmotionDetail = {
  emotions: [
    {
      title: '마감 앞에서 몰입',
      count: 3,
      description: '"마감이 있어서 오히려 잘 붙었다" — 8/1 기록',
      tags: [],
    },
    {
      title: '감정을 언어로 정리',
      count: 5,
      description: '감정 태그를 3개 이상 고른 날이 5회',
      tags: [],
    },
    {
      title: '혼자 있을 때 아이디어',
      count: 2,
      description: '혼자 보낸 시간 뒤 기록의 분량이 두 배',
      tags: [],
    },
  ],
  cautions: [
    { title: '시작 전 준비가 길어짐', count: 3, description: '', tags: [] },
    { title: '늦은 밤 알림 확인', count: 5, description: '', tags: [] },
    { title: '계획 대비 실행 이탈', count: 4, description: '', tags: [] },
  ],
  trend: [],
};

export default function EmotionDetailPage() {
  const data = useReportData(getEmotionDetail, MOCK);

  return (
    <CarouselChrome
      title="발견된 강점/약점"
      subtitle="근거가 된 기록 횟수를 함께 표시했어요"
      step={2}
      total={5}
      nextHref="/report/keywords"
    >
      <div className="bg-white border border-gray-100 rounded-3xl px-5 py-5 mb-4 shadow-sm">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-1">강점 TOP3</h3>
        {data.emotions.slice(0, 3).map((e) => (
          <RankedPatternRow key={e.title} title={e.title} description={e.description} count={e.count} variant="primary" />
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl px-5 py-5 mb-6 shadow-sm">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-1">주의할 패턴 TOP3</h3>
        {data.cautions.slice(0, 3).map((c) => (
          <div key={c.title} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
            <h4 className="text-[14px] text-gray-800">{c.title}</h4>
            <span className="text-[12px] font-semibold text-[#c94f80] shrink-0">{c.count}회</span>
          </div>
        ))}
      </div>
    </CarouselChrome>
  );
}
