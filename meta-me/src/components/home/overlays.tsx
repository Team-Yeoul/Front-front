'use client';

import { useEffect, useState } from 'react';
import { router, type Href } from '@/lib/router';
import { useAuthStore } from '@/store';
import { useGetTodayDailyQuestion } from '@/entities/diary';
import { Span, Text } from '@/components/ui/Text';
import { CloseIcon } from '@/components/ui/icons';
import { usePresence } from '@/components/ui/primitives';
import { useEscape } from '@/components/ui/overlays';
import { Img, Portal, Pressable, View, asset } from '@/components/ui/rn';
import { toDateKey } from '@/lib/date';

/** 코그니를 아직 못 만났을 때 대신 보여주는 메타미 캐릭터 */
/** 코그니가 없을 때 홈에 띄우는 기본 그림 */
export const MASCOT = asset('v2/cogni-default.png');

const TUTORIAL_KEY = 'metame-home-tutorial-done';
const QUESTION_KEY = 'metame-today-question-seen';

// 앱 AsyncStorage 자리. 사생활 보호 창 등에서 막혀도 화면은 그대로 뜨게 한다.
const storage = {
  get: (key: string) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // 저장하지 못하면 다음에 한 번 더 뜰 뿐이다.
    }
  },
};

/**
 * 홈에 들어왔을 때 띄울 것: 처음 한 번은 튜토리얼(10t), 그 뒤엔 하루 한 번 오늘의 질문 시트(10a0).
 * 오늘 이미 기록했으면 질문 시트는 띄우지 않는다.
 */
export function useHomeIntro(questionEligible: boolean, ready: boolean) {
  const [show, setShow] = useState<'tutorial' | 'question' | null>(null);
  const [checked, setChecked] = useState(false);

  // 오늘 기록 여부를 불러온 뒤에 한 번만 정한다(불러오기 전엔 '안 썼음'으로 보여서 시트가 잘못 뜬다).
  useEffect(() => {
    if (checked || !ready) return;
    const tutorial = storage.get(TUTORIAL_KEY);
    const seen = storage.get(QUESTION_KEY);
    setChecked(true);
    if (!tutorial) setShow('tutorial');
    else if (questionEligible && seen !== toDateKey(new Date())) setShow('question');
  }, [checked, ready, questionEligible]);

  const done = () => {
    if (show === 'tutorial') storage.set(TUTORIAL_KEY, '1');
    if (show === 'question') storage.set(QUESTION_KEY, toDateKey(new Date()));
    setShow(null);
  };
  return { show, done };
}

/* ── 첫 진입 튜토리얼 (10t ~ 10t5) ─────────────────────── */

const TUTORIAL = [
  { title: '하루 한 번, 질문 3개에 답하며\n오늘의 장면을 기록해요', top: true, image: asset('home/tutorial-1.png') },
  { title: '기록한 날은 체크로 쌓여요\n연속 기록을 이어가 보세요', top: true, image: asset('home/tutorial-2.png') },
  { title: 'AI와 대화하며\n오늘의 기록을 완성해요', top: false, image: asset('home/tutorial-3.png') },
  { title: '감정 밖에서 내 기록을\n관찰자 시점으로 다시 읽어줘요', top: true, image: asset('home/tutorial-4.png') },
  { title: '기록이 쌓이면 리포트에서\n남이 보는 나와 비교할 수 있어요', top: false, image: asset('home/tutorial-5.png') },
];

