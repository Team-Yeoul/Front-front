'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';
import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Img, Pressable, ScrollView, View, asset } from '@/components/ui/rn';
import { ChatBackdrop, GlassBack, GlassCircle, PillComposer } from '@/components/ui/chatV3';
import {
  ChipBookIcon,
  ChipClockIcon,
  ChipHeartIcon,
  ChipPenIcon,
  ChipPeopleIcon,
  ChipSmileIcon,
  ChipStarIcon,
  MoreIcon,
  SparkleIcon,
} from '@/components/ui/chatIcons';
import { useTheme } from '@/lib/theme';

const HERO = asset('diary/hero.png');
/** 직접 쓰기(기록 B) 경로 */
const WRITE_HREF = '/diary/write';
const SOFT_SHADOW = { boxShadow: '0 6px 18px rgba(99,103,255,0.1)' } as const;
const PILL_SHADOW = { boxShadow: '0 6px 18px rgba(99,103,255,0.14)' } as const;
/**
 * 칩 줄은 4c처럼 가운데 정렬이 아니라 왼쪽부터 놓여 화면 밖으로 넘친다(옆으로 밀어 더 볼 수 있다).
 * 1줄은 왼쪽 20, 2줄은 첫 칩이 28 잘려 보이게, 3줄은 왼쪽 8에서 시작한다.
 */
const ROW_START = [{ pad: 20, scroll: 0 }, { pad: 20, scroll: 48 }, { pad: 8, scroll: 0 }];

/**
 * 첫 화면(4c)의 이야깃거리. 한 장면·직접 쓰기는 직접 쓰는 기록(기록 B)으로, 나머지는 메타미와의 대화로 시작한다.
 * 굵은 앞부분 + 보라 뒷부분으로 나눠 보여준다. question은 대화 탭에서 이 주제로 대화를 열 때 메타미가 먼저 건네는 말.
 */
export type ChatTopic = { head: string; tail: string; Icon: ComponentType<{ size?: number }>; bg: string; write?: boolean; question?: string };
const TOPIC_ROWS: ChatTopic[][] = [
  [
    { head: '어제처럼', tail: '몰입했나요?', Icon: ChipClockIcon, bg: '#FFF4C2', question: '어제처럼 오늘도 무언가에 푹 빠졌던 순간이 있었나요? 어떤 순간이었는지 들려주세요.' },
    { head: '지금 감정', tail: '한 단어로', Icon: ChipSmileIcon, bg: '#FFE4EC', question: '지금 감정을 한 단어로 말해 본다면 뭐예요?' },
  ],
  [
    { head: '오늘 나다웠던', tail: '순간', Icon: ChipStarIcon, bg: '#EEF0FF', question: '오늘 가장 나다웠다고 느낀 순간은 언제였나요?' },
    { head: '그 선택의', tail: '이유', Icon: ChipBookIcon, bg: '#E3F4EA', question: '최근에 내린 선택 하나를 떠올려 볼까요? 왜 그렇게 골랐는지 궁금해요.' },
  ],
  [
    { head: '오늘의', tail: '한 장면', Icon: ChipHeartIcon, bg: '#FFE4EC', write: true },
    { head: '직접', tail: '쓰기', Icon: ChipPenIcon, bg: '#EEF0FF', write: true },
    { head: '고마웠던', tail: '사람', Icon: ChipPeopleIcon, bg: '#FFEBDD', question: '최근에 고마웠던 사람이 있나요? 어떤 일이 있었는지 들려주세요.' },
  ],
];

/**
 * 메타미 대화 첫 화면 (v3 4c): 그림 · "○○님을 위한 오늘의 질문" · "오늘은 어땠어요?" · 이야깃거리 칩 · 알약 입력칸.
 * 기록 A(오늘의 기록)와 대화 탭이 함께 쓴다. 칩·입력을 받은 뒤 무엇을 시작할지는 부르는 쪽이 정한다.
 */
