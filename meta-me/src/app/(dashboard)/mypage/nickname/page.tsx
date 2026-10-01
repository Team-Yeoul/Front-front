'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useGetMyProfile, useListMyNicknames } from '@/entities/user';
import { useListMirrorMonsters } from '@/entities/dictionary';
import { Screen } from '@/components/ui/Screen';
import { Button, LockIcon, ProgressBar, TextButton, TopBar } from '@/components/ui/primitives';

const UNLOCK = 80;

/**
 * 나의 별명: AI가 붙여준 별명(nickname_type=AI)을 보여준다. 별명은 도감 칭호를 고르는 방식이라
 * monster_id로 도감 마스터 목록에서 칭호(stage_titles[0])를 찾는다. 아직 없으면 정확도 80% 목표를 보여준다.
 */
export default function NicknamePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!token);
  const accuracy = profile?.latest_accuracy?.accuracy_percent ?? 0;
  const { data: nicknames } = useListMyNicknames({ type: 'AI', size: 1 }, !!token);
  const aiNickname = nicknames?.nicknames[0];
  const { data: monsters } = useListMirrorMonsters({ size: 100 }, !!aiNickname);
  const monster = monsters?.monsters.find((m) => m.monster_id === aiNickname?.monster_id);
  const title = monster ? monster.stage_titles?.[0] || monster.monster_code : null;
  const unlocked = !!aiNickname;
  const sentence = profile?.profile.ai_first_sentence;

  return (
    <Screen
      footer={
        <>
          <Button variant="dark" onClick={() => router.push('/diary/chat')}>
            {unlocked ? '기록 이어가기' : '기록하러 가기'}
          </Button>
          <TextButton className="mt-1" onClick={() => router.push('/mypage')}>
            마이페이지로
          </TextButton>
        </>
      }
    >
      <TopBar title="나의 별명" backHref="/mypage" />
      <div className="px-5 pt-3">
        <div className="rounded-3xl bg-yellow-soft px-6 py-6">
          <p className="text-[12px] font-bold text-gold">{unlocked ? '별명이 생겼어요' : `정확도 ${UNLOCK}% 달성 시 열려요`}</p>
          {unlocked ? (
            <>
              <h1 className="text-[28px] font-bold text-ink mt-2">{title ?? '별명을 불러오는 중...'}</h1>
              {aiNickname?.reason && <p className="text-[14px] text-gold leading-[1.7] mt-3">{aiNickname.reason}</p>}
            </>
          ) : (
            <div className="flex items-center gap-2 mt-3">
              <LockIcon size={22} />
              <h1 className="text-[24px] font-bold text-ink">???</h1>
            </div>
          )}
          {!unlocked && (
            <>
          <div className="flex items-center gap-3 mt-5">
            <ProgressBar value={(accuracy / UNLOCK) * 100} track="#F1E6B8" fill="#E5B92E" height={6} />
            <span className="font-mono text-[13px] font-semibold text-gold shrink-0">
              {accuracy} / {UNLOCK}%
            </span>
          </div>
          <p className="text-[14px] text-gold leading-[1.7] mt-4">기록이 쌓여 나의 문장이 정확해질수록 별명에 가까워져요.</p>
            </>
          )}
        </div>
        <div className="mt-5 rounded-3xl bg-card border border-line px-5 py-5">
          <p className="text-[12px] font-semibold text-sub">지금 나의 문장</p>
          <p className={`text-[15px] leading-[1.7] mt-2.5 ${sentence ? 'text-ink' : 'text-sub'}`}>{sentence || '아직 나의 문장이 없어요'}</p>
        </div>
      </div>
    </Screen>
  );
}
