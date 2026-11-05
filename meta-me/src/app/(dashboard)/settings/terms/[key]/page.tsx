'use client';

import { useParams } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/primitives';
import { TermsBody, isTermsKey } from '@/components/ui/terms';

// 설정 > 이용약관 / 개인정보 처리방침: 동의 체크 없이 본문만 보여 준다.
export default function SettingsTermsPage() {
  const { key } = useParams<{ key: string }>();

  return (
    <Screen>
      <TopBar backHref="/settings" />
      <div className="px-6 pt-2 pb-10">
        {isTermsKey(key) ? <TermsBody termsKey={key} /> : <p className="text-[15px] text-sub">약관을 찾을 수 없어요.</p>}
      </div>
    </Screen>
  );
}
