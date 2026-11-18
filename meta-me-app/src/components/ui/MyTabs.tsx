import { Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { Text } from './Text';

const TABS = [
  { key: 'month', label: '이번 달', href: '/mypage' },
  { key: 'dogam', label: '도감', href: '/dogam' },
  { key: 'report', label: '리포트', href: '/mypage/report' },
] as const;

/** 마이페이지 상단 탭 (이번 달 · 도감 · 리포트). */
export function MyTabs({ active }: { active: (typeof TABS)[number]['key'] }) {
  return (
    <View className="flex-row gap-6 px-5 border-b border-line">
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Link key={t.key} href={t.href} asChild>
            <Pressable accessibilityRole="tab" accessibilityState={{ selected: on }} className="py-3">
              <Text className={`text-[16px] ${on ? 'font-bold text-ink' : 'text-sub'}`}>{t.label}</Text>
              {on && <View className="absolute left-0 right-0 -bottom-px h-[3px] rounded-full bg-primary" />}
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
