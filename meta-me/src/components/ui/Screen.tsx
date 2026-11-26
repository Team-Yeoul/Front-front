'use client';

import type { ReactNode, Ref } from 'react';
import { NAV_HEIGHT, navOffset } from '@/components/layout/BottomNav';
import { useStatusBarTheme } from '@/hooks/useStatusBarTheme';
import { useTheme } from '@/lib/theme';
import { PhoneBackdrop } from './PhoneBackdrop';
import { ScrollView, View } from './rn';

/**
 * 화면 틀: 스크롤되는 본문 + 하단 고정 버튼(footer). 앱 Screen과 같은 props.
 * bg는 라이트 색으로 넘기면 다크 모드에서 짝이 되는 어두운 색으로 바뀐다(lib/theme).
 * 데스크톱 폰 프레임의 상태바·홈 인디케이터는 이 화면 색(또는 background)에 맞춘다. 다크에서는 상태바 글자를 늘 밝게 한다.
 * 하단 탭이 있는 화면(inTabs)은 떠 있는 탭바만큼 아래를 비운다. 탭바 자체는 PhoneFrame이 탭 경로에서 그린다
 * (탭 밖 화면은 overlay에 <StandaloneNav active="…" />).
 */
export function Screen({
  children,
  footer,
  bg = '#FFFFFF',
  statusFg = 'dark',
  background,
  inTabs = false,
  scroll = true,
  contentClassName = '',
  footerClassName = 'px-6 pt-2',
  overlay,
  bodyRef,
  statusBg,
}: {
  children: ReactNode;
  footer?: ReactNode;
  bg?: string;
  /** 상태바 글자색 — 'light' = 진한 배경 위 흰 글자 */
  statusFg?: 'light' | 'dark';
  /** 본문 뒤에 까는 장식 레이어(그라데이션 등). 상태바·홈 인디케이터 뒤까지 폰 화면 전체를 채운다. */
  background?: ReactNode;
  inTabs?: boolean;
  scroll?: boolean;
  contentClassName?: string;
  /** 하단 영역 여백. 기본은 좌우 24px(디자인 시스템 v2) */
  footerClassName?: string;
  /** 토스트·떠 있는 버튼처럼 스크롤 본문 밖에서 화면 전체를 덮는 것. (Sheet/Modal은 폰 화면에 포털로 뜨므로 어디 둬도 된다) */
  overlay?: ReactNode;
  /** (웹 전용) 스크롤 본문 요소. 끝까지 내리기 등에 쓴다(앱 ScrollView ref 자리). */
  bodyRef?: Ref<HTMLDivElement>;
  /** (웹 전용) 상태바 색을 화면 색과 다르게 할 때 */
  statusBg?: string;
}) {
  const theme = useTheme();
  const pageBg = theme.bg(bg);
  const fg = statusFg === 'light' || theme.isDark ? 'light' : 'dark';
  useStatusBarTheme(background ? 'transparent' : (statusBg ?? pageBg), fg, theme.isDark ? 'light' : 'dark');
  // 탭 화면은 떠 있는 탭바(64px)가 본문 위를 덮으므로, 그 높이 + 여유(16px)만큼 아래를 비운다.
  const navSpace = NAV_HEIGHT + navOffset(0) + 16;
  const bottomPad = inTabs ? navSpace : 0;

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ backgroundColor: background ? 'transparent' : pageBg }}>
      {background && (
        <PhoneBackdrop>
          <div className="absolute inset-0" style={{ backgroundColor: pageBg }}>
            {background}
          </div>
        </PhoneBackdrop>
      )}
      {scroll ? (
        <ScrollView ref={bodyRef} className="flex-1 min-h-0" contentContainerClassName={contentClassName} contentContainerStyle={{ paddingBottom: footer ? 0 : bottomPad }}>
          {children}
        </ScrollView>
      ) : (
        <View ref={bodyRef} className={`flex-1 min-h-0 ${contentClassName}`}>
          {children}
        </View>
      )}
      {footer && (
        // 하단 CTA 영역: 좌우 24px (디자인 시스템 v2)
        <View className={`shrink-0 ${footerClassName}`} style={{ paddingBottom: inTabs ? navSpace : 16 }}>
          {footer}
        </View>
      )}
      {overlay}
    </div>
  );
}