export function HomeTutorial({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  // 앱: 배경 FadeIn 200ms · 카드 ZoomIn 220ms
  const fade = usePresence(true, 200);
  const zoom = usePresence(true, 220);
  useEscape(true, onClose);
  const s = TUTORIAL[i];
  const last = i === TUTORIAL.length - 1;
  const title = (
    <View className={s.top ? 'bg-primary px-6 pt-8 pb-2' : 'bg-surface-2 px-6 pt-5 pb-6'}>
      <Text className={`text-center text-[20px] font-bold leading-[28px] tracking-tight ${s.top ? 'text-white' : 'text-ink'}`}>{s.title}</Text>
    </View>
  );
  return (
    <Portal>
      <View
        role="dialog"
        aria-modal
        className="absolute inset-0 z-50 items-center justify-center px-7 bg-[#11111E]/62"
        style={{ opacity: fade.active ? 1 : 0, transition: fade.transition }}
        accessibilityLabel="메타미 사용법"
      >
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="닫기" className="mb-7 w-11 h-11 shrink-0 rounded-full bg-[#2A2A35]/80 items-center justify-center">
          <CloseIcon color="#FFFFFF" />
        </Pressable>
        <View
          className="w-full max-w-[374px] shrink-0 rounded-[28px] bg-page overflow-hidden"
          style={{ opacity: zoom.active ? 1 : 0, transform: `scale(${zoom.active ? 1 : 0})`, transition: zoom.transition }}
        >
          {s.top && title}
          <Img src={s.image} width="100%" contentFit="cover" style={{ aspectRatio: 374 / 290, height: 'auto' }} />
          {!s.top && title}
          <View className="h-16 px-6 flex-row items-center justify-between">
            <Pressable onPress={() => setI(i - 1)} disabled={i === 0} className={`h-11 justify-center ${i === 0 ? 'opacity-0' : ''}`}>
              <Text className="text-[16px] font-medium text-text-3">이전</Text>
            </Pressable>
            <View className="flex-row items-center gap-1.5" accessibilityLabel={`${TUTORIAL.length}장 중 ${i + 1}장`}>
              {TUTORIAL.map((_, k) => (
                <View key={k} className={`h-1.5 rounded-full ${k === i ? 'w-5 bg-text-3' : 'w-1.5 bg-disabled'}`} />
              ))}
            </View>
            <Pressable onPress={() => (last ? onClose() : setI(i + 1))} className="h-11 justify-center">
              <Text className={`text-[16px] ${i === 0 ? 'font-medium text-text-3' : 'font-bold text-primary'}`}>{last ? '시작하기' : '다음'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Portal>
  );
}

/* ── 오늘의 질문 시트 (10a0) ──────────────────────────── */

export function TodayQuestionSheet({
  name,
  streak,
  character,
  href,
  onClose,
}: {
  name?: string;
  streak: number;
  /** 코그니 그림 주소 (없으면 메타미 캐릭터) */
  character?: string;
  href: Href;
  onClose: () => void;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data } = useGetTodayDailyQuestion(!!accessToken);
  const question = data?.question?.question_text || '오늘 하루는 어떤 장면으로 남았나요?';
  const now = new Date();
  // 앱: 배경 FadeIn 200ms · 시트 SlideInDown 280ms
  const fade = usePresence(true, 200);
  const slide = usePresence(true, 280);
  useEscape(true, onClose);

  return (
    <Portal>
      <View role="dialog" aria-modal className="absolute inset-0 z-50 justify-end">
        <View className="absolute inset-0 bg-[#11111E]/62" style={{ opacity: fade.active ? 1 : 0, transition: fade.transition }}>
          <Pressable className="flex-1" onPress={onClose} accessibilityLabel="닫기" tabIndex={-1} />
        </View>
        <View
          className="mx-3 shrink-0 rounded-[36px] bg-page px-6 pt-3 pb-4"
          style={{
            marginBottom: 'max(var(--safe-bottom), 12px)',
            boxShadow: '0 -8px 40px rgba(30,30,60,0.18)',
            transform: `translateY(${slide.active ? '0' : 'calc(100% + 40px)'})`,
            transition: slide.transition,
          }}
          accessibilityLabel="오늘의 질문"
        >
          <View className="items-center">
            <View className="w-9 h-[5px] rounded-full bg-track" />
          </View>
          <Img src={character ?? MASCOT} width={108} height={107} contentFit="contain" style={{ position: 'absolute', right: 16, top: -50 }} />
          <View className="mt-[22px] self-start rounded-full bg-primary-soft px-2.5 py-1.5">
            <Text className="text-[12px] font-semibold text-primary-pressed">
              오늘의 질문 · {now.getMonth() + 1}월 {now.getDate()}일
            </Text>
          </View>
          <Text className="mt-2.5 text-[24px] font-bold leading-[34px] tracking-tight text-ink">{`${name ? `${name}님, ` : ''}오늘의 질문이\n도착했어요`}</Text>
          <View className="mt-5 rounded-[20px] bg-surface px-5 py-5">
            <Text className="text-[20px] font-semibold leading-[28px] tracking-tight text-ink">“{question}”</Text>
            <Text className="mt-2 text-[12px] text-sub">
              3분이면 충분해요 · 답하면 <Span className="font-semibold text-primary">연속 {streak + 1}일째</Span>
            </Text>
          </View>
          <Pressable
            onPress={() => {
              onClose();
              router.push(href);
            }}
            accessibilityRole="button"
            className="mt-5 w-full h-16 rounded-2xl bg-primary items-center justify-center"
            style={{ boxShadow: '0 8px 20px rgba(99,103,255,0.28)' }}
          >
            <Text className="text-[16px] font-bold text-white">지금 답하기</Text>
          </Pressable>
          <Pressable onPress={onClose} accessibilityRole="button" className="w-full h-12 items-center justify-center">
            <Text className="text-[16px] font-medium text-sub">나중에 할게요</Text>
          </Pressable>
        </View>
      </View>
    </Portal>
  );
}
