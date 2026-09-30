'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetObjectiveMirror } from '@/entities/objective';
import { useAuthStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { Button, ChatFab, Segmented, TopBar } from '@/components/ui/primitives';
import { AskSheet } from '@/components/ui/AskSheet';

const MOCK = {
  objective: '팀 프로젝트에서 리더십을 발휘해 문제를 주도적으로 해결했습니다. 업무 분배 과정에서 피로감을 느꼈습니다.',
  original: '결국 또 나만 다 했다. 다들 바쁘다고 빠지고, 발표 자료랑 대본까지 혼자 만들었다. 인정받지 못한 것 같아서 분했다.',
  fact: '발표 자료와 대본을 혼자 작성함',
  feeling: '인정받지 못했다는 분함',
  patterns: ['외부 귀인', '과잉 책임'],
  note: '이번 주 세 번째 감지입니다. 피로도가 높은 날에 함께 나타나는 경향이 있어요.',
};

function MirrorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data } = useGetObjectiveMirror(id, !!accessToken && !!id);
  const [tab, setTab] = useState<'objective' | 'original'>('objective');
  const [ask, setAsk] = useState(false);

  const objective = data?.mirror.objective_fact || MOCK.objective;
  const original = data?.mirror.original_emotion || MOCK.original;

  return (
    <Screen
      footer={<Button onClick={() => router.push('/diary/cogni')}>발견된 몬스터 보기</Button>}
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
          <p className="text-[17px] text-ink leading-[1.85] mt-3">{tab === 'objective' ? objective : original}</p>
        </div>

        <p className="text-[15px] font-bold text-ink mt-6">사실과 감정 분리</p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded-2xl bg-primary-soft px-4 py-4 min-h-[96px]">
            <p className="text-[12px] font-semibold text-primary">사실</p>
            <p className="text-[13px] text-[#48484F] leading-relaxed mt-2">{MOCK.fact}</p>
          </div>
          <div className="rounded-2xl bg-yellow-soft px-4 py-4 min-h-[96px]">
            <p className="text-[12px] font-semibold text-gold">감정</p>
            <p className="text-[13px] text-[#48484F] leading-relaxed mt-2">{MOCK.feeling}</p>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-line px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-ink">감지된 패턴</span>
            <span className="font-mono text-[13px] text-mute">{MOCK.patterns.length}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <span className="h-9 px-4 rounded-full bg-primary text-white text-[14px] font-semibold inline-flex items-center">{MOCK.patterns[0]}</span>
            <span className="h-9 px-4 rounded-full bg-yellow text-ink text-[14px] font-semibold inline-flex items-center">{MOCK.patterns[1]}</span>
          </div>
          <p className="text-[13px] text-sub leading-relaxed mt-3">{MOCK.note}</p>
        </div>
      </div>
    </Screen>
  );
}

export default function MirrorPage() {
  return (
    <Suspense>
      <MirrorContent />
    </Suspense>
  );
}
