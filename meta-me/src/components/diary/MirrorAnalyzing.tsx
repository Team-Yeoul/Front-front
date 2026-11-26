'use client';

import { useEffect, useRef, useState } from 'react';
import { View } from '@/components/ui/rn';
import { Screen } from '@/components/ui/Screen';
import { BackButton } from '@/components/ui/primitives';
import { Glow } from '@/components/ui/Glow';
import { Text } from '@/components/ui/Text';
import type { Mood } from '@/lib/mood';
import { useTheme } from '@/lib/theme';

const STEPS = [
  { label: '사실만 추려내기', tile: '#EEF0FF', color: '#6367FF', d: 'M4 5h16l-6 7.5V19l-4-2v-4.5Z' },
  {
    label: '관찰자 시점으로 다시 쓰기',
    tile: '#FFEDE3',
    color: '#E5732E',
    d: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5Z',
  },
  { label: '패턴 태깅', tile: '#EEF0F5', color: '#8A8A96', d: 'M3.5 4.5v6.8l9 9 7.3-7.3-9-9H3.5ZM8 8.5a1 1 0 1 0 0-.01' },
];

const hexRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

/** 흐려졌다 돌아오기를 반복한다(animate-pulse). 움직임 줄이기 설정이면 멈춘다. */
function PulseDot({ delay, faded }: { delay: number; faded?: boolean }) {
  return (
    <View
      className={`w-1.5 h-1.5 shrink-0 rounded-full motion-safe:animate-pulse ${faded ? 'bg-primary/50' : 'bg-primary'}`}
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

/**
 * 객관화 미러 — 변환 중 (12b). 단계가 하나씩 끝나며 체크가 붙고, 다 끝나면 onDone을 부른다.
 * 배경은 고른 기분 색을 은은하게 깐다.
 */
export function MirrorAnalyzing({ mood, onDone, onBack, stepMs = 1100 }: { mood: Mood; onDone: () => void; onBack: () => void; stepMs?: number }) {
  const [done, setDone] = useState(0);
  // 부모가 매 렌더마다 새 onDone을 넘겨도 단계 타이머가 처음부터 다시 돌지 않게 ref로 붙잡아 둔다.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (done >= STEPS.length) {
      const t = setTimeout(() => onDoneRef.current(), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), stepMs);
    return () => clearTimeout(t);
  }, [done, stepMs]);

  const { fg, bg } = useTheme();
  const rgb = hexRgb(mood.dot);
  return (
    <Screen
      bg="#FFFDF6"
      background={
        <Glow
          bg={bg('#FFFDF6')}
          layers={[
            { w: 60, h: 40, x: 50, y: 38, rgb, stops: [[0, 0.4], [0.7, 0]] },
            { w: 50, h: 30, x: 100, y: 5, rgb, stops: [[0, 0.33], [0.7, 0]] },
            { w: 50, h: 30, x: 0, y: 100, rgb, stops: [[0, 0.33], [0.7, 0]] },
          ]}
        />
      }
    >
      <View className="px-5 pt-2 flex-row">
        <BackButton onPress={onBack} />
      </View>
      <View className="items-center pt-[60px]">
        <Text className="text-[16px] text-text-3">잠시만 기다려주세요...</Text>
        <Text accessibilityRole="header" className="mt-2.5 text-center text-[24px] font-bold leading-[34px] tracking-[-0.5px] text-ink">
          {'감정 밖에서\n내 기록을 읽고 있어요'}
        </Text>
      </View>
      <View className="mx-6 mt-[60px] rounded-3xl bg-page/60 px-6 py-3" accessibilityLiveRegion="polite">
        {STEPS.map((s, i) => {
          const state = i < done ? 'done' : i === done ? 'now' : 'wait';
          return (
            <View key={s.label} className="h-[68px] flex-row items-center gap-4">
              <View
                className="w-9 h-9 shrink-0 rounded-xl items-center justify-center"
                style={{ backgroundColor: bg(s.tile), opacity: state === 'wait' ? 0.6 : 1 }}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden>
                  <path d={s.d} fill={fg(s.color)} fillRule="evenodd" />
                </svg>
              </View>
              <Text className={`flex-1 text-[16px] font-semibold ${state === 'wait' ? 'text-mute' : 'text-ink'}`}>{s.label}</Text>
              {state === 'done' ? (
                <View className="w-6 h-6 shrink-0 rounded-full bg-primary items-center justify-center" accessibilityLabel="완료">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </View>
              ) : state === 'now' ? (
                <View className="w-6 shrink-0 items-center gap-1" accessibilityLabel="진행 중">
                  <PulseDot delay={0} />
                  <PulseDot delay={200} faded />
                </View>
              ) : (
                <Text className="text-[12px] text-mute">대기</Text>
              )}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
