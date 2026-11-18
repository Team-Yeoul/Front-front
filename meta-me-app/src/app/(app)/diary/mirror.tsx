import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { Button, ChatFab, Segmented, TopBar } from '@/components/ui/primitives';
import { AskSheet } from '@/components/ui/AskSheet';
import { Text } from '@/components/ui/Text';
import { readLastWrite } from '@/lib/lastWrite';

// 웹은 /diary로 push했다. 앱은 작성 흐름 화면을 스택에 남기지 않도록 다이어리 탭까지 되돌아간다.
const toDiary = () => router.dismissTo('/diary');

function Mirror() {
  const insets = useSafeAreaInsets();
  // 웹은 sessionStorage라 effect에서 읽었다. 앱은 메모리에 있어 처음 렌더에서 바로 읽는다.
  const [result] = useState(readLastWrite);
  const [tab, setTab] = useState<'objective' | 'original'>('objective');
  const [ask, setAsk] = useState(false);

  if (!result) {
    return (
      <Screen footer={<Button onPress={toDiary}>다이어리로</Button>}>
        <TopBar title="객관화 미러" onBack={toDiary} />
        <Text className="text-center text-[14px] text-sub mt-24">표시할 객관화 결과가 없어요.</Text>
      </Screen>
    );
  }

  const hasCogni = result.unlocked.length > 0;

  return (
    <Screen
      footer={
        <Button onPress={() => router.push(hasCogni ? '/diary/cogni' : '/diary/streak')}>{hasCogni ? '발견된 코그니 보기' : '기록 마치기'}</Button>
      }
      overlay={
        <>
          {/* 하단 버튼(63px + 여백) 바로 위에 띄운다. */}
          <View pointerEvents="box-none" className="absolute right-5 z-20" style={{ bottom: insets.bottom + 96 }}>
            <ChatFab onPress={() => setAsk(true)} />
          </View>
          <AskSheet open={ask} onClose={() => setAsk(false)} context="객관화 미러" />
        </>
      }
    >
      <TopBar title="객관화 미러" onBack={toDiary} />
      <View className="px-5 pt-3 pb-6">
        <Segmented
          options={[
            { value: 'objective', label: '객관화' },
            { value: 'original', label: '내가 쓴 원문' },
          ]}
          value={tab}
          onChange={setTab}
        />
        <View className="mt-4 rounded-3xl bg-surface px-5 py-6">
          <Text className="font-mono text-[12px] tracking-[1.4px] text-mute">{tab === 'objective' ? 'OBSERVER VIEW' : 'MY WORDS'}</Text>
          <Text className="text-[17px] text-ink leading-[31px] mt-3">
            {tab === 'original'
              ? result.original
              : result.objective || '객관화 결과를 받아오지 못했어요. 기록은 다이어리에 저장됐는지 확인해 주세요.'}
          </Text>
        </View>

        {result.emotions.length > 0 && (
          <View className="mt-4 rounded-3xl border border-line px-5 py-5">
            <Text className="text-[15px] font-bold text-ink">오늘 고른 감정</Text>
            <View className="flex-row flex-wrap gap-2 mt-3">
              {result.emotions.map((e, i) => (
                <View key={e} className={`h-9 px-4 rounded-full justify-center ${i % 2 ? 'bg-yellow' : 'bg-primary'}`}>
                  <Text className={`text-[14px] font-semibold ${i % 2 ? 'text-ink' : 'text-white'}`}>{e}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

export default function DiaryMirrorScreen() {
  return (
    <SensitiveGate>
      <Mirror />
    </SensitiveGate>
  );
}
