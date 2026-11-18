import { View } from 'react-native';
import type { Href } from 'expo-router';
import { BackButton } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';

/**
 * 웹 TopBar의 title(굵은 17px) + sub(작은 모노 글자) 조합.
 * 앱의 공용 TopBar는 글자 제목만 받아서 대화 화면용으로 따로 둔다.
 */
export function TitleBar({ title, sub, onBack, backHref }: { title: string; sub?: string; onBack?: () => void; backHref?: Href }) {
  return (
    <View className="flex-row items-center justify-between h-14 px-5">
      <BackButton onPress={onBack} href={backHref} />
      <View pointerEvents="none" className="absolute left-0 right-0 items-center">
        <Text className="text-[17px] font-bold text-ink" numberOfLines={1}>
          {title}
        </Text>
        {!!sub && <Text className="text-[11px] font-mono text-mute mt-0.5">{sub}</Text>}
      </View>
      <View className="w-10" />
    </View>
  );
}
