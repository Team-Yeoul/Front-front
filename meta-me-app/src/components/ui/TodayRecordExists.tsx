import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from './Screen';
import { Text } from './Text';
import { Button, Img3D, TextButton, TopBar } from './primitives';

/** 오늘 기록이 이미 있을 때: 새로 써서 덮어쓰는 대신 기존 기록을 보거나 수정하게 한다. */
export function TodayRecordExists({ recordId }: { recordId: string | null }) {
  return (
    <Screen
      footer={
        recordId ? (
          <>
            <Button onPress={() => router.replace(`/diary/write?edit=${encodeURIComponent(recordId)}`)}>오늘 기록 수정하기</Button>
            <TextButton className="mt-1" onPress={() => router.replace({ pathname: '/diary/[id]', params: { id: recordId } })}>
              기록 보기
            </TextButton>
          </>
        ) : (
          <Button onPress={() => router.dismissTo('/diary')}>다이어리로</Button>
        )
      }
    >
      <TopBar title="오늘의 기록" />
      <View className="items-center pt-24 px-8">
        <Img3D name="check" size={96} />
        <Text className="text-[22px] font-bold text-ink mt-4 text-center">오늘 기록이 이미 있어요</Text>
        <Text className="text-[14px] text-sub mt-2 leading-[23px] text-center">
          {'기록은 하루에 하나만 남길 수 있어요.\n새로 쓰면 지금 기록이 사라지니, 수정해 주세요.'}
        </Text>
      </View>
    </Screen>
  );
}
