import { Tabs } from 'expo-router';
import { BottomNav } from '@/components/layout/BottomNav';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tabs.Screen name="main" />
      <Tabs.Screen name="diary" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="report" />
      <Tabs.Screen name="mypage" />
    </Tabs>
  );
}
