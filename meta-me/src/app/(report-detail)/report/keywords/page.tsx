'use client';

import { Card, ReportScreen } from '@/components/ui/report';
import { MOCK_REPORT } from '@/lib/mock';

const ENERGY_STYLE = {
  booster: { row: 'bg-white', icon: 'bg-primary', glyph: '↑', desc: 'text-primary' },
  vampire: { row: 'bg-yellow-soft', icon: 'bg-yellow', glyph: '↓', desc: 'text-gold' },
  blackhole: { row: 'bg-white', icon: 'bg-[#3A3A40]', glyph: '○', desc: 'text-sub' },
};

export default function ReportKeywordsPage() {
  return (
    <ReportScreen eyebrow="KEYWORD & ENERGY" title="키워드와 에너지" sub="관심이 몰린 주제와 기분을 움직인 것들">
      <Card>
        <p className="text-[16px] font-bold text-ink">흥미 / 무흥미 키워드</p>
        <p className="text-[12px] text-sub mt-3">자주 관심을 보인 주제</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {MOCK_REPORT.interests.map((k, i) => (
            <span
              key={k.label}
              className={`h-9 px-4 rounded-full text-[15px] font-semibold inline-flex items-center ${i === 0 ? 'bg-primary text-white' : 'bg-primary-soft text-primary'}`}
            >
              {k.label} {k.count}
            </span>
          ))}
        </div>
        <p className="text-[12px] text-sub mt-4">흥미가 낮게 나타난 주제</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {MOCK_REPORT.disinterests.map((k) => (
            <span key={k.label} className="h-9 px-4 rounded-full bg-[#E8E8EE] text-[15px] text-[#48484F] inline-flex items-center">
              {k.label} {k.count}
            </span>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-[16px] font-bold text-ink">에너지 패턴</p>
        <div className="flex flex-col gap-2.5 mt-4">
          {MOCK_REPORT.energy.map((e) => {
            const s = ENERGY_STYLE[e.kind];
            return (
              <div key={e.kind} className={`flex items-center gap-3.5 rounded-2xl px-4 py-4 ${s.row}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-bold ${s.icon} ${e.kind === 'vampire' ? 'text-ink' : 'text-white'}`}>
                  {s.glyph}
                </span>
                <div>
                  <p className="text-[15px] font-bold text-ink">{e.title}</p>
                  <p className={`text-[13px] mt-0.5 ${s.desc}`}>{e.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </ReportScreen>
  );
}
