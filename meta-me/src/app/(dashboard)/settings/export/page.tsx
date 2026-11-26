'use client';

import { Fragment, useMemo, useState } from 'react';
import { StatusView } from '@/components/ui/states';
import { useAuthStore } from '@/store';
import { useMe } from '@/hooks/useMe';
import { useExportRecords } from '@/hooks/useExportRecords';
import { groupByMonth, shareExportHtml, summarize, toEntries, type ExportEntry } from '@/lib/recordExport';
import { Screen } from '@/components/ui/Screen';
import { Button, TopBar } from '@/components/ui/primitives';
import { ScrollView, View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-card border border-line px-4 py-3.5">
      <Text className="text-[18px] font-semibold tabular-nums text-ink">{value}</Text>
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

function EntryCard({ e }: { e: ExportEntry }) {
  return (
    <View className="mx-5 rounded-2xl bg-card border border-line px-4 py-4">
      <Text className="tabular-nums text-[12px] text-sub">
        {e.date} ({e.weekday})
      </Text>
      {!!e.question && <Text className="text-[16px] font-bold text-ink mt-1.5">Q. {e.question}</Text>}
      {!!e.answer && <Text className="text-[14px] text-ink leading-[24px] mt-1.5">{e.answer}</Text>}
      {!!e.scene && (
        <>
          <Text className="text-[12px] font-semibold text-primary mt-3">기억나는 장면</Text>
          <Text className="text-[14px] text-body leading-[24px] mt-0.5">{e.scene}</Text>
        </>
      )}
      {!!e.myselfMoment && (
        <>
          <Text className="text-[12px] font-semibold text-primary mt-3">나다운 순간</Text>
          <Text className="text-[14px] text-body leading-[24px] mt-0.5">{e.myselfMoment}</Text>
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
  );
}

export default function ExportRecordsScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const me = useMe();
  const { data, isError, refetch, isFetching } = useExportRecords(!!accessToken);

  const entries = useMemo(() => toEntries(data ?? []), [data]);
  const summary = useMemo(() => summarize(entries), [entries]);
  // 달별로 묶어 보여 준다(앱은 SectionList로 보이는 것만 그린다. 웹은 한 번에 그린다).
  const sections = useMemo(() => groupByMonth(entries).map(([month, data]) => ({ month, data })), [entries]);

  // 웹은 HTML 파일을 내려받고, 앱은 같은 이름의 HTML 파일을 만들어 공유 시트로 넘긴다(lib/recordExport 참고).
  // 파일을 못 만들면 버튼 위에 안내한다.
  const [saveError, setSaveError] = useState('');
  const save = () => {
    setSaveError('');
    shareExportHtml(entries, me.nickname).catch(() => setSaveError('파일을 저장하지 못했어요. 다시 시도해 주세요.'));
  };
  const footer =
    entries.length > 0 ? (
      <>
        {saveError ? <Text className="text-[12px] text-danger text-center mb-2">{saveError}</Text> : null}
        <Button onPress={save}>파일로 저장하기</Button>
      </>
    ) : undefined;

  const header = (
    <View className="px-5">
      <Text className="tabular-nums text-[12px] text-sub mt-1">
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
    </View>
  );

  return (
    <Screen footer={footer} scroll={false}>
      {/* 이 화면을 주소로 바로 연 경우처럼 뒤로 갈 곳이 없으면 설정으로 간다. */}
      <TopBar title="기록 내보내기" backHref="/settings" />
      {entries.length > 0 ? (
        <ScrollView className="flex-1 min-h-0" contentContainerClassName="pb-8">
          {header}
          {sections.map((section) => (
            <Fragment key={section.month}>
              <Text className="tabular-nums text-[12px] text-sub mt-6 mb-2.5 px-5">
                {section.month} · {section.data.length}개
              </Text>
              {section.data.map((item, i) => (
                <Fragment key={item.id}>
                  {i > 0 && <View className="h-3" />}
                  <EntryCard e={item} />
                </Fragment>
              ))}
            </Fragment>
          ))}
        </ScrollView>
      ) : (
        <View className="px-5 pb-8">
          {!data && !isError && <Text className="text-center text-[14px] text-sub mt-24">기록을 모으는 중...</Text>}
          {isError && <StatusView kind="error" title="기록을 불러오지 못했어요" onRetry={() => refetch()} retrying={isFetching} className="pt-24" />}
          {data && entries.length === 0 && <Text className="text-center text-[16px] font-semibold text-ink mt-24">아직 내보낼 기록이 없어요</Text>}
        </View>
      )}
    </Screen>
  );
}
