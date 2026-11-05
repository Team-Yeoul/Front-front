'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTermsStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button } from '@/components/ui/primitives';
import { Sheet } from '@/components/ui/overlays';
import { TermsBody, type TermsKey } from '@/components/ui/terms';

const ROWS: { key: TermsKey; label: string }[] = [
  { key: 'service', label: '서비스 이용 약관' },
  { key: 'privacy', label: '개인정보 처리방침' },
  { key: 'marketing', label: '[선택] 마케팅 정보 수신' },
];

function Box({ checked }: { checked: boolean }) {
  return (
    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${checked ? 'bg-primary-soft' : 'bg-surface-2'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {checked && <img src="/check.png" alt="" width={15} height={12} draggable={false} />}
    </span>
  );
}

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="#8E8E95" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function TermsPage() {
  const router = useRouter();
  const setTerms = useTermsStore((s) => s.setTerms);
  const [agreed, setAgreed] = useState<Record<TermsKey, boolean>>({ service: false, privacy: false, marketing: false });
  const [detail, setDetail] = useState<TermsKey | null>(null);

  const requiredAll = agreed.service && agreed.privacy;
  // 전체 동의는 [선택] 마케팅 수신까지 함께 켜고 끈다. 다음 단계 진행 조건은 필수 약관(requiredAll)만 본다.
  const allAgreed = requiredAll && agreed.marketing;
  const toggleAll = () => setAgreed({ service: !allAgreed, privacy: !allAgreed, marketing: !allAgreed });

  const submit = () => {
    if (!requiredAll) return;
    setTerms(agreed);
    router.push('/signup');
  };

  return (
    <Screen
      overlay={
      <Sheet open={!!detail} onClose={() => setDetail(null)} height="82%">
        {detail && (
          <>
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-5">
              <TermsBody termsKey={detail} />
              <div className="h-6" />
            </div>
            <div className="px-5 pt-3 pb-5 border-t border-line">
              <Button
                onClick={() => {
                  if (detail) setAgreed((a) => ({ ...a, [detail]: true }));
                  setDetail(null);
                }}
              >
                확인했어요
              </Button>
            </div>
          </>
        )}
      </Sheet>
      }
      footer={
        <Button onClick={submit} disabled={!requiredAll}>
          동의하고 계속하기
        </Button>
      }
    >
      <div className="px-5 pt-2">
        <BackButton href="/" />
        <h1 className="text-[30px] font-bold text-ink mt-5">이용약관</h1>
        <p className="text-[15px] text-sub mt-2 leading-relaxed">
          MetaMe 서비스 이용을 위해
          <br />
          약관에 동의해 주세요.
        </p>

        <div className="mt-8 rounded-3xl border border-line bg-[#FEFEFF] px-5 py-2">
          <button onClick={toggleAll} className="w-full flex items-center gap-4 py-4">
            <Box checked={allAgreed} />
            <span className="text-[16px] font-semibold text-ink">약관 전체 동의하기</span>
          </button>
          <div className="border-t border-dashed border-line" />
          {ROWS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4 py-2.5">
              <button onClick={() => setAgreed((a) => ({ ...a, [key]: !a[key] }))} className="flex items-center gap-4 flex-1 text-left">
                <Box checked={agreed[key]} />
                <span className="text-[16px] text-ink">{label}</span>
              </button>
              <button onClick={() => setDetail(key)} className="p-1" aria-label={`${label} 보기`}>
                <ArrowRight />
              </button>
            </div>
          ))}
        </div>
      </div>

    </Screen>
  );
}
