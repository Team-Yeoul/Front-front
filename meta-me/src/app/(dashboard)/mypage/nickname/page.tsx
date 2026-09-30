'use client';

import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Button, TextButton, TopBar } from '@/components/ui/primitives';
import { MOCK_SENTENCE } from '@/lib/mock';

export default function NicknamePage() {
  const router = useRouter();
  // 별명 API(/v1/users/me/nicknames) 응답에 별명 문자열 필드가 없어 시안 값을 쓴다.
  const nickname = '마감의 몰입러';

  const share = async () => {
    const text = `나의 별명은 '${nickname}' — metame`;
    try {
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
    } catch {
      // 공유 취소
    }
  };

  return (
    <Screen
      footer={
        <>
          <Button variant="dark" onClick={share}>
            별명 공유하기
          </Button>
          <TextButton className="mt-1" onClick={() => router.push('/mypage')}>
            마이페이지로
          </TextButton>
        </>
      }
    >
      <TopBar title="마이페이지" backHref="/mypage" />
      <div className="px-5 pt-3">
        <div className="rounded-3xl bg-yellow-soft px-6 py-6">
          <p className="text-[12px] font-bold text-gold">정확도 80% 달성 · 열림</p>
          <h1 className="text-[28px] font-bold text-ink mt-2">{nickname}</h1>
          <p className="text-[14px] text-gold leading-[1.7] mt-3">42개의 기록에서 가장 자주 나타난 모습으로 지어졌어요. 기록이 더 쌓이면 별명도 바뀔 수 있어요.</p>
        </div>
        <div className="mt-5 rounded-3xl bg-card border border-line px-5 py-5">
          <p className="text-[12px] font-semibold text-sub">근거가 된 문장</p>
          <p className="text-[15px] text-ink leading-[1.7] mt-2.5">{MOCK_SENTENCE.current}</p>
        </div>
      </div>
    </Screen>
  );
}
