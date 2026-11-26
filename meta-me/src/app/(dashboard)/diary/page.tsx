'use client';

import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { diaryApi, diaryKeys, useGetDailyRecord, useInfiniteDailyRecords } from '@/entities/diary';
import type { DailyRecord } from '@/entities/diary';
import { NAV_HEIGHT, navOffset } from '@/components/layout/BottomNav';
import { Screen } from '@/components/ui/Screen';
import { BackButton } from '@/components/ui/primitives';
import { SearchIcon } from '@/components/ui/icons';
import { Pressable, TextInput, View, useSafeAreaInsets } from '@/components/ui/rn';
import { Skeleton, StatusView, useOnline } from '@/components/ui/states';
import { Text } from '@/components/ui/Text';
import { LoadMore, type LoadMoreState } from '@/components/diary/LoadMore';
import { MOODS, useMoods } from '@/lib/mood';
import { router } from '@/lib/router';
import { useTheme } from '@/lib/theme';
import { withSensitiveGate } from '@/components/SensitiveGate';
import { MAX_TEXT_LENGTH } from '@/lib/textLimits';

type Filter = 'all' | 'objectified' | 'draft';

const toDetail = (id: string) => router.push({ pathname: '/diary/[id]', params: { id } });
const tagsOf = (emotionTag?: string) =>
  (emotionTag ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t && /[가-힣]/.test(t))
    .slice(0, 3);

function Tags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <View className="flex-row flex-wrap gap-1.5 mt-2.5">
      {tags.map((t) => (
        <View key={t} className="h-6 px-2.5 rounded-full bg-primary-soft justify-center">
          <Text className="text-[12px] font-semibold text-primary-pressed">{t}</Text>
        </View>
      ))}
    </View>
  );
}

function DiaryCard({ title, date, tags, moodDot, onPress }: { title: string; date: string; tags: string[]; moodDot?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="w-full shrink-0 rounded-[20px] bg-surface px-4 py-4 active:opacity-70">
      <View className="flex-row items-start justify-between gap-3">
        <Text numberOfLines={1} className="flex-1 min-w-0 text-[16px] font-semibold text-ink">
          {title}
        </Text>
        <View className="flex-row items-center gap-1.5 shrink-0 mt-0.5">
          {/* 그날 고른 기분 색 (기록 B 0단계) */}
          {moodDot && <View className="w-2 h-2 shrink-0 rounded-full" style={{ backgroundColor: moodDot }} />}
          <Text className="tabular-nums text-[12px] text-mute">{date.slice(5)}</Text>
        </View>
      </View>
      <Tags tags={tags} />
    </Pressable>
  );
}

function RealDiaryCard({ record, moodDot }: { record: DailyRecord; moodDot?: string }) {
  const { data } = useGetDailyRecord(record.record_id);
  const q = data?.questions?.[0];
  const raw = q?.scene_description || q?.user_answer;
  const title = raw && /[가-힣]/.test(raw) ? raw : '기록 보기';
  return <DiaryCard title={title} date={record.recorded_date.replaceAll('-', '.')} tags={tagsOf(q?.emotion_tag)} moodDot={moodDot} onPress={() => toDetail(record.record_id)} />;
}

/** 검색어를 보라색으로 칠한다. Text 안에 넣는다. */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(query);
  return (
    <>
      {parts.map((part, i) => (
        <Text key={i}>
          {part}
          {i < parts.length - 1 && <Text className="text-primary">{query}</Text>}
        </Text>
      ))}
    </>
  );
}

/** 목록 요청 상태 — 검색도 목록을 다 받은 뒤에만 '없어요'라고 말한다. */
type ListState = {
  loading: boolean;
  failed: boolean;
  offline: boolean;
  retry: () => void;
  retrying: boolean;
  total: number;
  /** 아직 안 받은 이전 기록이 있으면 더 받는다. */
  more?: LoadMoreState;
};

/**
 * 검색 결과 (17d): 장면·답·감정·나다움 글에 검색어가 든 기록.
 * 서버 검색이 없어 목록으로 받은 기록 안에서만 찾는다. 전체보다 적게 받았으면 그 범위를 알리고 이전 기록을 더 받게 한다.
 */
