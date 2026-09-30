'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/primitives';
import { Card, ReportScreen } from '@/components/ui/report';
import { MOCK_REPORT } from '@/lib/mock';

export default function ReportGrowthPage() {
  const router = useRouter();
  const bars = MOCK_REPORT.weekly;
  const min = 50;

  return (
    <ReportScreen
      eyebrow="GROWTH"
      title="성장 지표와 핵심 발견"
      sub="지난주와 비교해 무엇이 달라졌는지"
      footer={<Button onClick={() => router.push('/report/sentence')}>나의 문장 업데이트 보기</Button>}
    >
      <div className="rounded-3xl bg-primary px-5 pt-5 pb-4">
        <p className="text-[13px] text-white/75">메타인지 정확도 · 4주 추이</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[40px] font-bold text-white leading-none">{MOCK_REPORT.accuracy}%</span>
          <span className="h-7 px-3 rounded-full bg-yellow text-[13px] font-bold text-ink inline-flex items-center">+{MOCK_REPORT.accuracyDelta}%</span>
        </div>
        <div className="grid grid-cols-4 gap-4 items-end h-[120px] mt-4">
          {bars.map((b, i) => {
            const last = i === bars.length - 1;
            const h = 30 + ((b.value - min) / (100 - min)) * 110;
            return (
              <div key={b.label} className="relative flex flex-col items-center justify-end h-full">
                {(i === 0 || last) && <span className="text-[16px] text-white mb-1">{b.value}%</span>}
                <div className={`relative w-full rounded-xl ${last ? 'bg-yellow' : 'bg-white/35'}`} style={{ height: `${Math.min(100, h)}px` }}>
                  <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rounded-full bg-white" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-4 mt-2">
          {bars.map((b, i) => (
            <span key={b.label} className={`text-center text-[11px] ${i === bars.length - 1 ? 'font-bold text-white' : 'text-white/60'}`}>
              {b.label}
            </span>
          ))}
        </div>
      </div>
      {MOCK_REPORT.findings.map((f, i) => (
        <Card key={f.title}>
          <p className={`text-[12px] font-semibold ${i === 0 ? 'text-primary' : 'text-sub'}`}>이번 주 핵심 발견 {i + 1}</p>
          <p className="text-[18px] font-bold text-ink leading-[1.5] mt-2">{f.title}</p>
          {f.desc && <p className="text-[13px] text-sub mt-2">{f.desc}</p>}
        </Card>
      ))}
    </ReportScreen>
  );
}
