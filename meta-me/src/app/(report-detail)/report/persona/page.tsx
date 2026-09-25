'use client';

import { useState } from 'react';
import { getPersonaDetail } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { CarouselChrome } from '@/components/report/CarouselChrome';
import { PersonaSlider } from '@/components/report/PersonaSlider';
import { RadarChart } from '@/components/charts/RadarChart';
import type { PersonaDetail } from '@/types';

const MOCK: PersonaDetail = {
  summary: '이번엔 문제이행형, 짧고 깊게 몰입하고, 감정은 흡수하며, 결정은 분석형에 가까워요.',
  axes: [
    { label: '학습 스타일', leftLabel: '이론 선행형', rightLabel: '문제이행형', value: 62, description: '개념 정리보다 직접 부딪혀서 배우는 편이었어요.' },
    { label: '집중 패턴', leftLabel: '짧고 강한 집중', rightLabel: '장시간 유지', value: 40, description: '몰입은 짧지만 깊게, 오래 유지되진 않았어요.' },
    { label: '감정 회복력', leftLabel: '스트레스 흡수형', rightLabel: '직접 반응형', value: 55, description: '동요는 있지만 시간이 지나면 스스로 가라앉히는 편이었어요.' },
    { label: '의사결정 스타일', leftLabel: '직관형', rightLabel: '분석형', value: 70, description: '선택 전 근거를 따지려는 태도가 자주 보였어요.' },
  ],
  shiningMoments: ['막힌 문제를 직접 뚫고 갈 때', '혼자 깊게 몰입하는 작업', '깊이를 요구하는 결정'],
  cautionMoments: ['신속한 정리가 필요한 협업', '역할이 모호한 반복 작업', '빠른 결정이 필요한 순간'],
  note: '이건 균형 상태가 아니라 최근 기록에서 본 경향이에요.',
  compare: {
    quote: '설명은 잘하지만\n스스로는 못한다고 믿는 사람',
    axisLabels: ['표현력', '주도성', '공감', '추진력', '차분함'],
    selfValues: [54, 70, 86, 74, 74],
    othersValues: [86, 62, 78, 68, 66],
    matches: [
      { label: '공감', selfValue: 86, othersValue: 78 },
      { label: '차분함', selfValue: 74, othersValue: 66 },
    ],
    topDiff: {
      label: '표현력',
      selfValue: 54,
      othersValue: 86,
      note: '나는 발표를 못한다고 생각함 ↔ 주변에서는 설명을 잘한다고 평가함',
    },
  },
};

export default function PersonaDetailPage() {
  const data = useReportData(getPersonaDetail, MOCK);
  const [tab, setTab] = useState<'self' | 'compare'>('self');

  return (
    <CarouselChrome
      title="나의 성향 지도"
      step={4}
      total={5}
      backHref="/report/keywords"
      nextHref="/report/action"
    >
      <div className="flex gap-6 border-b border-gray-100 mb-5 -mt-1">
        {(
          [
            ['self', '내가 보는 나'],
            ['compare', '두 시선 비교'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`py-2.5 text-[14px] font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? 'text-gray-900 border-gray-900' : 'text-gray-400 border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'self' ? (
        <>
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
        </>
      ) : (
        <>
          <div className="bg-gray-900 rounded-3xl px-6 py-7 mb-5 text-center">
            <p className="text-[16px] font-semibold text-white leading-relaxed whitespace-pre-line">
              &ldquo;{data.compare.quote}&rdquo;
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <RadarChart
              labels={data.compare.axisLabels}
              series={[
                { label: '내가 보는 나', color: '#8287FF', values: data.compare.selfValues },
                { label: '남이 보는 나', color: '#F5D949', values: data.compare.othersValues },
              ]}
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl px-4 py-4 mb-4 shadow-sm">
            <p className="text-[12px] font-semibold text-gray-900 mb-2.5">일치하는 부분</p>
            <div className="flex gap-2 mb-2.5">
              {data.compare.matches.map((m) => (
                <span key={m.label} className="text-[12px] font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                  {m.label} {m.selfValue} / {m.othersValue}
                </span>
              ))}
            </div>
            <p className="text-[12px] text-gray-500 leading-relaxed">
              감정을 잘 알아차리고, 혼자 몰입할 때 결과가 좋다는 평가가 양쪽에서 같았어요.
            </p>
          </div>

          <div className="bg-[#FFF8DE] rounded-2xl px-4 py-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-semibold text-gray-900">차이가 큰 부분</p>
              <span className="text-[12px] text-gray-500">{data.compare.topDiff.label}</span>
            </div>
            <div className="flex flex-col gap-1.5 mb-2">
              <div className="h-2.5 rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-[#8287FF]" style={{ width: `${data.compare.topDiff.selfValue}%` }} />
              </div>
              <div className="h-2.5 rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-[#F5D949]" style={{ width: `${data.compare.topDiff.othersValue}%` }} />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 text-right mb-2">
              +{data.compare.topDiff.othersValue - data.compare.topDiff.selfValue}
            </p>
            <p className="text-[12px] text-gray-600 leading-relaxed">{data.compare.topDiff.note}</p>
          </div>
        </>
      )}
    </CarouselChrome>
  );
}
