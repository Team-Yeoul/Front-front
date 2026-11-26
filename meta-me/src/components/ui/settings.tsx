'use client';

import { Children, type ReactNode } from 'react';
import { Pressable, View } from './rn';
import { useTheme, useThemeStore } from '@/lib/theme';
import type { Href } from '@/lib/router';
import { Screen } from './Screen';
import { BackButton } from './primitives';
import { Text } from './Text';
import { StaggerText } from './states';
import { ChevronRight } from './icons';

export const SETTINGS_BG = '#F6F6F9';

/** 설정 하위 화면 공통 틀 (13j·13j1·13j5): 회색 바탕 · 뒤로가기 · 큰 제목 */
export function SettingsShell({
  title,
  sub,
  backHref,
  footer,
  overlay,
  children,
}: {
  title: string;
  sub?: string;
  backHref?: Href;
  footer?: ReactNode;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Screen bg={SETTINGS_BG} footer={footer} overlay={overlay}>
      <View className="px-5 pt-2 pb-8">
        <View className="flex-row">
          <BackButton href={backHref} />
        </View>
        <View className="mt-6">
          <StaggerText header text={title} className="text-[24px] font-bold text-ink" />
        </View>
        {sub ? (
          <View className="mt-1.5">
            <StaggerText delay={70} text={sub} className="text-[14px] text-sub" />
          </View>
        ) : null}
        {children}
      </View>
    </Screen>
  );
}

/** 흰 카드로 묶은 설정 행들. 두 번째 행부터 위에 옅은 구분선을 긋는다(웹 divide-y). */
export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View className="mt-6">
      {title ? <Text className="text-[12px] text-sub px-1 mb-2.5">{title}</Text> : null}
      <View className="rounded-[20px] bg-page dark:border dark:border-line-soft overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(30,30,60,0.04)' }}>
        {rows.map((row, i) => (
          <View key={i} className={i > 0 ? 'border-t border-line-soft' : ''}>
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}

export const SETTINGS_ICON = {
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0H5Z',
  mail: 'M3 6h18v12H3V6Zm0 1 9 6 9-6',
  link: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4h4',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2',
  shield: 'M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6l-7-3Z',
  box: 'M4 7h16v3H4V7Zm1 3h14v10H5V10Zm5 3h4',
  doc: 'M7 3h7l4 4v14H7V3Zm7 0v4h4M9.5 12h6M9.5 16h6',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 8v5m0-8.5v.5',
  megaphone: 'M4 10v4h3l7 4V6l-7 4H4Zm13-1a4 4 0 0 1 0 6',
};

/** 아이콘 타일 + 제목/부제 + 오른쪽(화살표·토글·값) */
export function SettingsRow({
  icon,
  label,
  sub,
  right,
  onPress,
  danger,
}: {
  icon?: keyof typeof SETTINGS_ICON;
  label: string;
  sub?: string;
  right?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const { isDark, fg } = useTheme();
  // 다크에서는 아이콘 타일(#2A2850) 위라 한 톤 밝은 보라로 그린다(13j-dk).
  const iconColor = isDark ? '#9EA1FF' : '#6367FF';
  const body = (
    <>
      {icon && (
        <View className="w-11 h-11 rounded-[14px] bg-primary-soft items-center justify-center shrink-0">
          <svg className="shrink-0" width={20} height={20} viewBox="0 0 24 24" fill="none">
            <path d={SETTINGS_ICON[icon]} stroke={iconColor} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </View>
      )}
      <View className="flex-1 min-w-0">
        <Text className={`text-[16px] font-semibold ${danger ? 'text-danger' : 'text-ink'}`}>{label}</Text>
        {sub ? (
          <Text numberOfLines={1} className="text-[12px] text-sub mt-0.5">
            {sub}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress && <ChevronRight size={16} color={fg('#C4C4CC')} />)}
    </>
  );
  const cls = 'flex-row items-center gap-3.5 px-4 min-h-[68px] py-3';
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" className={`${cls} active:bg-surface`}>
      {body}
    </Pressable>
  ) : (
    <View className={cls}>{body}</View>
  );
}

/**
 * 화면 모드 카드 (13j · 13j-dk): 누르면 라이트 ↔ 다크로 바꾼다.
 * 처음에는 휴대폰 설정을 따르고, 한 번 바꾸면 이 기기에 그 선택을 저장한다.
 */
export function ThemeCard() {
  const { isDark } = useTheme();
  const setPreference = useThemeStore((s) => s.setPreference);
  const toggle = () => setPreference(isDark ? 'light' : 'dark');
  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityLabel="다크 모드"
      accessibilityState={{ checked: isDark }}
      className="mt-6 flex-row items-center gap-3.5 p-4 rounded-[20px] bg-page border border-line-soft active:opacity-80"
    >
      <View className="w-12 h-12 rounded-[14px] bg-primary-soft items-center justify-center shrink-0">
        <svg className="shrink-0" width={24} height={24} viewBox="0 0 24 24">
          {isDark ? (
            <path fill="#9EA1FF" d="M14.5 3.2a8.8 8.8 0 1 0 6.3 12.6A7.2 7.2 0 0 1 14.5 3.2" />
          ) : (
            <>
              <circle cx={12} cy={12} r={4.5} fill="#6367FF" />
              <g stroke="#6367FF" strokeWidth={2} strokeLinecap="round">
                <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
              </g>
            </>
          )}
        </svg>
      </View>
      <View className="flex-1">
        <Text className="text-[16px] font-bold text-ink">{isDark ? '다크 모드' : '라이트 모드'}</Text>
        <Text className="text-[12px] text-sub mt-0.5">{isDark ? '눌러서 밝게' : '눌러서 어둡게'}</Text>
      </View>
      {/* 해·달 스위치 */}
      <View className={`w-16 h-[34px] rounded-full p-[3px] flex-row items-center ${isDark ? 'justify-end bg-primary-soft' : 'bg-[#DCE8FF]'}`}>
        {isDark ? (
          <>
            <View className="absolute left-3 top-2.5 w-[3px] h-[3px] rounded-full bg-white" />
            <View className="absolute left-5 top-[19px] w-0.5 h-0.5 rounded-full bg-white" />
            <View className="w-7 h-7 rounded-full bg-[#F4F4F7]" style={{ boxShadow: 'inset -7px -2px 0 0 #C9C6FF' }} />
          </>
        ) : (
          <>
            <View className="w-7 h-7 rounded-full bg-[#FFC83D]" style={{ boxShadow: '0 2px 6px rgba(200,140,0,0.35)' }} />
            <View className="absolute right-[9px] top-3 w-4 h-[9px] rounded-full bg-white" />
          </>
        )}
      </View>
    </Pressable>
  );
}
