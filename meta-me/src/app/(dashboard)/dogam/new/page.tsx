'use client';

import { router } from '@/lib/router';
import { View } from '@/components/ui/rn';
import { useAuthStore } from '@/store';
import { useListMyMonsters } from '@/entities/collection';
import { Screen } from '@/components/ui/Screen';
import { Button, TextButton, TopBar, goBack } from '@/components/ui/primitives';
import { StatusView } from '@/components/ui/states';
import { Text } from '@/components/ui/Text';
import { CogniReveal } from '@/components/ui/CogniReveal';
import { latestIndex, useCollection } from '@/hooks/useCollection';
import { useMe } from '@/hooks/useMe';
import { withSensitiveGate } from '@/components/SensitiveGate';

/** 코그니 발견 (5b2): 도감에 막 들어온 코그니 */
function NewCogniScreen() {
  const { nickname } = useMe();
  const collection = useCollection();
  const index = latestIndex(collection);
  const cogni = collection[index];
  // 도감을 아직 못 받았거나 모은 코그니가 없어도 화면과 뒤로가기는 남겨 둔다.
  const token = useAuthStore((s) => s.accessToken);
  const { isPending, isError, refetch, isFetching } = useListMyMonsters({ size: 100 }, !!token);
  if (!cogni) {
    return (
      <Screen>
        <TopBar backHref="/main" />
        {isError ? (
          <StatusView kind="error" title="코그니를 불러오지 못했어요" onRetry={() => refetch()} retrying={isFetching} />
        ) : (
          <View className="items-center px-8 py-24">
            <Text className="text-[16px] font-semibold text-ink text-center">{isPending ? '코그니를 불러오는 중이에요' : '아직 만난 코그니가 없어요'}</Text>
            {!isPending && <Text className="text-[14px] text-sub text-center mt-1.5">기록을 객관화하면 코그니를 만날 수 있어요</Text>}
          </View>
        )}
      </Screen>
    );
  }
  return (
    <CogniReveal
      title="코그니 발견"
      no={index + 1}
      eyebrow={`${nickname ? `${nickname}님` : '나'} 안에서 발견된 코그니`}
      image={cogni.image}
      category={cogni.category}
      name={cogni.name}
      desc={cogni.desc}
      onBack={() => goBack('/main')}
      footer={
        <>
          <Button onPress={() => router.push({ pathname: '/dogam/[id]/moments', params: { id: cogni.id } })}>잡은 순간 확인하기</Button>
          <TextButton className="mt-1" onPress={() => router.push('/dogam')}>
            도감에서 확인하기
          </TextButton>
        </>
      }
    />
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(NewCogniScreen);
