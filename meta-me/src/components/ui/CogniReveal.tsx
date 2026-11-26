'use client';

import type { ReactNode } from 'react';
import { View } from './rn';
import { Screen } from './Screen';
import { BackButton, CogniImg } from './primitives';
import { GradientBg } from './flows';
import { Text } from './Text';

/** 코그니 발견 (5b2) · 코그니 상세 (5b3) 공통 화면: 번호 배지 · 그림 · 분류 · 이름 · 설명 · 특징 */
export function CogniReveal({
  title,
  no,
  eyebrow,
  image,
  category,
  name,
  desc,
  features,
  footer,
  onBack,
}: {
  title: string;
  no: number;
  eyebrow: string;
  image: string;
  category: string;
  name: string;
  desc?: string;
  features?: { icon: ReactNode; text: string }[];
  footer: ReactNode;
  onBack: () => void;
}) {
  return (
    <Screen bg="#FBFBFF" background={<GradientBg variant="a" />} footer={footer}>
      <View className="h-14 flex-row items-center justify-center px-5">
        <View className="absolute left-5">
          <BackButton onPress={onBack} />
        </View>
        <Text accessibilityRole="header" className="text-[16px] font-semibold text-ink">
          {title}
        </Text>
      </View>
      <View className="items-center px-6 pt-8 pb-4">
        <View className="h-8 px-4 rounded-full bg-page flex-row items-center gap-1.5">
          <Text className="tabular-nums text-[12px] font-bold text-primary">No.{String(no).padStart(2, '0')}</Text>
          <Text className="text-[12px] font-bold text-primary">새 코그니</Text>
        </View>
        <Text className="text-[20px] text-ink mt-6 text-center">{eyebrow}</Text>
        <View className="mt-8 h-[200px] items-center justify-center" style={{ animation: 'zoom-in 320ms ease-out both' }}>
          <CogniImg src={image} size={190} />
        </View>
        <View className="mt-8 h-9 px-4 rounded-full bg-page/80 flex-row items-center gap-2">
          <Text className="text-[10px] text-body">▶</Text>
          <Text className="text-[12px] text-body">{category}</Text>
        </View>
        <Text accessibilityRole="header" className="text-[24px] font-bold text-ink mt-4 text-center">
          {name}
        </Text>
        {desc ? <Text className="text-[16px] text-text-3 leading-[26px] mt-2 text-center">{desc}</Text> : null}
      </View>
      {features && features.length > 0 && (
        <View className="mx-5 mb-4 rounded-[24px] bg-page/85 px-5 py-5 gap-4">
          {features.map((f) => (
            <View key={f.text} className="flex-row items-center gap-3">
              <View className="w-7 h-7 rounded-lg bg-primary-soft items-center justify-center shrink-0">{f.icon}</View>
              <Text className="flex-1 text-[16px] text-ink">{f.text}</Text>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
