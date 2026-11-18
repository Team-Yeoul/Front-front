import '@/global.css';

import { useEffect, useState } from 'react';
import { Stack, router, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from '@/shared/api';
import { useAuthStore, useLocalStore } from '@/store';
import { useMe } from '@/hooks/useMe';

SplashScreen.preventAutoHideAsync();

/**
 * 앱 루트. 글꼴과 저장된 로그인/기기 데이터를 불러올 때까지 네이티브 스플래시를 유지한다.
 * 로그인이 필요한 화면은 (app) 그룹에 모으고 Stack.Protected로 막는다.
 * 로그아웃(토큰 삭제)되면 Expo Router가 (app) 기록을 지우고 시작 화면으로 돌려보낸다.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Pretendard-Light': require('@/assets/fonts/Pretendard-Light.otf'),
    'Pretendard-Regular': require('@/assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('@/assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('@/assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('@/assets/fonts/Pretendard-Bold.otf'),
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([useAuthStore.persist.rehydrate(), useLocalStore.persist.rehydrate()]).finally(() => setHydrated(true));
  }, []);

  // 글꼴을 못 불러와도 시스템 글꼴로 앱은 연다.
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <RootStack />
      </QueryProvider>
    </SafeAreaProvider>
  );
}

function RootStack() {
  const token = useAuthStore((s) => s.accessToken);
  useTermsPendingRedirect();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="notifications" />
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

/**
 * Google로 막 가입해 약관 동의가 남은 사용자는 어느 화면에 있든 약관 화면으로 보낸다.
 * (웹 SensitiveConsentGate의 termsPending 처리와 같다)
 */
function useTermsPendingRedirect() {
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const { termsPending } = useMe();
  const mustAgreeTerms = !!token && !!termsPending && pathname !== '/terms';

  useEffect(() => {
    if (mustAgreeTerms) router.replace('/terms');
  }, [mustAgreeTerms]);
}
