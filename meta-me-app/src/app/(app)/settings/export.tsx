import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useAuthStore } from '@/store';
import { useMe } from '@/hooks/useMe';
import { useExportRecords } from '@/hooks/useExportRecords';
import { groupByMonth, shareExportHtml, summarize, toEntries } from '@/lib/recordExport';
import { Screen } from '@/components/ui/Screen';
import { Button, TopBar } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-card border border-line px-4 py-3.5">
      <Text className="text-[22px] font-bold text-ink">{value}</Text>
      <Text className="text-[12px] text-sub">{label}</Text>
    </View>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <View className="h-6 px-2.5 rounded-full bg-primary-soft items-center justify-center">
      <Text className="text-[12px] font-semibold text-primary">{children}</Text>
    </View>
  );
}

export default function ExportRecordsScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const me = useMe();
  const { data, isError, refetch, isFetching } = useExportRecords(!!accessToken);

  const entries = useMemo(() => toEntries(data ?? []), [data]);
  const summary = useMemo(() => summarize(entries), [entries]);
  const months = useMemo(() => groupByMonth(entries), [entries]);

  // 웹은 HTML 파일을 내려받게 했고, 앱은 같은 HTML을 공유 시트로 넘긴다(lib/recordExport 참고).
  const footer =
    entries.length > 0 ? <Button onPress={() => void shareExportHtml(entries, me.nickname)}>파일로 저장하기</Button> : undefined;

  return (
    <Screen footer={footer}>
      {/* 앱을 이 화면에서 바로 연 경우처럼 뒤로 갈 곳이 없으면 설정으로 간다. */}
      <TopBar title="기록 내보내기" backHref="/settings" />
      <View className="px-5 pb-8">
        {!data && !isError && <Text className="text-center text-[14px] text-sub mt-24">기록을 모으는 중...</Text>}
        {isError && (
          <View className="items-center mt-24">
            <Text className="text-[14px] text-sub">기록을 불러오지 못했어요.</Text>
            <Pressable onPress={() => refetch()} disabled={isFetching} accessibilityRole="button" className="mt-3">
              <Text className="text-[14px] font-semibold text-primary">다시 시도</Text>
            </Pressable>
          </View>
        )}
        {data && entries.length === 0 && <Text className="text-center text-[15px] font-semibold text-ink mt-24">아직 내보낼 기록이 없어요</Text>}

        {entries.length > 0 && (
          <>
            <Text className="font-mono text-[13px] text-sub mt-1">
              {summary.from} – {summary.to}
            </Text>
            <View className="flex-row gap-2 mt-3">
              <Stat value={summary.total} label="전체 기록" />
              <Stat value={summary.months} label="기록한 달" />
              <Stat value={summary.myselfMoments} label="나다운 순간" />
            </View>
            {summary.topTags.length > 0 && (
              <View className="rounded-2xl bg-card border border-line px-4 py-3.5 mt-2">
                <Text className="text-[12px] font-semibold text-sub">자주 느낀 감정</Text>
                <View className="flex-row flex-wrap gap-1.5 mt-2">
                  {summary.topTags.map((t) => (
                    <Chip key={t.tag}>{`${t.tag} ${t.count}`}</Chip>
                  ))}
                </View>
              </View>
            )}

            {months.map(([month, items]) => (
              <View key={month} className="mt-6">
                <Text className="font-mono text-[13px] text-sub mb-2.5">
                  {month} · {items.length}개
                </Text>
                <View className="gap-3">
                  {items.map((e) => (
                    <View key={e.id} className="rounded-2xl bg-card border border-line px-4 py-4">
                      <Text className="font-mono text-[12px] text-sub">
                        {e.date} ({e.weekday})
                      </Text>
                      {!!e.question && <Text className="text-[15px] font-bold text-ink mt-1.5">Q. {e.question}</Text>}
                      {!!e.answer && <Text className="text-[14px] text-ink leading-[24px] mt-1.5">{e.answer}</Text>}
                      {!!e.scene && (
                        <>
                          <Text className="text-[12px] font-semibold text-primary mt-3">기억나는 장면</Text>
                          <Text className="text-[14px] text-[#48484F] leading-[24px] mt-0.5">{e.scene}</Text>
                        </>
                      )}
                      {!!e.myselfMoment && (
                        <>
                          <Text className="text-[12px] font-semibold text-primary mt-3">나다운 순간</Text>
                          <Text className="text-[14px] text-[#48484F] leading-[24px] mt-0.5">{e.myselfMoment}</Text>
                        </>
                      )}
                      {e.tags.length > 0 && (
                        <View className="flex-row flex-wrap gap-1.5 mt-3">
                          {e.tags.map((t) => (
                            <Chip key={t}>{t}</Chip>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </Screen>
  );
}