export function ChatIntro({
  name,
  onBack,
  onMore,
  onTopic,
  onSend,
  disabled = false,
  maxLength,
  inTabs = false,
}: {
  name?: string;
  onBack: () => void;
  /** 오른쪽 위 더보기(···). 없으면 버튼을 숨긴다. */
  onMore?: () => void;
  /** 대화로 시작하는 칩을 눌렀을 때 */
  onTopic: (topic: ChatTopic) => void;
  /** 입력칸에 쓴 말을 보냈을 때 */
  onSend: (text: string) => void;
  /** 질문을 불러오는 중처럼 아직 대화를 시작하면 안 될 때 */
  disabled?: boolean;
  maxLength?: number;
  inTabs?: boolean;
}) {
  const [text, setText] = useState('');
  const { isDark } = useTheme();
  // 다크(4c-dk)에서는 아이콘 원이 한 단계 밝은 서피스, 보라 계열만 선택색이다.
  const tileBg = (c: string) => (!isDark ? c : c === '#EEF0FF' ? '#2A2850' : '#23222C');
  return (
    <Screen
      inTabs={inTabs}
      bg="#F1EFF8"
      background={<ChatBackdrop intro />}
      contentClassName="flex-grow"
      footerClassName="px-5 pt-1"
      footer={
        <PillComposer
          value={text}
          onChange={setText}
          onSend={() => {
            const t = text.trim();
            if (!t) return;
            setText('');
            onSend(t);
          }}
          sendEnabled={!disabled && text.trim().length > 0}
          placeholder="메타미에게 이야기하기"
          maxLength={maxLength}
        />
      }
    >
      <View className="flex-1">
        <View className="px-5 pt-1.5 flex-row items-center justify-between">
          <GlassBack onPress={onBack} />
          {onMore && (
            <GlassCircle onPress={onMore} label="더보기">
              <MoreIcon size={22} />
            </GlassCircle>
          )}
        </View>
        {/* 다크(4c-dk)는 그림 없이 그라데이션만 보인다. 자리는 그대로 둔다. */}
        <Img
          src={HERO}
          contentFit="contain"
          className="pointer-events-none"
          style={{ width: '100%', height: 'auto', aspectRatio: 860 / 796, marginTop: -4, opacity: isDark ? 0 : 1 }}
        />
        <View className="items-center -mt-1">
          <View className="h-10 px-[18px] rounded-full bg-page dark:bg-surface flex-row items-center gap-2" style={PILL_SHADOW}>
            <SparkleIcon size={16} />
            <Text className="text-[16px] font-semibold text-ink">{name ? `${name}님을 위한 오늘의 질문` : '오늘의 질문'}</Text>
          </View>
          {/* 4c: 제목 뒷부분은 #8A6BFF→#6367FF 그라데이션. 글자 그라데이션 대신 그 중간색으로 칠한다. */}
          <Text accessibilityRole="header" className="mt-[18px] text-[24px] font-bold leading-[30px] tracking-[-0.7px] text-ink">
            오늘은 <Text className="text-[24px] font-bold text-[#7569FF]">어땠어요?</Text>
          </Text>
        </View>
        <View className="mt-auto pt-[26px] pb-[22px] gap-3">
          {TOPIC_ROWS.map((row, r) => (
            <TopicRow key={r} row={row} start={ROW_START[r]} disabled={disabled} tileBg={tileBg} onTopic={onTopic} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

/** 이야깃거리 칩 한 줄. 옆으로 넘치면 밀어서 나머지 칩을 볼 수 있다. */
function TopicRow({
  row,
  start,
  disabled,
  tileBg,
  onTopic,
}: {
  row: ChatTopic[];
  onTopic: (topic: ChatTopic) => void;
  start: { pad: number; scroll: number };
  disabled: boolean;
  tileBg: (c: string) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // 2줄은 첫 칩이 살짝 잘려 보이게 처음 위치를 옆으로 밀어 둔다(4c).
  useEffect(() => {
    if (start.scroll && ref.current) ref.current.scrollLeft = start.scroll;
  }, [start.scroll]);
  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingLeft: start.pad, paddingRight: 20, gap: 10, paddingTop: 6, paddingBottom: 6 }}
      style={{ marginTop: -6, marginBottom: -6 }}
    >
      {row.map((t) => {
        const off = !t.write && disabled;
        return (
          <Pressable
            key={t.head + t.tail}
            disabled={off}
            onPress={() => (t.write ? router.push(WRITE_HREF) : onTopic(t))}
            accessibilityRole="button"
            accessibilityState={{ disabled: off }}
            className={`h-[46px] shrink-0 rounded-full bg-page/90 dark:bg-surface pl-2 pr-[18px] flex-row items-center gap-2.5 ${off ? 'opacity-60' : ''}`}
            style={SOFT_SHADOW}
          >
            <View className="w-[30px] h-[30px] shrink-0 rounded-full items-center justify-center" style={{ backgroundColor: tileBg(t.bg) }}>
              <t.Icon size={16} />
            </View>
            <Text numberOfLines={1} className="text-[14px] font-semibold text-ink">
              {t.head} <Text className="text-[14px] font-medium text-primary">{t.tail}</Text>
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
