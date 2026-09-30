'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useGetMyProfile } from '@/entities/user';
import { Screen } from '@/components/ui/Screen';
import { Button, ProgressBar, TextButton, TopBar } from '@/components/ui/primitives';
import { MOCK_SENTENCE } from '@/lib/mock';

export default function MySentencePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  const current = profile?.profile.ai_first_sentence || MOCK_SENTENCE.current;
  const accuracy = accessToken ? (profile?.latest_accuracy?.accuracy_percent ?? 0) : MOCK_SENTENCE.accuracy;

  return (
    <Screen
      footer={
        <>
          <Button onClick={() => router.push('/onboarding')}>문장 다시 쓰기</Button>
          <TextButton className="mt-1" onClick={() => router.push('/report')}>
            리포트로 돌아가기
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
          <p className="text-[18px] font-bold text-ink leading-[1.55] mt-3">{current}</p>
          <ProgressBar value={accuracy} className="mt-5" track="#D9DBFF" height={6} />
        </div>
        <p className="text-[14px] font-bold text-ink mt-7">문장이 바뀌어 온 기록</p>
        <div className="flex flex-col gap-3 mt-3">
          {MOCK_SENTENCE.history.map((h) => (
            <div key={h.week} className="rounded-2xl bg-card border border-line px-4 py-4">
              <div className="flex justify-between">
                <span className="text-[14px] font-bold text-ink">{h.week}</span>
                <span className="font-mono text-[12px] text-mute">{h.accuracy}%</span>
              </div>
              <p className="text-[14px] text-[#48484F] mt-2">{h.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
