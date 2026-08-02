'use client';

import Link from 'next/link';
import { getReportSummary } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { DetailHeader } from '@/components/report/DetailHeader';
import { HighlightText } from '@/components/report/HighlightText';
import { PersonaSlider } from '@/components/report/PersonaSlider';
import type { ReportSummary } from '@/types';

const MOCK_SUMMARY: ReportSummary = {
  day: 14,
  scope: '전체 기록',
  title: '문제를 오래 붙잡고, 혼자 정리할 때 몰입이 올라가는 사람',
  matchPercent: 42,
  recordedDays: 14,
  weeklyHighlights: [
    { text: '혼자 공부할 때 집중이 높아졌어요', highlight: '집중' },
    { text: '역할이 애매한 협업에서 피로가 컸어요', highlight: '피로' },
    { text: '결과보다 감정을 자주 언급했어요', highlight: '감정' },
  ],
  emotion: {
    emotionTags: ['문제 해결력', '몰입 지속력'],
    cautionTags: ['혼자 대안하기', '반복 주의'],
    description:
      '익숙한 상황에서 직접 해결책을 찾는 편이었어요. 다만 반복적이거나 불명확한 협업 상황에는 조금 취약한 편도 보였어요.',
  },
  interest: {
    interestTags: ['코딩', 'AI', '구조 이해', '기획'],
    disinterestTags: ['반복 암기', '애매한 역할'],
    description: '평소 자주 언급하시는 활동들이 흥미 진단에 도움이 될 수 있어요.',
  },
  energy: {
    chargeTags: ['혼자 깊게 몰입하는 시간', '문제를 끝까지 해결한 순간'],
    drainTags: ['역할이 애매한 협업', '기준이 불명확한 과제'],
  },
  personaGrowth: {
    from: 34,
    to: 42,
    description: '성향 매핑에서 기록이 쌓임에 따라, 감정과 사고 흐름 근거가 부족했던 전체 성향, 흥미·취미 조합이 점차 뚜렷해지고 있어요.',
  },
  weeklyGrowth: {
    description:
      '다음 팀 활동에서는 사실 전달 역할을 한 번 맡아보세요. 역할이 애매한 협업이 최근 반복적으로 나타났기 때문이에요.',
    comparisonLabel: '조절과제 vs 자기결정',
    dueLabel: '10일 뒤 완료함',
  },
  mirrors: {
    me: '돋보기',
    ai: '분석',
    others: '아직 없음',
  },
  personaMap: [
    { label: '학습 스타일', leftLabel: '이론 선행형', rightLabel: '문제이행형', value: 62 },
    { label: '집중 패턴', leftLabel: '짧고 강한 집중', rightLabel: '장시간 유지', value: 40 },
    { label: '감정 회복력', leftLabel: '스트레스 흡수형', rightLabel: '직접 반응형', value: 55 },
    { label: '의사결정 스타일', leftLabel: '직관형', rightLabel: '분석형', value: 70 },
  ],
  personaNote: '이건 균형 상태가 아니라 최근 기록에서 보인 경향이에요.',
};

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-5 border-b border-gray-100">
      <h3 className="text-[15px] font-semibold text-gray-900 mb-2.5">{title}</h3>
      {children}
      {href && (
        <Link href={href} className="inline-block text-[12px] text-[#8287FF] font-medium mt-2.5">
          자세히 보기 →
        </Link>
      )}
    </section>
  );
}

export default function ReportSummaryPage() {
  const summary = useReportData(getReportSummary, MOCK_SUMMARY);

  return (
    <div className="flex flex-col h-full bg-white">
      <DetailHeader title="리포트 미리보기" subtitle={`DAY ${summary.day} · ${summary.scope}`} />

      <div className="flex-1 overflow-y-auto px-6">
        <h2 className="text-[20px] font-bold text-gray-900 leading-[1.4] mt-5 mb-3">{summary.title}</h2>
        <Link href="/report/persona" className="inline-block text-[13px] text-gray-500 mb-2">
          성향도 {summary.matchPercent}% · 기록 {summary.recordedDays}일{' '}
          <span className="text-[#8287FF] font-medium">자세히 보기 →</span>
        </Link>

        <Section title="이번 주 눈에 띈 것">
          <div className="flex flex-col gap-2">
            {summary.weeklyHighlights.map((line, i) => (
              <p key={i} className="text-[13px] text-gray-600 leading-relaxed">
                {String(i + 1).padStart(2, '0')}. <HighlightText line={line} />
              </p>
            ))}
          </div>
        </Section>

        <Section title="감정과 주의할 점" href="/report/emotion">
          <p className="text-[12px] text-gray-500 mb-1">
            <span className="font-medium text-gray-700">감정</span> — {summary.emotion.emotionTags.join(', ')}
          </p>
          <p className="text-[12px] text-gray-500 mb-3">
            <span className="font-medium text-gray-700">주의</span> — {summary.emotion.cautionTags.join(', ')}
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed">{summary.emotion.description}</p>
        </Section>

        <Section title="흥미/무흥미 카드" href="/report/keywords">
          <p className="text-[12px] text-gray-500 mb-1">
            <span className="font-medium text-gray-700">흥미</span> — {summary.interest.interestTags.join(' · ')}
          </p>
          <p className="text-[12px] text-gray-500 mb-3">
            <span className="font-medium text-gray-700">무흥미</span> —{' '}
            {summary.interest.disinterestTags.join(' · ')}
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed">{summary.interest.description}</p>
        </Section>

        <Section title="에너지 충전/소진" href="/report/energy">
          <p className="text-[12px] text-gray-500 mb-1">
            <span className="font-medium text-gray-700">충전</span> — {summary.energy.chargeTags.join(', ')}
          </p>
          <p className="text-[12px] text-gray-500">
            <span className="font-medium text-gray-700">소진</span> — {summary.energy.drainTags.join(', ')}
          </p>
        </Section>

        <Section title="페르소나 성장" href="/report/persona">
          <p className="text-[24px] font-bold text-gray-900 mb-2">
            {summary.personaGrowth.from} → {summary.personaGrowth.to}
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed">{summary.personaGrowth.description}</p>
        </Section>

        <Section title="이번 주 성장" href="/report/action">
          <p className="text-[13px] text-gray-600 leading-relaxed mb-2">{summary.weeklyGrowth.description}</p>
          <p className="text-[11px] text-gray-400">
            {summary.weeklyGrowth.comparisonLabel} — {summary.weeklyGrowth.dueLabel}
          </p>
        </Section>

        <Section title="3개의 거울" href="/objectify">
          <p className="text-[12px] text-gray-500 mb-1">
            <span className="font-medium text-gray-700">내가 보는 나</span> — {summary.mirrors.me}
          </p>
          <p className="text-[12px] text-gray-500 mb-1">
            <span className="font-medium text-gray-700">AI가 보는 나</span> — {summary.mirrors.ai}
          </p>
          <p className="text-[12px] text-gray-500">
            <span className="font-medium text-gray-700">타인이 보는 나</span> — {summary.mirrors.others}
          </p>
        </Section>

        <Section title="나의 성향 지도" href="/report/persona">
          {summary.personaMap.map((axis) => (
            <PersonaSlider key={axis.label} axis={axis} />
          ))}
          <p className="text-[12px] text-gray-400 leading-relaxed">{summary.personaNote}</p>
        </Section>
      </div>

      <div className="px-6 py-5">
        <Link href="/report">
          <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-base font-semibold">
            확인했습니다
          </button>
        </Link>
      </div>
    </div>
  );
}
