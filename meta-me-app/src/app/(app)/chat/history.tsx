import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ChevronRight, SearchIcon } from '@/components/ui/icons';
import { TitleBar } from '@/components/chat-report/TitleBar';
import { useChatHistory } from '@/hooks/useChatHistory';
import { chatKindLabel, chatPreview, chatTitle, dayGroup, hhmm } from '@/lib/chatLabels';

type Filter = 'all' | 'free' | 'analysis';

// 이 기기에 저장한 대화와 서버의 상담 세션(다른 기기·브라우저에서 나눈 대화)을 함께 보여준다.
function ChatHistory() {
  const { chats, loading, failed } = useChatHistory();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const items = useMemo(
    () =>
      chats.filter(
        (c) => (filter === 'all' || c.kind === filter) && (!query.trim() || c.messages.some((m) => m.text.includes(query.trim()))),
      ),
    [chats, filter, query],
  );
  const groups = [...new Set(items.map((c) => dayGroup(c.startedAt)))];

  return (
    <Screen>
      <TitleBar title="지난 대화" backHref="/chat" />
      <View className="px-5 pt-2">
        <View className="flex-row items-center gap-2.5 h-12 rounded-2xl bg-surface-2 border border-line px-4">
          <SearchIcon />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="대화 내용 검색"
            placeholderTextColor="#B4B4BB"
            selectionColor="#6367FF"
            returnKeyType="search"
            className="flex-1 p-0 text-[15px] text-ink"
            style={{ fontFamily: 'Pretendard-Regular' }}
          />
        </View>
        <View className="flex-row gap-2 mt-3">
          {(
            [
              ['all', `전체 ${chats.length}`],
              ['free', '자유 대화'],
              ['analysis', '분석 질문'],
            ] as [Filter, string][]
          ).map(([f, label]) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f }}
              className={`h-9 px-3.5 rounded-full justify-center ${filter === f ? 'bg-ink' : 'bg-surface-2'}`}
            >
              <Text className={`text-[14px] ${filter === f ? 'text-white font-semibold' : 'text-[#48484F]'}`}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View className="px-5 pb-8">
        {failed && <Text className="mt-4 text-[13px] text-sub">다른 기기에서 나눈 대화 일부를 불러오지 못했어요.</Text>}
        {groups.map((g) => (
          <View key={g} className="mt-5">
            <Text className="font-mono text-[13px] text-sub mb-2.5">{g}</Text>
            <View className="gap-3">
              {items
                .filter((c) => dayGroup(c.startedAt) === g)
                .map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => router.push(`/chat/${c.id}`)}
                    accessibilityRole="button"
                    className="rounded-2xl bg-surface-2/70 px-4 py-4 active:opacity-80"
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <Text className="flex-1 text-[16px] font-bold text-ink" numberOfLines={1}>
                        {chatTitle(c)}
                      </Text>
                      <Text className="font-mono text-[12px] text-mute mt-1">{hhmm(c.startedAt)}</Text>
                    </View>
                    <Text className="text-[14px] text-sub mt-1.5" numberOfLines={1}>
                      {chatPreview(c)}
                    </Text>
                    <View className="flex-row items-center justify-between mt-3">
                      <View className="flex-row gap-1.5">
                        {[chatKindLabel(c), c.context].filter(Boolean).map((t) => (
                          <View key={t} className="h-7 px-2.5 rounded-full bg-primary-soft justify-center">
                            <Text className="text-[12px] font-semibold text-primary">{t}</Text>
                          </View>
                        ))}
                      </View>
                      <ChevronRight size={16} />
                    </View>
                  </Pressable>
                ))}
            </View>
          </View>
        ))}
        {items.length === 0 && !loading && (
          <View className="items-center mt-20">
            <Text className="text-[15px] font-semibold text-ink">{chats.length === 0 ? '아직 마친 대화가 없어요' : '검색 결과가 없어요'}</Text>
            {chats.length === 0 && <Text className="text-[13px] text-sub mt-1.5">대화를 나누고 ‘대화 마치기’를 누르면 여기에 저장돼요</Text>}
          </View>
        )}
      </View>
    </Screen>
  );
}

export default function ChatHistoryScreen() {
  return (
    <SensitiveGate>
      <ChatHistory />
    </SensitiveGate>
  );
}
