'use client';

import { SettingsShell } from '@/components/ui/settings';
import { Img, View, asset } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { APP_VERSION } from '@/lib/appInfo';

const LOGO = asset('logo.png');

/** 앱 정보 (13j5) */
export default function AboutScreen() {
  return (
    <SettingsShell title="앱 정보" backHref="/settings">
      <View className="mt-6 rounded-[20px] bg-page py-7 items-center" style={{ boxShadow: '0 2px 12px rgba(30,30,60,0.04)' }}>
        <Img src={LOGO} width={64} height={64} contentFit="cover" style={{ borderRadius: 18 }} />
        <Text className="text-[16px] font-bold text-ink mt-4">메타미</Text>
        <Text className="text-[12px] text-sub mt-1 tabular-nums">버전 {APP_VERSION}</Text>
      </View>
    </SettingsShell>
  );
}
