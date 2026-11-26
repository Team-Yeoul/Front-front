'use client';

import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { StatusView } from '@/components/ui/states';

/** 없는 주소로 들어왔을 때 (앱 +not-found). 로그인 전이면 시작 화면이 다시 로그인으로 안내한다. */
export default function NotFoundScreen() {
  return (
    <Screen footer={<Button onPress={() => router.replace('/')}>홈으로 가기</Button>}>
      <StatusView kind="error" title="찾는 화면이 없어요" sub="주소가 바뀌었거나 사라진 화면이에요" className="pt-[260px]" />
    </Screen>
  );
}
