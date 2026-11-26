'use client';

import { usePathname } from 'next/navigation';
import { Pressable, View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';
import { router } from '@/lib/router';
import { useAuthStore } from '@/store';

type TabKey = 'main' | 'diary' | 'chat' | 'report' | 'mypage';

/**
 * 탭 아이콘. 같은 모양을 선택하면 프라이머리로 안까지 채우고, 선택하지 않으면 선(스트로크)만 그린다.
 * shape는 바깥 모양(채움 대상), detail은 채운 모양 위에 바탕색으로 다시 긋는 안쪽 선이다.
 */
const TAB_SHAPE: Record<TabKey, { shape: string; detail?: string; dots?: [number, number][] }> = {
  main: { shape: 'M4 10.2 12 4l8 6.2V19a1.5 1.5 0 0 1-1.5 1.5H15V16a3 3 0 0 0-6 0v4.5H5.5A1.5 1.5 0 0 1 4 19Z' },
  diary: {
    shape: 'M6.5 3.5h10.5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6.5A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5Z',
    detail: 'M10 3.5V11l2-1.5 2 1.5V3.5',
  },
  chat: {
    shape: 'M4 8.5a4.5 4.5 0 0 1 4.5-4.5h7A4.5 4.5 0 0 1 20 8.5v5a4.5 4.5 0 0 1-4.5 4.5H9.5L4 21Z',
    dots: [
      [9, 11],
      [15, 11],
    ],
  },
  report: { shape: 'M4.5 13h3.5v7H4.5ZM10.25 4h3.5v16h-3.5ZM16 9h3.5v11H16Z' },
  mypage: { shape: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6Z' },
};

function TabIcon({ tab, on, size = 22 }: { tab: TabKey; on: boolean; size?: number }) {
  const { fg, bg } = useTheme();
  const { shape, detail, dots } = TAB_SHAPE[tab];
  const line = on ? '#6367FF' : fg('#1A1A1E');
  // 채운 아이콘 안쪽 선은 탭바 바탕색으로 그어 모양이 보이게 한다.
  const inner = on ? bg('#FFFFFF') : line;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d={shape} fill={on ? '#6367FF' : 'none'} stroke={line} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      {detail && <path d={detail} stroke={inner} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />}
      {dots?.map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r={1.2} fill={inner} />)}
    </svg>
  );
}

const TABS: Record<TabKey, { label: string }> = {
  main: { label: '메인' },
  diary: { label: '다이어리' },
  chat: { label: '대화' },
  report: { label: '리포트' },
  mypage: { label: '마이페이지' },
};

/** 탭바 높이(64) + 화면 아래에서 띄운 간격. 탭 화면 본문은 이만큼 아래를 비워 둔다. (웹은 bottomInset이 늘 0) */
export const NAV_HEIGHT = 64;
export const navOffset = (bottomInset = 0) => Math.max(bottomInset, 8);

const HREF: Record<TabKey, string> = { main: '/main', diary: '/diary', chat: '/chat', report: '/report', mypage: '/mypage' };
const ORDER: TabKey[] = ['main', 'diary', 'chat', 'report', 'mypage'];

/** 화면 아래에 떠 있는 흰 알약 모양 탭바 (v3). 지금 탭은 연보라 알약으로 감싸고 아이콘을 프라이머리로 채운다. */
function NavBar({ active, onSelect }: { active?: TabKey; onSelect: (tab: TabKey) => void }) {
  const { fg } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      className="absolute left-5 right-5 z-30 h-16 rounded-full bg-page px-1 flex-row items-center"
      style={{ bottom: navOffset(), boxShadow: '0 8px 30px rgba(30,30,60,0.12)' }}
    >
      {ORDER.map((key) => {
        const tab = TABS[key];
        const on = active === key;
        const color = on ? '#6367FF' : fg('#1A1A1E');
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={tab.label}
            onPress={() => onSelect(key)}
            className={`flex-1 h-14 rounded-full items-center justify-center gap-0.5 ${on ? 'bg-primary/12' : ''}`}
          >
            <TabIcon tab={key} on={on} />
            <Text className={`text-[12px] ${on ? 'font-bold' : 'font-medium'}`} style={{ color }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const tabOf = (pathname: string): TabKey | undefined => ORDER.find((k) => HREF[k] === pathname);

/**
 * 탭 레이아웃의 탭바 (앱 (tabs)/_layout의 tabBar). 웹은 PhoneFrame이 늘 그리고,
 * 지금 경로가 탭 화면(/main · /diary · /chat · /report · /mypage)이고 로그인돼 있을 때만 보인다.
 */
export function BottomNav() {
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const current = tabOf(pathname);
  if (!current || !token) return null;
  return <NavBar active={current} onSelect={(key) => key !== current && router.replace(HREF[key])} />;
}

/**
 * 탭 밖 화면(지난 대화 · 도감 · 챌린지)에도 같은 탭바를 띄운다. active는 이 화면이 속한 탭.
 * 누르면 그 탭으로 돌아간다. Screen의 overlay에 넣고, Screen에는 inTabs를 줘 아래를 비운다.
 */
export function StandaloneNav({ active }: { active: TabKey }) {
  return <NavBar active={active} onSelect={(key) => router.dismissTo(HREF[key])} />;
}
