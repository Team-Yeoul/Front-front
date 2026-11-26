'use client';

import { useParams } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/primitives';
import { TermsBody } from '@/components/ui/TermsBody';
import { View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { isTermsKey } from '@/lib/terms/content';

// 설정 > 이용약관 / 개인정보 처리방침: 동의 체크 없이 본문만 보여 준다.
export default function SettingsTermsScreen() {
  const { key } = useParams<{ key: string }>();

  return (
    <Screen>
      {/* 뒤로 갈 곳이 없으면 설정으로 간다. */}
      <TopBar backHref="/settings" />
      <View className="px-6 pt-2 pb-10">
        {isTermsKey(key) ? <TermsBody termsKey={key} /> : <Text className="text-[16px] text-sub">약관을 찾을 수 없어요.</Text>}
      </View>
    </Screen>
  );
}
