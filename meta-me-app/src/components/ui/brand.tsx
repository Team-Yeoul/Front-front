import { Image } from 'expo-image';
import { View } from 'react-native';
import { Text } from './Text';

/** "m" brand mark. 원본 logo.png는 검은색이라 tintColor로 색을 입힌다. */
export function LogoMark({ size = 24, color = '#1A1A1E' }: { size?: number; color?: string }) {
  return (
    <Image
      source={require('@/assets/images/logo.png')}
      style={{ width: size, height: (size * 93) / 131 }}
      tintColor={color}
      contentFit="contain"
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
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
