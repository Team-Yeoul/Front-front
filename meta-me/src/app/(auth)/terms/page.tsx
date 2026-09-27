'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTermsStore } from '@/store';

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

type TermsKey = 'service' | 'privacy';

const TERMS_CONTENT: Record<TermsKey, { title: string; body: string }> = {
  service: {
    title: '서비스 이용 약관',
    body: `제1조 (목적)
이 약관은 MetaMe(이하 "회사")가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 정함을 목적으로 합니다.

제2조 (정의)
"서비스"란 회사가 제공하는 기록·리포트·객관화 관련 모든 서비스를 말하며, "이용자"란 이 약관에 따라 서비스를 이용하는 회원을 말합니다.

제3조 (약관의 효력 및 변경)
이 약관은 서비스 화면에 게시함으로써 효력이 발생하며, 회사는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있습니다.

제4조 (이용자의 의무)
이용자는 관계 법령, 이 약관의 규정, 이용안내 등 회사가 통지하는 사항을 준수하여야 하며, 타인의 정보를 도용하거나 서비스 운영을 방해하는 행위를 해서는 안 됩니다.

제5조 (서비스의 제공 및 변경)
회사는 서비스의 내용을 개선하기 위해 필요한 경우 서비스의 전부 또는 일부를 변경할 수 있으며, 사전에 공지합니다.

제6조 (계약 해지)
이용자는 언제든지 서비스 내 설정을 통해 이용계약 해지(회원탈퇴)를 신청할 수 있습니다.

※ 본 내용은 초안이며, 실제 서비스 출시 전 법무 검토를 거쳐 확정됩니다.`,
  },
  privacy: {
    title: '개인정보 처리방침',
    body: `1. 수집하는 개인정보 항목
회사는 회원가입, 서비스 이용 과정에서 이메일, 비밀번호, 닉네임, 기록 데이터 등을 수집할 수 있습니다.

2. 개인정보의 수집 및 이용 목적
- 회원 가입 의사 확인 및 본인 인증
- 서비스 제공, 콘텐츠 및 리포트 생성
- 부정 이용 방지 및 고지사항 전달

3. 개인정보의 보유 및 이용기간
회원 탈퇴 시 지체 없이 파기하며, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.

4. 개인정보의 제3자 제공
이용자의 동의가 있거나 법령에 특별한 규정이 있는 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다.

5. 이용자의 권리
이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제, 처리정지를 요청할 수 있습니다.

※ 본 내용은 초안이며, 실제 서비스 출시 전 법무 검토를 거쳐 확정됩니다.`,
  },
};

function TermsDetailModal({ termsKey, onClose }: { termsKey: TermsKey; onClose: () => void }) {
  const { title, body } = TERMS_CONTENT[termsKey];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-h-[80vh] bg-white rounded-t-3xl flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <h2 className="text-[17px] font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="-mr-2 p-2" aria-label="닫기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-line">{body}</p>
        </div>
        <div className="px-5 py-4 pb-6 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-2xl bg-gray-900 text-white text-[14px] font-semibold"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  const router = useRouter();
  const setTerms = useTermsStore((s) => s.setTerms);
  const [service, setService] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [detailView, setDetailView] = useState<TermsKey | null>(null);

  const allChecked = service && privacy && marketing;
  const canContinue = service && privacy;

  const handleAllRequired = () => {
    const next = !allChecked;
    setService(next);
    setPrivacy(next);
    setMarketing(next);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      {/* 뒤로가기 */}
      <div className="px-5 pt-4 pb-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100"
        >
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
            <path d="M8 1.5L1.5 7.5L8 13.5" stroke="#1C1C1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
          <CircleCheckbox checked={allChecked} />
          <span className="text-[15px] font-semibold text-gray-900">필수 약관 전체 동의하기</span>
        </button>

        <div className="h-px bg-gray-100 mx-0" />

        {/* 서비스 이용 약관 */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <button className="-m-2 p-2" onClick={() => setService(!service)}>
            <CircleCheckbox checked={service} />
          </button>
          <button
            type="button"
            onClick={() => setDetailView('service')}
            className="flex-1 flex items-center gap-3 py-1 text-left"
          >
            <span className="flex-1 text-[14px] text-gray-700">서비스 이용 약관</span>
            <ChevronRight />
          </button>
        </div>

        {/* 개인정보 처리방침 */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <button className="-m-2 p-2" onClick={() => setPrivacy(!privacy)}>
            <CircleCheckbox checked={privacy} />
          </button>
          <button
            type="button"
            onClick={() => setDetailView('privacy')}
            className="flex-1 flex items-center gap-3 py-1 text-left"
          >
            <span className="flex-1 text-[14px] text-gray-700">개인정보 처리방침</span>
            <ChevronRight />
          </button>
        </div>

        {/* 마케팅 수신 (선택) */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <button className="-m-2 p-2" onClick={() => setMarketing(!marketing)}>
            <CircleCheckbox checked={marketing} />
          </button>
          <span className="flex-1 text-[14px] text-gray-500">[선택] 마케팅 정보 수신</span>
          <ChevronRight />
        </div>
      </div>

      {/* 계속하기 버튼 */}
      <div className="mt-auto px-5 py-5">
        <button
          onClick={() => {
            if (!canContinue) return;
            setTerms({ service, privacy, marketing });
            router.push('/signup');
          }}
          disabled={!canContinue}
          className={`w-full h-[54px] rounded-2xl text-[15px] font-semibold transition-colors ${
            canContinue ? 'bg-[#1a1a1a] text-white' : 'bg-gray-200 text-gray-400'
          }`}
        >
          동의하고 계속하기
        </button>
      </div>

      {detailView && <TermsDetailModal termsKey={detailView} onClose={() => setDetailView(null)} />}
    </div>
  );
}
