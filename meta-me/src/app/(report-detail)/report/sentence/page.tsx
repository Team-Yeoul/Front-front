'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useGetMyProfile } from '@/entities/user';
import { Screen } from '@/components/ui/Screen';
import { Button, ProgressBar, TextButton, TopBar } from '@/components/ui/primitives';
import { useMe } from '@/hooks/useMe';

export default function MySentencePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  const { mySentence } = useMe();
  const current = profile?.profile.ai_first_sentence || mySentence;
  const accuracy = profile?.latest_accuracy?.accuracy_percent ?? 0;

  return (
    <Screen
      footer={
        <>
          {/* 온보딩은 한 번만 제출할 수 있어(409) 여기서 다시 보내지 않는다. 문장은 기록이 쌓이며 갱신된다. */}
          <Button onClick={() => router.push('/main')}>홈으로</Button>
          <TextButton className="mt-1" onClick={() => router.push('/report')}>
            리포트 보기
          </TextButton>
        </>
      }
    >
      <TopBar title="나의 문장" />
      <div className="px-5 pt-3 pb-6">
        <div className="rounded-3xl bg-primary-soft px-5 py-5">
          <div className="flex justify-between text-[13px] font-semibold text-primary">
            <span>현재 문장</span>
            <span>정확도 {accuracy}%</span>
          </div>
          <p className={`text-[18px] font-bold leading-[1.55] mt-3 ${current ? 'text-ink' : 'text-sub'}`}>{current || '아직 나의 문장이 없어요'}</p>
          <ProgressBar value={accuracy} className="mt-5" track="#D9DBFF" height={6} />
        </div>
        <p className="text-[14px] font-bold text-ink mt-7">문장이 바뀌어 온 기록</p>
        <p className="text-[13px] text-sub mt-3">기록이 쌓여 문장이 바뀌면 여기에 순서대로 남아요.</p>
      </div>
    </Screen>
  );
}