function SearchResults({ records, query, list }: { records: DailyRecord[]; query: string; list: ListState }) {
  const details = useQueries({
    queries: records.map((r) => ({
      queryKey: diaryKeys.record(r.record_id),
      queryFn: () => diaryApi.getDailyRecord(r.record_id),
      enabled: !!query,
      staleTime: 60_000,
    })),
  });
  // 목록을 아직 못 받았거나 실패했으면 '0개' 대신 그 상태를 보여 준다.
  if (list.failed) {
    return (
      <StatusView
        kind={list.offline ? 'offline' : 'error'}
        title={list.offline ? undefined : '기록을 불러오지 못했어요'}
        sub={list.offline ? '연결되면 기록을 다시 불러와요' : undefined}
        onRetry={list.retry}
        retrying={list.retrying}
      />
    );
  }
  if (list.loading) return <Text className="text-[14px] text-sub text-center mt-20">기록을 불러오는 중...</Text>;
  if (!query) return <Text className="text-[14px] text-sub text-center mt-20">기록 내용으로 찾아볼 수 있어요</Text>;
  const loading = details.some((d) => d.isPending);
  // 내용을 못 불러온 기록은 '없음'으로 치지 않고 따로 알려 다시 시도하게 한다.
  const failedDetails = details.filter((d) => d.isError);
  const partial = list.total > records.length;
  const hits = records.flatMap((r, i) => {
    const q = details[i]?.data?.questions?.[0];
    if (!q) return [];
    const haystack = [q.user_answer, q.scene_description, q.emotion_tag, q.myself_moment_desc].filter(Boolean).join(' ');
    if (!haystack.includes(query)) return [];
    const title = (q.scene_description || q.user_answer || '기록').slice(0, 24);
    // 본문은 검색어가 든 쪽을 먼저 보여준다.
    const body = [q.user_answer, q.myself_moment_desc].find((t) => t?.includes(query)) ?? q.user_answer ?? '';
    return [{ r, title, body, tags: tagsOf(q.emotion_tag) }];
  });
  return (
    <View className="px-4 pb-16">
      <Text className="text-[12px] text-sub px-1 mt-4 mb-3">
        {loading && hits.length === 0
          ? '찾는 중...'
          : `${partial ? `불러온 기록 ${records.length}개 중 ` : ''}‘${query}’가 들어간 기록 ${hits.length}개`}
      </Text>
      {failedDetails.length > 0 && (
        <Pressable
          onPress={() => failedDetails.forEach((d) => void d.refetch())}
          accessibilityRole="button"
          className="mb-3 rounded-2xl bg-danger-soft px-4 py-3 flex-row items-center justify-between"
        >
          <Text className="text-[12px] text-danger flex-1">기록 {failedDetails.length}개의 내용을 불러오지 못해 결과가 빠졌을 수 있어요</Text>
          <Text className="text-[12px] font-semibold text-danger ml-3">다시 시도</Text>
        </Pressable>
      )}
      <View className="gap-3">
        {hits.map(({ r, title, body, tags }) => (
          <Pressable
            key={r.record_id}
            onPress={() => toDetail(r.record_id)}
            accessibilityRole="button"
            className="w-full shrink-0 rounded-[20px] bg-surface px-4 py-4 active:opacity-70"
          >
            <View className="flex-row items-start justify-between gap-3">
              <Text numberOfLines={1} className="flex-1 min-w-0 text-[16px] font-semibold text-ink">
                <Highlight text={title} query={query} />
              </Text>
              <Text className="shrink-0 tabular-nums text-[12px] text-mute mt-0.5">{r.recorded_date.slice(5).replace('-', '.')}</Text>
            </View>
            {body ? (
              <Text numberOfLines={2} className="text-[14px] text-body leading-[22px] mt-1.5">
                <Highlight text={body} query={query} />
              </Text>
            ) : null}
            <Tags tags={tags} />
          </Pressable>
        ))}
      </View>
      {!loading && hits.length === 0 && failedDetails.length === 0 && (
        <Text className="text-[14px] text-sub text-center mt-16">
          {partial ? `불러온 기록 ${records.length}개 안에는 없어요. 이전 기록을 더 불러와 찾아보세요.` : '찾는 기록이 없어요. 다른 말로 찾아보세요.'}
        </Text>
      )}
      {partial && list.more && <LoadMore more={list.more} />}
    </View>
  );
}

