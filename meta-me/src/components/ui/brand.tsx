'use client';

import { Img, View, asset } from './rn';
import { Text } from './Text';
import { useIconColor } from './icons';

/** 예전 경로 호환: GoogleIcon은 ./icons에 있다. */
export { GoogleIcon } from './icons';

/** "m" brand mark. 원본 logo.png는 검은색이라 tintColor로 색을 입힌다. */
export function LogoMark({ size = 24, color: colorProp }: { size?: number; color?: string }) {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <Img src={asset('logo.png')} width={size} height={(size * 93) / 131} tintColor={color} />
  );
}

export function Wordmark({ size = 18 }: { size?: number }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <LogoMark size={size * 1.35} />
      <Text className="font-bold text-ink tracking-tight" style={{ fontSize: size }}>
        metame
      </Text>
    </View>
  );
}
