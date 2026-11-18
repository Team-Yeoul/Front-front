import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '@/store';
import { useGetDailyRecord, useListDailyRecords } from '@/entities/diary';
import type { DailyRecord } from '@/entities/diary';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';

type Filter = 'all' | 'objectified' | 'draft';

function DiaryCard({ title, date, tags, onPress }: { title: string; date: string; tags: string[]; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="w-full rounded-2xl bg-card border border-line px-4 pt-4 pb-3.5 active:opacity-70">
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-[16px] font-bold text-ink">{title}</Text>
        <Text className="font-mono text-[13px] text-sub shrink-0">{date.slice(5)}</Text>
      </View>
      {tags.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 mt-2.5">
          {tags.map((t) => (
            <View key={t} className="h-6 px-2.5 rounded-full bg-primary-soft justify-center">
              <Text className="text-[12px] font-semibold text-primary">{t}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

function RealDiaryCard({ record }: { record: DailyRecord }) {
  const { data } = useGetDailyRecord(record.record_id);
  const q = data?.questions?.[0];
  const raw = q?.scene_description || q?.user_answer;
  const title = raw && /[가-힣]/.test(raw) ? raw : '기록 보기';
  const tags = (q?.emotion_tag ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t && /[가-힣]/.test(t))
    .slice(0, 3);
  return (
    <DiaryCard
      title={title}
      date={record.recorded_date.replaceAll('-', '.')}
      tags={tags}
      onPress={() => router.push({ pathname: '/diary/[id]', params: { id: record.record_id } })}
    />
  );
}

function DiaryList() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data, isError } = useListDailyRecords({ size: 50 }, !!accessToken);
  const [filter, setFilter] = useState<Filter>('all');

  const records = useMemo(() => data?.records ?? [], [data]);

  const groups = useMemo(() => {
    const map = new Map<string, DailyRecord[]>();
    // 임시저장 상태는 API에 없어 모든 기록을 객관화 완료로 본다.
    if (filter !== 'draft') {
      for (const r of records) {
        const month = r.recorded_date.replaceAll('-', '.').slice(0, 7);
        if (!map.has(month)) map.set(month, []);
        map.get(month)!.push(r);
      }
    }
    return [...map.entries()];
  }, [records, filter]);

  const counts = { all: data?.page_info?.total_elements ?? records.length, objectified: data?.page_info?.total_elements ?? records.length, draft: 0 };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: `전체 ${counts.all}` },
    { key: 'objectified', label: `객관화 완료 ${counts.objectified}` },
    { key: 'draft', label: `임시저장 ${counts.draft}` },
  ];

  return (
    <Screen
      inTabs
      overlay={
        <Pressable
          onPress={() => router.push('/diary/write')}
          accessibilityRole="button"
          accessibilityLabel="새 기록 쓰기"
          className="absolute right-5 bottom-5 z-20 w-14 h-14 rounded-full bg-primary items-center justify-center active:opacity-80"
          style={{ boxShadow: '0 8px 24px rgba(99,103,255,0.4)' }}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
          </Svg>
        </Pressable>
      }
    >
      <TopBar title="다이어리" onBack={() => router.navigate('/main')} />
      <View className="flex-row gap-2 px-5 mt-1">
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === f.key }}
            className={`h-9 px-3.5 rounded-full justify-center ${filter === f.key ? 'bg-ink' : 'bg-surface-2'}`}
          >
            <Text className={`text-[14px] ${filter === f.key ? 'text-white font-semibold' : 'text-[#48484F]'}`}>{f.label}</Text>
          </Pressable>
        ))}
      </View>
      <View className="px-5 pb-24">
        {groups.map(([month, items]) => (
          <View key={month} className="mt-5">
            <Text className="font-mono text-[13px] text-sub mb-2.5">{month}</Text>
            <View className="gap-3">
              {items.map((r) => (
                <RealDiaryCard key={r.record_id} record={r} />
              ))}
            </View>
          </View>
        ))}
        {isError && <Text className="text-center text-[14px] text-sub mt-20">기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Text>}
        {data && groups.length === 0 && (
          <View className="items-center mt-20">
            <Text className="text-[15px] font-semibold text-ink">{filter === 'draft' ? '임시저장한 기록이 없어요' : '아직 남긴 기록이 없어요'}</Text>
            <Text className="text-[13px] text-sub mt-1.5">+ 버튼을 눌러 첫 기록을 남겨보세요</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

export default function DiaryTab() {
  return (
    <SensitiveGate inTabs>
      <DiaryList />
    </SensitiveGate>
  );
}
