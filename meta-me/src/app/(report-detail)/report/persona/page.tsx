'use client';

import Link from 'next/link';
import { getPersonaDetail } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { DetailHeader } from '@/components/report/DetailHeader';
import { PersonaSlider } from '@/components/report/PersonaSlider';
import type { PersonaDetail } from '@/types';

const MOCK: PersonaDetail = {
  summary:
    '이번보다 문제이론, 짧고 깊게 몰입하고, 감정은 흡수해며, 결정은 분석형에 가까워요.',
  axes: [
    {
      label: '학습 스타일',
      leftLabel: '이론 선행형',
      rightLabel: '문제이행형',
      value: 62,
      description: '개념 정리보다 직접 부딪혀서 배우는 편이었어요.',
    },
    {
      label: '집중 패턴',
      leftLabel: '짧고 강한 집중',
      rightLabel: '장시간 유지',
      value: 40,
      description: '몰입은 짧지만 깊게, 오래 유지되진 않았어요.',
    },
    {
      label: '감정 회복력',
      leftLabel: '스트레스 흡수형',
      rightLabel: '직접 반응형',
      value: 55,
      description: '동요는 있지만 시간이 지나면 스스로 가라앉히는 편이었어요.',
    },
    {
      label: '의사결정 스타일',
      leftLabel: '직관형',
      rightLabel: '분석형',
      value: 70,
      description: '선택 전 근거를 따지려는 태도가 자주 보였어요.',
    },
  ],
  shiningMoments: ['막힌 문제를 직접 뚫고 갈 때', '혼자 깊게 몰입하는 작업', '깊이를 요구하는 결정'],
  cautionMoments: ['신속한 정리가 필요한 협업', '역할이 모호한 반복 작업', '빠른 결정이 필요한 순간'],
  note: '이건 균형 상태가 아니라 최근 기록에서 본 경향이에요.',
};

export default function PersonaDetailPage() {
  const data = useReportData(getPersonaDetail, MOCK);

  return (
    <div className="flex flex-col h-full bg-white">
      <DetailHeader title="나의 성향 지도" subtitle="최근 기록을 바탕으로 추론한 4가지 축이에요" backHref="/report/summary" />

      <div className="flex-1 overflow-y-auto px-6 pt-5">
        <div className="bg-gray-50 rounded-2xl px-4 py-3.5 mb-6">
          <p className="text-[11px] text-gray-400 mb-1">한 줄 요약</p>
          <p className="text-[13px] text-gray-800 leading-relaxed">{data.summary}</p>
        </div>

        {data.axes.map((axis) => (
          <div key={axis.label} className="mb-5">
            <PersonaSlider axis={axis} />
            <p className="text-[12px] text-gray-500 leading-relaxed -mt-1.5">{axis.description}</p>
          </div>
        ))}

        <div className="mb-6">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-2.5">이 성향이 빛나는 순간</h3>
          <ul className="flex flex-col gap-1.5">
            {data.shiningMoments.map((m) => (
              <li key={m} className="text-[13px] text-gray-600 flex gap-1.5">
                <span className="text-[#8287FF]">·</span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-2.5">주의하면 좋은 순간</h3>
          <ul className="flex flex-col gap-1.5">
            {data.cautionMoments.map((m) => (
              <li key={m} className="text-[13px] text-gray-600 flex gap-1.5">
                <span className="text-[#c94f80]">·</span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed mb-6">{data.note}</p>
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