/** 다이어리 목록 (13a) */
function DiaryTab() {
  const { fg } = useTheme();
  const insets = useSafeAreaInsets();
  const accessToken = useAuthStore((s) => s.accessToken);
  // 50개씩 받고, 끝에서 '이전 기록 더 보기'로 다음 페이지를 이어 붙인다(받은 페이지는 유지).
  const { data, isError, refetch, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage, isFetchNextPageError } = useInfiniteDailyRecords(
    50,
    !!accessToken,
  );
  const more = hasNextPage ? { load: () => void fetchNextPage(), loading: isFetchingNextPage, failed: isFetchNextPageError } : undefined;
  const online = useOnline();
  // 받아 둔 목록이 없을 때만 오프라인·오류 화면으로 바꾼다.
  const failed = !data && (!online || isError);
  const [filter, setFilter] = useState<Filter>('all');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const moods = useMoods();

  const records = useMemo(() => data?.pages.flatMap((p) => p.records) ?? [], [data]);
  const groups = useMemo(() => {
    const map = new Map<string, DailyRecord[]>();
    // 임시저장 상태는 API에 없어 모든 기록을 객관화 완료로 본다.
    if (filter !== 'draft') {
      for (const r of records) {
        const month = r.recorded_date.replaceAll('-', '.').slice(0, 7);
        map.set(month, [...(map.get(month) ?? []), r]);
      }
    }
    return [...map.entries()];
  }, [records, filter]);

  const total = data?.pages[0]?.page_info?.total_elements ?? records.length;
  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: `전체 ${total}` },
    { key: 'objectified', label: `객관화 완료 ${total}` },
    { key: 'draft', label: '임시저장 0' },
  ];

  if (searching) {
    return (
      <Screen inTabs>
        <View className="flex-row items-center gap-3 px-4 pt-2">
          <View className="flex-1 flex-row items-center gap-2.5 h-12 rounded-full bg-surface px-4">
            <SearchIcon size={18} color={fg('#8A8A96')} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="기록 내용 검색"
              accessibilityLabel="기록 내용 검색"
              maxLength={MAX_TEXT_LENGTH}
              returnKeyType="search"
              placeholderTextColor={fg('#A1A1AA')}
              selectionColor="#6367FF"
              cursorColor="#6367FF"
              className="flex-1 min-w-0 p-0 text-[16px] text-ink"
            />
            {query ? (
              <Pressable
                onPress={() => setQuery('')}
                accessibilityRole="button"
                accessibilityLabel="검색어 지우기"
                className="w-5 h-5 shrink-0 rounded-full items-center justify-center"
                style={{ backgroundColor: fg('#C4C4CC') }}
              >
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
                </svg>
              </Pressable>
            ) : null}
          </View>
          <Pressable
            onPress={() => {
              setSearching(false);
              setQuery('');
            }}
            accessibilityRole="button"
          >
            <Text className="text-[16px] font-semibold text-ink">취소</Text>
          </Pressable>
        </View>
        <SearchResults
          records={records}
          query={query.trim()}
          list={{ loading: !data && !failed, failed, offline: !online, retry: () => void refetch(), retrying: isFetching, total, more }}
        />
      </Screen>
    );
  }

  return (
    <Screen
      inTabs
      overlay={
        // 떠 있는 탭 바 바로 위에 띄운다.
        <Pressable
          onPress={() => router.push('/diary/write')}
          accessibilityRole="button"
          className="absolute right-5 z-20 h-14 pl-4 pr-5 rounded-full bg-primary flex-row items-center gap-1.5 active:opacity-80"
          style={{ bottom: NAV_HEIGHT + navOffset(insets.bottom) + 12, boxShadow: '0 8px 24px rgba(99,103,255,0.4)' }}
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
          </svg>
          <Text className="text-[16px] font-bold text-white">새 기록 쓰기</Text>
        </Pressable>
      }
    >
      <View className="h-11 mt-2 flex-row items-center justify-center px-5">
        <View className="absolute left-5">
          <BackButton onPress={() => router.navigate('/main')} />
        </View>
        <Text accessibilityRole="header" className="text-[16px] font-semibold text-ink">
          다이어리
        </Text>
        <Pressable
          onPress={() => setSearching(true)}
          accessibilityRole="button"
          accessibilityLabel="기록 검색"
          className="absolute right-5 w-10 h-10 rounded-full items-center justify-center"
        >
          <SearchIcon size={20} color={fg('#1A1A1E')} />
        </Pressable>
      </View>
      {!failed && (
        <View className="flex-row gap-2 px-4 mt-4">
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                className={`h-[34px] shrink-0 px-3.5 rounded-full justify-center ${on ? 'bg-ink' : 'bg-surface-2'}`}
              >
                <Text className={`text-[14px] tabular-nums ${on ? 'text-page font-semibold' : 'text-text-3'}`}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {/* 아래 '새 기록 쓰기' 버튼에 마지막 카드가 가리지 않게 여유를 둔다. */}
      <View className="px-4 pb-20">
        {groups.map(([month, items]) => (
          <View key={month} className="mt-5">
            <Text className="tabular-nums text-[12px] text-sub mb-2.5 px-0.5">{month}</Text>
            <View className="gap-3">
              {items.map((r) => {
                const mi = moods[r.recorded_date];
                return <RealDiaryCard key={r.record_id} record={r} moodDot={mi !== undefined && MOODS[mi] ? MOODS[mi].dot : undefined} />;
              })}
            </View>
          </View>
        ))}
        {more && filter !== 'draft' && <LoadMore more={more} />}
        {failed && (
          <StatusView
            kind={online ? 'error' : 'offline'}
            title={online ? '기록을 불러오지 못했어요' : undefined}
            sub={online ? undefined : '연결되면 기록을 다시 불러와요'}
            onRetry={() => refetch()}
            retrying={isFetching}
          />
        )}
        {!data && !failed && (
          <View className="gap-3 mt-5" accessibilityLabel="기록 불러오는 중">
            <Skeleton className="w-16 h-3.5" />
            {[0, 1, 2].map((i) => (
              <View key={i} className="rounded-[20px] bg-surface px-4 py-4">
                <Skeleton onSurface className="w-2/3 h-4" />
                <Skeleton onSurface className="w-24 h-6 mt-3 rounded-full" />
              </View>
            ))}
          </View>
        )}
        {data && groups.length === 0 && (
          <View className="items-center mt-20">
            <Text className="text-[16px] font-semibold text-ink">{filter === 'draft' ? '임시저장한 기록이 없어요' : '아직 남긴 기록이 없어요'}</Text>
            <Text className="text-[12px] text-sub mt-1.5">‘새 기록 쓰기’를 눌러 첫 기록을 남겨보세요</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(DiaryTab, { inTabs: true });
