'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useSensitiveConsent } from '@/hooks/useSensitiveConsent';
import { Screen } from '@/components/ui/Screen';
import { Button, Img3D, TextButton } from '@/components/ui/primitives';
import { Sheet } from '@/components/ui/overlays';
import { TermsBody } from '@/components/ui/terms';

/**
 * 민감정보(기록·AI 분석)를 다루는 화면. 홈·마이페이지·설정은 동의 없이도 열려야
 * 동의를 철회한 사용자가 설정이나 탈퇴로 갈 수 있으므로 넣지 않는다.
 */
const GATED = ['/onboarding', '/diary', '/chat', '/report', '/dogam', '/mirror', '/mypage/report', '/challenge'];
const isGated = (path: string) => GATED.some((p) => path === p || path.startsWith(`${p}/`));

/** 민감정보 처리에 동의하지 않은 사용자가 기록·AI 화면에 들어오면 동의 화면을 대신 보여 준다. */
export function SensitiveConsentGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const { agreed } = useSensitiveConsent();

  if (!token || agreed || !isGated(pathname)) return <>{children}</>;
  return <ConsentRequired />;
}

function ConsentRequired() {
  const router = useRouter();
  const { agree } = useSensitiveConsent();
  const [detail, setDetail] = useState(false);

  return (
    <Screen
      overlay={
        <Sheet open={detail} onClose={() => setDetail(false)} height="82%">
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-5">
            <TermsBody termsKey="sensitive" />
            <div className="h-6" />
          </div>
          <div className="px-5 pt-3 pb-5 border-t border-line">
            <Button onClick={() => setDetail(false)}>확인했어요</Button>
          </div>
        </Sheet>
      }
      footer={
        <div className="flex flex-col gap-1">
          <Button onClick={agree}>동의하고 계속하기</Button>
          <TextButton className="text-sub" onClick={() => router.replace('/main')}>
            나중에 할게요
          </TextButton>
        </div>
      }
    >
      <div className="px-6 pt-16 flex flex-col items-center text-center">
        <Img3D name="lock3d" size={96} />
        <h1 className="text-[22px] font-bold text-ink mt-6">민감정보 처리 동의가 필요해요</h1>
        <p className="text-[15px] text-sub leading-[1.7] mt-3">
          기록과 AI 대화에는 생각과 감정이 담겨요.
          <br />
          이 정보를 저장하고 AI로 분석하려면
          <br />
          따로 동의를 받아야 해요.
        </p>
        <ul className="mt-7 w-full rounded-2xl bg-surface px-5 py-4 text-left text-[14px] text-[#48484F] leading-[1.7] flex flex-col gap-1.5">
          <li>· 기록·AI 대화를 저장하고 AI로 분석해요</li>
          <li>· 분석을 위해 미국 OpenAI로 보내지만 AI 학습에는 쓰지 않아요</li>
          <li>· 동의하지 않으면 기록, 리포트, AI 대화를 쓸 수 없어요</li>
          <li>· 설정에서 언제든 철회할 수 있어요</li>
        </ul>
        <button onClick={() => setDetail(true)} className="mt-4 text-[14px] font-semibold text-primary underline underline-offset-4">
          동의 내용 자세히 보기
        </button>
      </div>
    </Screen>
  );
}
