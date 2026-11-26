'use client';

import type { ReactNode } from 'react';
import { useTextCheck } from '@/lib/textQuality';
import { LinearGradient, Pressable, TextInput, View, absoluteFill } from './rn';
import { BackChevronIcon, SendArrowIcon, SparkleAvatarIcon, SparkleIcon } from './chatIcons';
import { Glow } from './Glow';
import { Text } from './Text';
import { useTheme } from '@/lib/theme';
import { MAX_TEXT_LENGTH } from '@/lib/textLimits';

/**
 * 기록 A(AI 대화형) 배경: 위는 분홍빛, 아래로 갈수록 연보라 (v3 4c · 4a · 4b).
 * 웹 CHAT_BG = radial(120% 45% at 85% 0%, #E9C3F2 → 70%에서 투명) + 세로 linear(932px 기준 지점).
 */
export function ChatBackdrop({ intro = false }: { /** 대화 시작 화면(4c). 다크에서 위가 짙은 남색인 그라데이션을 깐다(4c-dk). */ intro?: boolean } = {}) {
  const { isDark } = useTheme();
  if (isDark && intro)
    return (
      <LinearGradient
        style={absoluteFill}
        pointerEvents="none"
        colors={['#2E2C8F', '#1B1A52', '#0E0D16', '#08080C']}
        locations={[0, 0.38, 0.78, 1]}
      />
    );
  // 다크(4a-dk 등)는 그라데이션 없이 깊은 바탕 한 색이다.
  if (isDark) return <View style={{ ...absoluteFill, backgroundColor: '#121118' }} pointerEvents="none" />;
  return (
    <View style={absoluteFill} pointerEvents="none">
      <LinearGradient
        style={absoluteFill}
        colors={['#EDD3F4', '#EFE6F7', '#F1EFF8', '#E4E5F8', '#D9DFFA']}
        locations={[0, 260 / 932, 520 / 932, 760 / 932, 1]}
      />
      <Glow layers={[{ w: 120, h: 45, x: 85, y: 0, rgb: '233,195,242', stops: [[0, 1], [0.7, 0]] }]} />
    </View>
  );
}

const GLASS_SHADOW = { boxShadow: '0 0 0 1px rgba(255,255,255,0.7), 0 4px 14px rgba(99,103,255,0.1)' } as const;
const GLASS_SHADOW_DARK = { boxShadow: '0 0 0 1px rgba(28,27,36,0.7), 0 4px 14px rgba(99,103,255,0.1)' } as const;

/** 반투명 흰 원 버튼 (뒤로가기 · 직접 쓰기 등). 디자인 시스템 v2 원형 아이콘 버튼 44. */
export function GlassCircle({ onPress, label, children }: { onPress: () => void; label: string; children: ReactNode }) {
  const { isDark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-11 h-11 shrink-0 rounded-full bg-page/60 dark:bg-surface items-center justify-center"
      style={isDark ? GLASS_SHADOW_DARK : GLASS_SHADOW}
    >
      {children}
    </Pressable>
  );
}

export const GlassBack = ({ onPress }: { onPress: () => void }) => (
  <GlassCircle onPress={onPress} label="뒤로가기">
    <BackChevronIcon />
  </GlassCircle>
);

/** 메타미 아바타: 보라 그라데이션 원 + 반짝임 */
export function MetameAvatar() {
  return (
    <LinearGradient
      colors={['#8A8DFF', '#6367FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,103,255,0.3)' }}
    >
      <SparkleAvatarIcon />
    </LinearGradient>
  );
}

const CARD_SHADOW = { boxShadow: '0 4px 14px rgba(99,103,255,0.06)' } as const;
const AI_RADIUS = { borderTopLeftRadius: 6, borderTopRightRadius: 22, borderBottomRightRadius: 22, borderBottomLeftRadius: 22 } as const;

/** 메타미 말풍선: 이름 + 흰 카드. badge는 카드 안 노란 꼬리표(시간 맥락 등). */
export function AiMessage({
  children,
  badge,
  footer,
  showName = true,
}: {
  children?: ReactNode;
  badge?: ReactNode;
  footer?: ReactNode;
  /** 이름 없이 말풍선만 보여줄 때 false */
  showName?: boolean;
}) {
  return (
    <View className="flex-row gap-2.5 pr-2.5">
      <MetameAvatar />
      <View className="flex-1 min-w-0">
        {showName && <Text className="text-[12px] font-semibold text-primary">메타미</Text>}
        <View className={`${showName ? 'mt-1.5' : ''} bg-page dark:bg-surface px-[18px] py-4`} style={{ ...AI_RADIUS, ...CARD_SHADOW }}>
          {badge ? (
            <View className="self-start mb-3 rounded-md bg-[#FFF4C2] dark:bg-surface px-2 py-[3px]">
              <Text className="text-[12px] font-bold text-[#7A6B1F] dark:text-gold">{badge}</Text>
            </View>
          ) : null}
          {children ? (
            typeof children === 'string' ? <Text className="text-[16px] leading-[26px] text-ink">{children}</Text> : children
          ) : null}
          {footer}
        </View>
      </View>
    </View>
  );
}

