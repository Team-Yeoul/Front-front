'use client';

import { useParams, useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/primitives';
import { TermsBody, isTermsKey } from '@/components/ui/terms';

// 설정 > 이용약관 / 개인정보 처리방침: 동의 체크 없이 본문만 보여 준다.
export default function SettingsTermsPage() {
  const { key } = useParams<{ key: string }>();
  const router = useRouter();
  // 설정으로 새 항목을 push하면 설정의 뒤로가기(router.back)가 다시 이 페이지로 돌아오므로, 기록을 되돌린다.
  const back = () => (window.history.length > 1 ? router.back() : router.replace('/settings'));

  return (
    <Screen>
      <TopBar onBack={back} />
      <div className="px-6 pt-2 pb-10">
        {isTermsKey(key) ? <TermsBody termsKey={key} /> : <p className="text-[15px] text-sub">약관을 찾을 수 없어요.</p>}
      </div>
    </Screen>
  );
}
