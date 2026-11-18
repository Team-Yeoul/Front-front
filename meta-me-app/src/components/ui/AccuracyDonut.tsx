import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from './Text';

/**
 * 완료 화면의 "나의 문장 정확도" 게이지: 두꺼운 도넛에서 진한 호는 현재 정확도,
 * 그 바로 앞의 연한 호는 오늘 오른 만큼이다.
 */
export function AccuracyDonut({ percent, delta, size = 220 }: { percent: number; delta: number; size?: number }) {
  const stroke = size * 0.2;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const mid = size / 2;
  const base = Math.max(0, percent - delta);
  const seg = (from: number, to: number) => ({
    strokeDasharray: [(Math.max(0, to - from) / 100) * c, c],
    strokeDashoffset: -(from / 100) * c,
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={mid} cy={mid} r={r} fill="none" stroke="#E6E6F0" strokeWidth={stroke} />
        <Circle cx={mid} cy={mid} r={r} fill="none" stroke="#6367FF" strokeWidth={stroke} {...seg(0, base)} />
        <Circle cx={mid} cy={mid} r={r} fill="none" stroke="#A9ABFF" strokeWidth={stroke} {...seg(base, percent)} />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-[12px] text-sub">나의 문장 정확도</Text>
        {/* 웹은 %를 위쪽(align-top)에 붙였다. RN 글자 안에서는 세로 정렬이 안 돼 따로 놓는다. */}
        <View className="flex-row items-start mt-1.5">
          <Text className="text-[40px] font-bold text-ink leading-[44px]">{percent}</Text>
          <Text className="text-[18px] font-medium text-sub leading-[24px] mt-1">%</Text>
        </View>
        {delta > 0 && (
          <Text className="text-[13px] font-semibold text-primary mt-1.5">▲ {delta}%</Text>
        )}
      </View>
    </View>
  );
}