/** 내 말풍선: 보라 그라데이션, 오른쪽 아래 모서리만 작게 */
export function UserMessage({ children }: { children: string }) {
  return (
    <View className="flex-row justify-end pl-16">
      <LinearGradient
        colors={['#8A6BFF', '#6367FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: '14px 18px',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderBottomRightRadius: 6,
          borderBottomLeftRadius: 22,
          boxShadow: '0 6px 16px rgba(99,103,255,0.22)',
        }}
      >
        <Text className="text-[16px] leading-[26px] text-white">{children}</Text>
      </LinearGradient>
    </View>
  );
}

/** animate-bounce처럼 위아래로 튀는 점. i번째는 140ms씩 늦게 시작한다. */
function BounceDot({ i }: { i: number }) {
  return (
    <View
      className="w-1.5 h-1.5 rounded-full bg-primary"
      style={{ opacity: 0.35 + i * 0.3, animation: `typing-bounce 1000ms ${i * 140}ms infinite both` }}
    />
  );
}

/** 메타미가 쓰는 중 (점 세 개) */
export function TypingMessage() {
  return (
    <View className="flex-row gap-2.5" accessibilityLabel="메타미가 쓰는 중">
      <MetameAvatar />
      <View className="mt-[22px] bg-page dark:bg-surface px-[18px] py-4 flex-row gap-1.5" style={{ ...AI_RADIUS, ...CARD_SHADOW }}>
        {[0, 1, 2].map((i) => (
          <BounceDot key={i} i={i} />
        ))}
      </View>
    </View>
  );
}

const CHIP_SHADOW = { boxShadow: '0 6px 18px rgba(99,103,255,0.1)' } as const;

/** 입력칸 위 흰 알약 버튼 (태그로 답하기 · 건너뛰기 …) */
export function QuickChip({ children, onPress }: { children: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="h-[46px] shrink-0 rounded-full bg-page/90 dark:bg-surface px-[18px] flex-row items-center gap-1.5"
      style={CHIP_SHADOW}
    >
      <SparkleIcon size={14} />
      <Text className="text-[14px] font-semibold text-primary">{children}</Text>
    </Pressable>
  );
}

/** 알약 모양 입력칸 + 보라 그라데이션 보내기 버튼 */
export function PillComposer({
  value,
  onChange,
  onSend,
  placeholder,
  sendEnabled,
  disabled = false,
  maxLength,
  readOnly = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  sendEnabled?: boolean;
  disabled?: boolean;
  maxLength?: number;
  /** 감정 태그처럼 칸에 직접 쓰지 않고 위에서 고르는 차례 */
  readOnly?: boolean;
}) {
  // 알아볼 수 없는 글(ㅋㅋㅋㅋ · ㅍ튵 · 1234 등)은 보내지 못하게 하고 입력칸 위에 이유를 띄운다.
  // 대화에서는 '응'·'네' 같은 한 글자 대답도 자연스러우니 길이는 따지지 않는다.
  const check = useTextCheck(value, !readOnly && !disabled, { minLetters: 1 });
  const canSend = !disabled && !check.invalid && (sendEnabled ?? value.trim().length > 0);
  const { fg } = useTheme();
  return (
    <View>
      {check.hint && (
        <View className="mb-2 ml-4 self-start rounded-full bg-page/90 dark:bg-surface px-3 py-1" style={{ boxShadow: '0 2px 8px rgba(30,30,60,0.08)' }}>
          <Text accessibilityRole="alert" className="text-[12px] font-medium text-danger">
            {check.hint}
          </Text>
        </View>
      )}
      <View
        className={`h-[60px] rounded-full bg-page/90 dark:bg-surface pl-6 pr-1.5 flex-row items-center gap-2 ${disabled ? 'opacity-70' : ''}`}
        style={{ boxShadow: '0 8px 24px rgba(99,103,255,0.14)' }}
      >
        {/* 답을 기다리는 동안에도 입력칸을 그대로 두어 포커스·키보드를 유지한다. 그동안은 글자를 받지 않고 보내기만 막는다. */}
        <TextInput
          value={value}
          onChangeText={(v) => !disabled && onChange(v)}
          onSubmitEditing={() => canSend && onSend()}
          submitBehavior="submit"
          returnKeyType="send"
          placeholder={placeholder}
          placeholderTextColor={fg('#8A8A96')}
          selectionColor="#6367FF"
          cursorColor="#6367FF"
          // 따로 정한 제한이 없으면 공통 상한(1만 자)까지만 받는다.
          maxLength={maxLength ?? MAX_TEXT_LENGTH}
          editable={!readOnly}
          accessibilityLabel={placeholder}
          accessibilityState={{ disabled }}
          className="flex-1 min-w-0 p-0 text-[16px] text-ink"
        />
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="보내기"
          accessibilityState={{ disabled: !canSend }}
          style={{ opacity: canSend ? 1 : 0.4 }}
        >
          <LinearGradient
            colors={['#8A8DFF', '#6367FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(99,103,255,0.35)' }}
          >
            <SendArrowIcon />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}
