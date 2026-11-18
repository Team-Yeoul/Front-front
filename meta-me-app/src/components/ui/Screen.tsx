import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 화면 틀: 스크롤되는 본문 + 하단 고정 버튼(footer).
 * 웹의 데스크톱 폰 프레임용 상태바 색 지정 대신, 실제 상태바 글자색(statusFg)만 정한다.
 * 하단 탭이 있는 화면(inTabs)은 탭 바가 아래 안전 영역을 처리하므로 여기서는 비워 두지 않는다.
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
  overlay,
}: {
  children: ReactNode;
  footer?: ReactNode;
  bg?: string;
  /** 상태바 글자색 — 'light' = 진한 배경 위 흰 글자 */
  statusFg?: 'light' | 'dark';
  /** 본문 뒤에 까는 장식 레이어(그라데이션 등). 상태바 뒤까지 채운다. */
  background?: ReactNode;
  inTabs?: boolean;
  scroll?: boolean;
  contentClassName?: string;
  /** 토스트·떠 있는 버튼처럼 스크롤 본문 밖에서 화면 전체를 덮는 것. (Sheet/Modal은 RN Modal이라 어디 둬도 된다) */
  overlay?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const bottomPad = inTabs ? 0 : insets.bottom;

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      <StatusBar style={statusFg === 'light' ? 'light' : 'dark'} />
      {background}
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1" style={{ paddingTop: insets.top }}>
          {scroll ? (
            <ScrollView
              className="flex-1"
              contentContainerClassName={contentClassName}
              contentContainerStyle={{ paddingBottom: footer ? 0 : bottomPad }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View className={`flex-1 ${contentClassName}`}>{children}</View>
          )}
          {footer && (
            <View className="px-5 pt-2" style={{ paddingBottom: bottomPad + 16 }}>
              {footer}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      {overlay}
    </View>
  );
}
