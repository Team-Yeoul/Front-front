import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { BackButton, CogniImg } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';
import { SensitiveGate } from '@/components/SensitiveGate';
import { useCollection } from '@/hooks/useCollection';
import { toDateKey } from '@/lib/date';

// 웹은 toLocaleDateString('sv-SE')로 YYYY-MM-DD를 만들었다. 앱은 Hermes 로케일 차이를 피해 toDateKey를 쓴다.
const mmdd = (iso: string) => (iso ? toDateKey(new Date(iso)).slice(5).replace('-', '.') : '-');

export default function CogniMomentsScreen() {
  return (
    <SensitiveGate>
      <CogniMoments />
    </SensitiveGate>
  );
}

function CogniMoments() {
  // 라우터가 경로 값을 디코딩해서 넘겨 주므로 웹처럼 decodeURIComponent를 다시 하지 않는다.
  const { id } = useLocalSearchParams<{ id: string }>();
  const cogni = useCollection().find((c) => c.id === id);

  return (
    <Screen>
      <View className="px-5 pt-2">
        <BackButton href={'/dogam'} />
      </View>
      {!cogni ? (
        <View className="items-center mt-24">
          <Text className="text-center text-[14px] text-sub">아직 모으지 않은 코그니예요.</Text>
        </View>
      ) : (
        <View className="px-5 pt-4 pb-8 gap-4">
          <View className="rounded-3xl bg-surface px-4 py-4">
            <View className="flex-row items-center gap-4">
              <View className="w-[72px] h-[72px] rounded-2xl bg-white items-center justify-center overflow-hidden">
                <CogniImg src={cogni.image} size={62} />
              </View>
              <View className="flex-1">
                <View className="self-start h-6 px-2.5 rounded-full bg-primary-soft justify-center">
                  <Text className="text-[12px] font-semibold text-primary">{cogni.category}</Text>
                </View>
                <Text className="text-[20px] font-bold text-ink mt-1.5">{cogni.name}</Text>
                <Text className="text-[13px] text-sub mt-0.5">{cogni.desc}</Text>
              </View>
            </View>
            <View className="flex-row rounded-2xl bg-white mt-4 py-3">
              {[
                { label: '첫 발견', value: mmdd(cogni.foundAt) },
                { label: '잡은 횟수', value: '1번' },
                { label: '최근', value: mmdd(cogni.foundAt) },
              ].map((s, i) => (
                <View key={s.label} className={`flex-1 items-center ${i ? 'border-l border-line' : ''}`}>
                  <Text className="text-[12px] text-sub">{s.label}</Text>
                  <Text className="font-mono text-[16px] font-bold text-ink mt-1">{s.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {cogni.source === 'onboarding' ? (
            <View className="rounded-3xl bg-surface px-5 py-5">
              <Text className="font-mono text-[12px] text-sub">{mmdd(cogni.foundAt)} · 온보딩</Text>
              <Text className="text-[18px] font-bold text-ink leading-[26px] mt-3">온보딩 답에서 처음 발견됐어요</Text>
              <Text className="text-[14px] text-[#48484F] leading-[23px] mt-2">앞으로 기록에서 이 코그니가 다시 나타나면, 그 순간이 여기에 쌓여요.</Text>
            </View>
          ) : (
            <View className="rounded-3xl border border-dashed border-line px-5 py-8 items-center">
              <Text className="text-[14px] text-sub text-center">기록에서 이 코그니가 잡힌 순간이 여기에 모여요</Text>
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}
