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
  // 민감정보는 다른 동의와 묶지 않고 따로 받아야 한다(개인정보 보호법 제23조).
  { key: 'sensitive', label: '[필수] 민감정보 처리 동의' },
  { key: 'marketing', label: '[선택] 마케팅 정보 수신' },
];

function Box({ checked }: { checked: boolean }) {
  return (
    <span
      className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
        checked ? 'bg-primary' : 'bg-white border-[1.5px] border-[#C7C7D1]'
      }`}
    >
      {checked && (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#FFFFFF"
            d="M9.171 16.072L19.778 5.465c.409-.359 1.01-.404 1.414 0c.404.405.359 1.005 0 1.415L9.878 18.193c-.204.179-.429.293-.707.293s-.503-.114-.707-.293l-5.657-5.657c-.297-.339-.393-.8-.159-1.207c.34-.588 1.092-.629 1.574-.207Z"
          />
        </svg>
      )}
    </span>
  );
}

const ArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#999999"
      d="M17.242 13H4c-.543-.036-1-.428-1-1s.457-.964 1-1h13.243l-3.95-3.95c-.423-.481-.381-1.233.207-1.573c.407-.235.867-.139 1.207.159l5.657 5.657c.238.271.355.607.259.966c-.053.194-.128.299-.259.448l-5.657 5.657c-.34.298-.8.394-1.207.159c-.588-.34-.63-1.092-.207-1.573Z"
    />
  </svg>
);

export default function TermsPage() {
  const router = useRouter();
  const setTerms = useTermsStore((s) => s.setTerms);
  const [agreed, setAgreed] = useState<Record<TermsKey, boolean>>({ service: false, privacy: false, sensitive: false, marketing: false });
  const [detail, setDetail] = useState<TermsKey | null>(null);

  const requiredAll = agreed.service && agreed.privacy && agreed.sensitive;
  // '필수 약관 전체 동의'는 필수 약관만 함께 켜고 끈다. [선택] 마케팅 수신은 따로 고른다.
  const toggleAll = () => setAgreed((a) => ({ ...a, service: !requiredAll, privacy: !requiredAll, sensitive: !requiredAll }));

  const submit = () => {
    if (!requiredAll) return;
    setTerms(agreed);
    router.push('/signup');
  };

  return (
    <Screen
      footerClassName="px-6 pt-2 pb-8"
      overlay={
      <Sheet open={!!detail} onClose={() => setDetail(null)} height="calc(100% - 116px)" className="rounded-t-[20px]">
        {detail && (
          <>
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4">
              <TermsBody termsKey={detail} />
              <div className="h-6" />
            </div>
            <div className="px-6 pt-4 pb-8 border-t border-[#EDEDF2]">
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
      <div className="px-7 pt-4">
        <BackButton href="/" />
        <h1 className="text-[34px] font-extrabold text-[#0F0F14] tracking-[-0.02em] mt-8">이용약관</h1>
        <p className="text-[17px] text-[#999999] leading-[1.5] mt-2.5">
          MetaMe 서비스 이용을 위해
          <br />
          약관에 동의해 주세요.
        </p>
      </div>

      <div className="mx-6 mt-7 rounded-[22px] bg-card px-5 py-6.5">
        <button onClick={toggleAll} className="w-full flex items-center gap-4 text-left">
          <Box checked={requiredAll} />
          <span className="text-[17px] font-bold text-ink">필수 약관 전체 동의하기</span>
        </button>
        <div className="mx-1 my-5.5 border-t-[1.5px] border-dashed border-[#C7C7D1]" />
        <div className="flex flex-col gap-4.5">
          {ROWS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <button onClick={() => setAgreed((a) => ({ ...a, [key]: !a[key] }))} className="flex items-center gap-4 flex-1 text-left">
                <Box checked={agreed[key]} />
                <span className="text-[17px] font-medium text-[#3F3F46]">{label}</span>
              </button>
              <button onClick={() => setDetail(key)} className="p-0.5" aria-label={`${label} 보기`}>
                <ArrowRight />
              </button>
            </div>
          ))}
        </div>
      </div>

    </Screen>
  );
}
