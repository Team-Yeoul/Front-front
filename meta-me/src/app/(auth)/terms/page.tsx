'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTermsStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, CheckIcon } from '@/components/ui/primitives';
import { Sheet } from '@/components/ui/overlays';

type TermsKey = 'service' | 'privacy' | 'marketing';

const TERMS_CONTENT: Record<TermsKey, { title: string; intro: string; sections: { heading: string; paragraphs: string[] }[] }> = {
  service: {
    title: '서비스 이용 약관',
    intro:
      '이 애플리케이션을 다운로드, 접속 또는 사용함으로써 귀하는 다음 이용 약관에 동의한 것으로 간주됩니다. 만약 동의하지 않으시면, 이 앱을 사용하지 마십시오.',
    sections: [
      {
        heading: '1. 응용 프로그램 사용법',
        paragraphs: [
          '메타미는 오락 및 허구적 목적으로만 제작된 도구입니다. 실제 기능을 하는 애플리케이션으로 간주되거나 현실적인 용도로 사용해서는 안 됩니다.',
          '귀하는 불법적이거나 사기적인 활동에 이 앱을 사용할 권한이 없습니다.',
          '이 앱의 모든 부분(허구 콘텐츠 포함)을 수정, 복사, 배포 또는 재판매하는 것은 금지되어 있습니다.',
        ],
      },
      {
        heading: '2. 사용자 책임',
        paragraphs: [
          '메타미를 사용함으로써, 귀하는 사용에 따른 모든 위험을 스스로 감수하고 자신의 행동에 대한 책임을 전적으로 부담한다는 데 동의하는 것입니다.',
          '당사는 앱 사용 또는 제공된 허위 정보로 인해 발생하는 모든 손해, 손실 또는 분쟁에 대해 책임을 지지 않습니다.',
        ],
      },
      {
        heading: '3. 약관의 변경',
        paragraphs: ['회사는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있으며, 변경 시 서비스 화면을 통해 사전에 공지합니다.'],
      },
    ],
  },
  privacy: {
    title: '개인정보 처리방침',
    intro: '메타미는 이용자의 개인정보를 소중히 다루며, 관련 법령에 따라 안전하게 처리합니다.',
    sections: [
      { heading: '1. 수집하는 항목', paragraphs: ['회원가입과 서비스 이용 과정에서 이메일, 비밀번호, 닉네임, 기록 데이터 등을 수집할 수 있습니다.'] },
      {
        heading: '2. 이용 목적',
        paragraphs: ['회원 가입 의사 확인 및 본인 인증', '서비스 제공, 콘텐츠 및 리포트 생성', '부정 이용 방지 및 고지사항 전달'],
      },
      { heading: '3. 보유 및 이용 기간', paragraphs: ['회원 탈퇴 시 지체 없이 파기하며, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.'] },
      { heading: '4. 이용자의 권리', paragraphs: ['이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제, 처리정지를 요청할 수 있습니다.'] },
    ],
  },
  marketing: {
    title: '마케팅 정보 수신',
    intro: '이벤트, 새로운 기능 소식 등 마케팅 정보를 앱 알림과 이메일로 받아볼 수 있어요.',
    sections: [{ heading: '안내', paragraphs: ['동의하지 않아도 서비스 이용에는 제한이 없으며, 설정에서 언제든지 변경할 수 있습니다.'] }],
  },
};

const ROWS: { key: TermsKey; label: string }[] = [
  { key: 'service', label: '서비스 이용 약관' },
  { key: 'privacy', label: '개인정보 처리방침' },
  { key: 'marketing', label: '[선택] 마케팅 정보 수신' },
];

function Box({ checked }: { checked: boolean }) {
  return (
    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${checked ? 'bg-primary-soft' : 'bg-surface-2'}`}>
      {checked && <CheckIcon size={18} color="#6367FF" />}
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

  const content = detail ? TERMS_CONTENT[detail] : null;

  return (
    <Screen
      overlay={
      <Sheet open={!!content} onClose={() => setDetail(null)} height="82%">
        {content && (
          <>
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-5">
              <h2 className="text-[22px] font-bold text-ink">{content.title}</h2>
              <p className="text-[15px] text-[#48484F] leading-[1.75] mt-4">{content.intro}</p>
              {content.sections.map((s) => (
                <section key={s.heading} className="mt-7">
                  <h3 className="text-[17px] font-bold text-ink">{s.heading}</h3>
                  <div className="mt-3 border-l-2 border-line pl-3.5 flex flex-col gap-3">
                    {s.paragraphs.map((p) => (
                      <p key={p} className="text-[15px] text-[#5A5A62] leading-[1.75]">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
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
