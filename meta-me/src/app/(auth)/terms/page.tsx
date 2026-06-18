'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function CircleCheckbox({ checked }: { checked: boolean }) {
  return (
    <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-colors ${
      checked ? 'bg-blue-500' : 'border-2 border-gray-300'
    }`}>
      {checked && (
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
          <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

function ChevronRight() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d="M1 1l6 6-6 6" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function TermsPage() {
  const router = useRouter();
  const [service, setService] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const allRequired = service && privacy;
  const canContinue = service && privacy;

  const handleAllRequired = () => {
    const next = !allRequired;
    setService(next);
    setPrivacy(next);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      {/* 뒤로가기 */}
      <div className="px-5 pt-4 pb-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {/* 타이틀 */}
      <div className="px-5 mb-6">
        <h1 className="text-[28px] font-bold text-gray-900">이용약관</h1>
        <p className="text-[14px] text-gray-500 mt-2 leading-snug">
          MetaMe 서비스 이용을 위해<br />약관에 동의해 주세요.
        </p>
      </div>

      {/* 약관 카드 */}
      <div className="mx-5 bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* 전체 동의 */}
        <button
          onClick={handleAllRequired}
          className="w-full flex items-center gap-3 px-5 py-4"
        >
          <CircleCheckbox checked={allRequired} />
          <span className="text-[15px] font-semibold text-gray-900">필수 약관 전체 동의하기</span>
        </button>

        <div className="h-px bg-gray-100 mx-0" />

        {/* 서비스 이용 약관 */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <button onClick={() => {
            const next = !service;
            setService(next);
          }}>
            <CircleCheckbox checked={service} />
          </button>
          <span className="flex-1 text-[14px] text-gray-700">서비스 이용 약관</span>
          <ChevronRight />
        </div>

        {/* 개인정보 처리방침 */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <button onClick={() => {
            const next = !privacy;
            setPrivacy(next);
          }}>
            <CircleCheckbox checked={privacy} />
          </button>
          <span className="flex-1 text-[14px] text-gray-700">개인정보 처리방침</span>
          <ChevronRight />
        </div>

        {/* 마케팅 수신 (선택) */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <button onClick={() => setMarketing(!marketing)}>
            <CircleCheckbox checked={marketing} />
          </button>
          <span className="flex-1 text-[14px] text-gray-500">[선택] 마케팅 정보 수신</span>
          <ChevronRight />
        </div>
      </div>

      {/* 계속하기 버튼 */}
      <div className="mt-auto px-5 py-5">
        <button
          onClick={() => canContinue && router.push('/signup')}
          disabled={!canContinue}
          className={`w-full h-[54px] rounded-2xl text-[15px] font-semibold transition-colors ${
            canContinue ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
          }`}
        >
          동의하고 계속하기
        </button>
      </div>
    </div>
  );
}
