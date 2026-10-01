'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Button, ChatFab, Segmented, TopBar } from '@/components/ui/primitives';
import { AskSheet } from '@/components/ui/AskSheet';
import { readLastWrite, type LastWrite } from '@/lib/lastWrite';

export default function MirrorPage() {
  const router = useRouter();
  const [result, setResult] = useState<LastWrite | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<'objective' | 'original'>('objective');
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    setResult(readLastWrite());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!result) {
    return (
      <Screen footer={<Button onClick={() => router.push('/diary')}>다이어리로</Button>}>
        <TopBar title="객관화 미러" onBack={() => router.push('/diary')} />
        <p className="text-center text-[14px] text-sub mt-24">표시할 객관화 결과가 없어요.</p>
      </Screen>
    );
  }

  const hasCogni = result.unlocked.length > 0;

  return (
    <Screen
      footer={
        <Button onClick={() => router.push(hasCogni ? '/diary/cogni' : '/diary/streak')}>{hasCogni ? '발견된 코그니 보기' : '기록 마치기'}</Button>
      }
      overlay={
        <>
          <ChatFab className="absolute right-5 bottom-[96px] z-20" onClick={() => setAsk(true)} />
          <AskSheet open={ask} onClose={() => setAsk(false)} context="객관화 미러" />
        </>
      }
    >
      <TopBar title="객관화 미러" onBack={() => router.push('/diary')} />
      <div className="px-5 pt-3 pb-6">
        <Segmented
          options={[
            { value: 'objective', label: '객관화' },
            { value: 'original', label: '내가 쓴 원문' },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="mt-4 rounded-3xl bg-surface px-5 py-6">
          <p className="font-mono text-[12px] tracking-[0.12em] text-mute">{tab === 'objective' ? 'OBSERVER VIEW' : 'MY WORDS'}</p>
          <p className="text-[17px] text-ink leading-[1.85] mt-3">
            {tab === 'original'
              ? result.original
              : result.objective || '객관화 결과를 받아오지 못했어요. 기록은 다이어리에 저장됐는지 확인해 주세요.'}
          </p>
        </div>

        {result.emotions.length > 0 && (
          <div className="mt-4 rounded-3xl border border-line px-5 py-5">
            <span className="text-[15px] font-bold text-ink">오늘 고른 감정</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {result.emotions.map((e, i) => (
                <span
                  key={e}
                  className={`h-9 px-4 rounded-full text-[14px] font-semibold inline-flex items-center ${i % 2 ? 'bg-yellow text-ink' : 'bg-primary text-white'}`}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}
