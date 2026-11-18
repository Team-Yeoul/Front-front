import { Stack } from 'expo-router';

/** 로그인한 사용자만 들어오는 화면들. 루트 레이아웃에서 토큰이 있을 때만 열린다. */
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }} />;
}
