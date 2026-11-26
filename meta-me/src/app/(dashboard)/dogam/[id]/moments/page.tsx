'use client';

import { useParams } from 'next/navigation';
import { LinearGradient, View } from '@/components/ui/rn';
import { useAuthStore } from '@/store';
import { useListMyMonsters } from '@/entities/collection';
import { Screen } from '@/components/ui/Screen';
import { BackButton, CogniImg, ProgressBar, goBack } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { toDateKey } from '@/lib/date';
import { withSensitiveGate } from '@/components/SensitiveGate';

// 앱과 같이 toDateKey로 YYYY-MM-DD를 만든 뒤 YY.MM.DD로 줄인다.
const yymmdd = (iso: string) => (iso ? toDateKey(new Date(iso)).slice(2).replaceAll('-', '.') : '-');
// 서버 칭호 단계: 0-9개 = 1단계, 10-99 = 2, 100-999 = 3, 1000+ = 4
const STAGE_AT = [0, 10, 100, 1000];

/** 코그니 상세 시트 (5b5): 칭호 단계 · 특징 · 잡은 횟수 · 처음 발견한 순간 */
function CogniMomentsScreen() {
  // Next useParams는 경로 값을 인코딩된 채로 줄 수 있어 한 번 디코딩한다.
  const id = decodeURIComponent(useParams<{ id: string }>().id);
  const token = useAuthStore((s) => s.accessToken);
  const cogni = useCollection().find((c) => c.id === id);
  const { data } = useListMyMonsters({ size: 100 }, !!token);
  const owned = data?.monsters?.find((m) => m.monster_id === id);
  // 서버 도감에 아직 없으면(온보딩 첫 코그니 등) 한 번 잡은 것으로 본다.
  const count = owned?.monster_count ?? 1;
  const stage = owned?.title_stage ?? 1;
  const next = STAGE_AT[stage];
  const prev = STAGE_AT[stage - 1] ?? 0;

  if (!cogni) {
    return (
      <Screen>
        <View className="px-5 pt-2 flex-row">
          <BackButton href="/dogam" />
        </View>
        <Text className="text-center text-[14px] text-sub mt-24">아직 모으지 않은 코그니예요.</Text>
      </Screen>
    );
  }

  const features = cogni.features?.length ? cogni.features : [cogni.desc];

  return (
    <Screen background={<LinearGradient colors={['#A9ABFF', '#C9CAFF']} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 300 }} />}>
      <View className="flex-row items-center h-14 px-5">
        <BackButton onPress={() => goBack('/dogam')} />
      </View>
      <View className="items-center mt-2">
        <View className="h-11 px-4 rounded-full bg-page flex-row items-center" style={{ boxShadow: '0 4px 16px rgba(60,60,140,0.15)' }}>
          <Text className="text-[16px] font-bold text-ink tabular-nums">{count}번째로</Text>
          <Text className="text-[16px] text-ink whitespace-pre"> 나를 찾아왔어요</Text>
        </View>
      </View>

      <View className="mt-16 bg-page rounded-t-[32px] flex-1 min-h-[600px]">
        <View className="absolute left-0 right-0 -top-[70px] items-center">
          <View className="w-[140px] h-[140px] shrink-0 rounded-full bg-primary-soft border-[6px] border-page items-center justify-center overflow-hidden">
            <CogniImg src={cogni.image} size={110} />
          </View>
        </View>
        <View className="px-6 pt-[90px] pb-6 items-center">
          <Text accessibilityRole="header" className="text-[24px] font-bold text-ink text-center">
            {cogni.name}
          </Text>
          <Text className="text-[16px] text-text-3 leading-[26px] mt-2 text-center">{cogni.desc}</Text>
          <View className="flex-row flex-wrap justify-center gap-2 mt-4">
            {[cogni.category, `칭호 ${stage} / 4`].map((c) => (
              <View key={c} className="h-8 px-3 rounded-full bg-primary-soft justify-center">
                <Text className="text-[12px] font-semibold text-primary-pressed">{c}</Text>
              </View>
            ))}
          </View>
          {next !== undefined && (
            <View className="flex-row items-center gap-3 mt-5 self-stretch">
              <View className="flex-1">
                <ProgressBar value={((count - prev) / (next - prev)) * 100} height={6} />
              </View>
              <Text className="text-[12px] text-sub shrink-0">{next - count}번 더 잡으면 다음 칭호</Text>
            </View>
          )}
        </View>

        <View className="border-t-8 border-surface px-6 py-6">
          <Text accessibilityRole="header" className="text-[16px] font-bold text-ink">
            {cogni.name} 특징
          </Text>
          <View className="gap-3 mt-4">
            {features.map((f) => (
              <View key={f} className="flex-row gap-2.5">
                <View className="mt-[10px] w-1.5 h-1.5 rounded-full bg-ink shrink-0" />
                <Text className="flex-1 text-[16px] text-ink leading-[25px]">{f}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="border-t-8 border-surface flex-row py-5">
          {[
            { label: '첫 발견', value: yymmdd(cogni.foundAt) },
            { label: '잡은 횟수', value: `${count}번` },
            { label: '최근', value: yymmdd(cogni.foundAt) },
          ].map((s, i) => (
            <View key={s.label} className={`flex-1 items-center ${i ? 'border-l border-line' : ''}`}>
              <Text className="text-[12px] text-sub">{s.label}</Text>
              <Text className="text-[16px] font-bold text-ink mt-1 tabular-nums">{s.value}</Text>
            </View>
          ))}
        </View>

        <View className="border-t-8 border-surface px-6 py-6">
          <View className="flex-row items-center justify-between">
            <Text accessibilityRole="header" className="text-[16px] font-bold text-ink">
              처음 발견한 순간
            </Text>
            {cogni.foundAt ? <Text className="text-[12px] text-sub tabular-nums">{yymmdd(cogni.foundAt)}</Text> : null}
          </View>
          <Text className="text-[16px] text-text-3 leading-[26px] mt-3">
            {cogni.source === 'onboarding'
              ? '온보딩 답에서 처음 발견됐어요. 기록에서 다시 나타나면 그 순간이 여기에 쌓여요.'
              : '기록을 객관화하다가 만났어요. 다시 잡히면 그 순간이 여기에 쌓여요.'}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(CogniMomentsScreen);
