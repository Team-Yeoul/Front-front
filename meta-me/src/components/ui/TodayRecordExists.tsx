'use client';

import { useRouter } from 'next/navigation';
import { Screen } from './Screen';
import { Button, Img3D, TextButton, TopBar } from './primitives';

/** 오늘 기록이 이미 있을 때: 새로 써서 덮어쓰는 대신 기존 기록을 보거나 수정하게 한다. */
export function TodayRecordExists({ recordId }: { recordId: string | null }) {
  const router = useRouter();
  return (
    <Screen
      footer={
        recordId ? (
          <>
            <Button onClick={() => router.replace(`/diary/write?edit=${recordId}`)}>오늘 기록 수정하기</Button>
            <TextButton className="mt-1" onClick={() => router.replace(`/diary/detail?id=${recordId}`)}>
              기록 보기
            </TextButton>
          </>
        ) : (
          <Button onClick={() => router.replace('/diary')}>다이어리로</Button>
        )
      }
    >
      <TopBar title="오늘의 기록" />
      <div className="flex flex-col items-center pt-24 px-8 text-center">
        <Img3D name="check" size={96} />
        <h1 className="text-[22px] font-bold text-ink mt-4">오늘 기록이 이미 있어요</h1>
        <p className="text-[14px] text-sub mt-2 leading-relaxed">
          기록은 하루에 하나만 남길 수 있어요.
          <br />
          새로 쓰면 지금 기록이 사라지니, 수정해 주세요.
        </p>
      </div>
    </Screen>
  );
}
