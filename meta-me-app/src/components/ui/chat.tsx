import { useEffect, useId, type ReactNode } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Text } from './Text';
import { ArrowUpIcon } from './icons';

const BUBBLE_SHADOW = { boxShadow: '0 4px 14px rgba(26,26,30,0.05)' } as const;

/** 글자만 넘기면 말풍선 글자로 감싼다. 다른 요소를 넣을 때는 그대로 둔다. */
const asText = (children: ReactNode, cls: string) =>
  typeof children === 'string' || typeof children === 'number' ? <Text className={cls}>{children}</Text> : children;

/** AI 동그라미 아바타. 웹의 radial-gradient(circle at 35% 30%, …)를 SVG 그라데이션으로 그린다. */
export function AiAvatar({ size = 28 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  const r = size / 2;
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id={id} cx="35%" cy="30%" fx="35%" fy="30%" r="80%">
          <Stop offset="0" stopColor="#B7B9FF" />
          <Stop offset="0.45" stopColor="#7B7FFF" />
          <Stop offset="1" stopColor="#4F52E5" />
        </RadialGradient>
      </Defs>
      <Circle cx={r} cy={r} r={r} fill={`url(#${id})`} />
    </Svg>
  );
}

export function AiBubble({ children, badge, footer }: { children: ReactNode; badge?: ReactNode; footer?: ReactNode }) {
  return (
    <View className="flex-row items-end gap-2 pr-6">
      <AiAvatar />
      <View className="min-w-0 max-w-[88%]">
        <View className="bg-[#F7F7FA] rounded-[20px] rounded-bl-md px-4 py-3.5" style={BUBBLE_SHADOW}>
          {!!badge && (
            <View className="self-start h-6 px-2.5 mb-2 rounded-full bg-[#FDEFB2] justify-center">
              {asText(badge, 'text-[11px] font-semibold text-gold')}
            </View>
          )}
          {asText(children, 'text-[15px] text-ink leading-[24px]')}
          {footer}
        </View>
      </View>
    </View>
  );
}

export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row justify-end pl-12">
      <View className="bg-primary rounded-[20px] rounded-br-md px-4 py-3">{asText(children, 'text-[15px] text-white leading-[24px]')}</View>
    </View>
  );
}

/** 웹 animate-bounce처럼 위아래로 튀는 점. i번째는 140ms씩 늦게 시작한다. */
function BounceDot({ i }: { i: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    const ease = Easing.bezier(0.8, 0, 1, 1);
    y.value = withDelay(
      i * 140,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 500, easing: Easing.bezier(0, 0, 0.2, 1), reduceMotion: ReduceMotion.System }),
          withTiming(0, { duration: 500, easing: ease, reduceMotion: ReduceMotion.System }),
        ),
        -1,
      ),
      ReduceMotion.System,
    );
  }, [i, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[style, { opacity: 0.35 + i * 0.3 }]} className="w-1.5 h-1.5 rounded-full bg-primary" />;
}

export function TypingBubble() {
  return (
    <View className="flex-row items-end gap-2">
      <AiAvatar />
      <View className="bg-[#F7F7FA] rounded-[18px] px-4 py-3.5 flex-row gap-1.5" style={BUBBLE_SHADOW}>
        {[0, 1, 2].map((i) => (
          <BounceDot key={i} i={i} />
        ))}
      </View>
    </View>
  );
}

export function OutlineChip({ children, onPress, active = false }: { children: ReactNode; onPress?: () => void; active?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`h-9 px-3.5 rounded-full border items-center justify-center ${
        active ? 'border-primary bg-primary-soft' : 'border-[#DEDEE4] bg-white'
      }`}
    >
      {asText(children, `text-[13px] font-medium ${active ? 'text-primary' : 'text-[#48484F]'}`)}
    </Pressable>
  );
}

/** 보내기 버튼과 (선택) 빠른 칩이 달린 둥근 입력 패널. */
export function Composer({
  value,
  onChange,
  onSend,
  placeholder,
  chips,
  disabled = false,
  disabledLabel,
  disabledHint,
  sendEnabled,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  chips?: ReactNode;
  disabled?: boolean;
  disabledLabel?: string;
  disabledHint?: string;
  /** 글자와 상관없이 보낼 수 있는 차례(예: 칩을 고른 경우)에 쓴다. */
  sendEnabled?: boolean;
  maxLength?: number;
}) {
  const canSend = !disabled && (sendEnabled ?? value.trim().length > 0);
  return (
    <View
      className="rounded-3xl bg-[#F4F4F8] border border-[#EDEDF2] px-4 pt-3.5 pb-3"
      style={{ boxShadow: '0 -4px 20px rgba(26,26,30,0.04)' }}
    >
      {disabled ? (
        <View className="flex-row items-center gap-2 h-7">
          <View className="w-5 h-5 rounded-full border-2 border-[#CFCFD6]" />
          <Text className="text-[15px] text-mute">{disabledLabel}</Text>
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChange}
          onSubmitEditing={() => canSend && onSend()}
          // 보내고 나서도 키보드를 내리지 않고 이어서 쓰게 한다.
          submitBehavior="submit"
          returnKeyType="send"
          placeholder={placeholder}
          placeholderTextColor="#B4B4BB"
          selectionColor="#6367FF"
          maxLength={maxLength}
          className="h-7 p-0 text-[15px] text-ink"
          style={{ fontFamily: 'Pretendard-Regular' }}
        />
      )}
      <View className="flex-row items-center justify-between mt-3 gap-2">
        <View className="flex-1 min-w-0">
          {disabled ? (
            <Text className="text-[12px] text-mute">{disabledHint}</Text>
          ) : (
            chips && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerClassName="items-center gap-2">
                {chips}
              </ScrollView>
            )
          )}
        </View>
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="보내기"
          accessibilityState={{ disabled: !canSend }}
          className={`w-10 h-10 rounded-full items-center justify-center ${disabled ? 'bg-[#DEDEE4]' : 'bg-primary'}`}
        >
          <ArrowUpIcon />
        </Pressable>
      </View>
    </View>
  );
}
