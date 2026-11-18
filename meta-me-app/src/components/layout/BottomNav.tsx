import { Pressable, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { ChatIcon, DiaryIcon, HomeIcon, MyIcon, ReportIcon } from '@/components/ui/icons';

const TABS: Record<string, { label: string; Icon: (p: { color: string }) => React.ReactElement }> = {
  main: { label: '메인', Icon: HomeIcon },
  diary: { label: '다이어리', Icon: DiaryIcon },
  chat: { label: '대화', Icon: ChatIcon },
  report: { label: '리포트', Icon: ReportIcon },
  mypage: { label: '마이페이지', Icon: MyIcon },
};

const ACTIVE = '#6367FF';
const INACTIVE = '#9A9AA3';

/** 웹 BottomNav와 같은 모양의 하단 탭 바. (tabs) 레이아웃의 tabBar로 쓴다. */
export function BottomNav({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="border-t border-line bg-white px-2" style={{ paddingBottom: insets.bottom }}>
      <View className="flex-row h-[68px]">
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const active = state.index === index;
          const color = active ? ACTIVE : INACTIVE;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (!active) navigateToTab(route.key);
              }}
              className="flex-1 items-center justify-center gap-1"
            >
              <tab.Icon color={color} />
              <Text className={`text-[11px] ${active ? 'font-semibold' : 'font-medium'}`} style={{ color }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
