'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput, View } from '@/components/ui/rn';
import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { SearchIcon } from '@/components/ui/icons';
import { BackButton, Button, ButtonPair, Snackbar, Toast } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlays';
import { IOSActionSheet } from '@/components/ui/iosOverlays';
import { ChatRow, IOS_ORANGE, IOS_RED, PinIcon, TrashIcon } from '@/components/chat/ChatRow';
import { useDeleteSession } from '@/entities/counseling';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useMe } from '@/hooks/useMe';
import { chatTitle, dayGroup } from '@/lib/chatLabels';
import type { SavedChat } from '@/store';
import { StandaloneNav } from '@/components/layout/BottomNav';
import { useTheme } from '@/lib/theme';
import { withSensitiveGate } from '@/components/SensitiveGate';
import { MAX_TEXT_LENGTH } from '@/lib/textLimits';

type Filter = 'all' | 'free' | 'analysis';

// 이 기기에 저장한 대화와 서버의 상담 세션(다른 기기·브라우저에서 나눈 대화)을 함께 보여준다.
function ChatHistoryScreen() {
  const { fg } = useTheme();
  const { chats, loading, failed } = useChatHistory();
  const me = useMe();
  const pinnedIds = me.pinnedChats ?? [];
  const del = useDeleteSession();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  // 길게 눌러 연 메뉴의 대화 · 삭제를 확인 중인 대화
  const [menuFor, setMenuFor] = useState<SavedChat | null>(null);
  const [deleting, setDeleting] = useState<SavedChat | null>(null);
  // 성공 확인은 토스트(제자리 Fade), 실패 안내는 스낵바(아래에서 올라옴)
  const [toast, setToast] = useState('');
  const [snack, setSnack] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!snack) return;
    const t = setTimeout(() => setSnack(''), 3500);
    return () => clearTimeout(t);
  }, [snack]);

  const togglePin = (c: SavedChat) => {
    const was = pinnedIds.includes(c.id);
    me.togglePinChat(c.id);
    setToast(was ? '고정을 풀었어요' : '위에 고정했어요');
  };

  // 서버 세션이 있으면 서버에서 먼저 지운다(이미 없으면 그대로 진행). 실패하면 기기에서도 지우지 않는다.
  const remove = async (c: SavedChat) => {
    if (c.sessionId) {
      try {
        await del.mutateAsync(c.sessionId);
      } catch {
        // 이미 없는 세션(404)은 useDeleteSession이 성공으로 처리하고 캐시도 정리한다.
        setDeleting(null);
        setSnack('대화를 지우지 못했어요. 잠시 후 다시 시도해 주세요');
        return;
      }
    }
    me.removeChat(c.id);
    setDeleting(null);
    setToast('대화를 삭제했어요');
  };

  const items = useMemo(
    () => chats.filter((c) => (filter === 'all' || c.kind === filter) && (!query.trim() || c.messages.some((m) => m.text.includes(query.trim())))),
    [chats, filter, query],
  );
  // 고정한 대화는 날짜와 상관없이 '고정됨'으로 맨 위에 모은다(최근에 고정한 것이 앞).
  const pinned = pinnedIds.map((id) => items.find((c) => c.id === id)).filter((c): c is SavedChat => !!c);
  const rest = items.filter((c) => !pinnedIds.includes(c.id));
  const groups = [...new Set(rest.map((c) => dayGroup(c.startedAt)))];
  const row = (c: SavedChat) => (
    <ChatRow
      key={c.id}
      chat={c}
      pinned={pinnedIds.includes(c.id)}
      onOpen={() => router.push(`/chat/${c.id}`)}
      onTogglePin={() => togglePin(c)}
      onDelete={() => setDeleting(c)}
      onLongPress={() => setMenuFor(c)}
    />
  );

  return (
    <Screen
      inTabs
      overlay={
        <>
          <StandaloneNav active="chat" />
          {!!toast && <Toast message={toast} />}
          <Snackbar message={snack} />
          {/* 길게 누르면 나오는 메뉴 (iOS 액션 시트) */}
          <IOSActionSheet
            open={!!menuFor}
            onClose={() => setMenuFor(null)}
            title={menuFor ? chatTitle(menuFor) : undefined}
            actions={[
              {
                label: menuFor && pinnedIds.includes(menuFor.id) ? '고정 해제' : '위에 고정',
                icon: <PinIcon size={20} color={IOS_ORANGE} off={!!menuFor && pinnedIds.includes(menuFor.id)} />,
                onPress: () => {
                  if (menuFor) togglePin(menuFor);
                  setMenuFor(null);
                },
              },
              {
                label: '대화 삭제',
                destructive: true,
                icon: <TrashIcon size={20} color={IOS_RED} />,
                onPress: () => {
                  setDeleting(menuFor);
                  setMenuFor(null);
                },
              },
            ]}
          />
          {/* 서버 세션까지 지우므로 한 번 더 묻는다. 다른 확인창과 같은 팝업 · 163×56 두 버튼. */}
          <Modal open={!!deleting} onClose={() => !del.isPending && setDeleting(null)}>
            <View>
              <Text className="text-[20px] font-bold text-ink">이 대화를 삭제할까요?</Text>
              <Text className="text-[14px] text-sub leading-[22px] mt-2">삭제한 대화는 되돌릴 수 없어요.</Text>
              <ButtonPair className="mt-6">
                <Button variant="gray" size="pair" onPress={() => setDeleting(null)} disabled={del.isPending}>
                  취소
                </Button>
                <Button variant="dangerSolid" size="pair" onPress={() => deleting && remove(deleting)} loading={del.isPending}>
                  삭제
                </Button>
              </ButtonPair>
            </View>
          </Modal>
        </>
      }
    >
      <View className="h-11 mt-2 shrink-0 flex-row items-center justify-center px-5">
        <View className="absolute left-5">
          <BackButton href="/chat" />
        </View>
        <Text accessibilityRole="header" className="text-[16px] font-bold text-ink">
          지난 대화
        </Text>
      </View>
      <View className="px-5 pt-3">
        <View className="flex-row items-center gap-2.5 h-[60px] rounded-2xl bg-page border border-line px-[18px]">
          <SearchIcon size={20} color={fg('#8A8A96')} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="대화 내용 검색"
            accessibilityLabel="대화 내용 검색"
            maxLength={MAX_TEXT_LENGTH}
            placeholderTextColor={fg('#A1A1AA')}
            selectionColor="#6367FF"
            cursorColor="#6367FF"
            returnKeyType="search"
            className="flex-1 p-0 text-[16px] text-ink"
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
              className={`h-[30px] px-3 rounded-full justify-center ${filter === f ? 'bg-ink' : 'bg-primary-soft'}`}
            >
              <Text className={`text-[12px] font-semibold ${filter === f ? 'text-page' : 'text-primary-pressed'}`}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View className="px-5 pb-4">
        {failed && <Text className="mt-4 text-[12px] text-sub">다른 기기에서 나눈 대화 일부를 불러오지 못했어요.</Text>}
        {pinned.length > 0 && (
          <View className="mt-5">
            <View className="flex-row items-center gap-1 mb-2.5 px-1">
              <PinIcon size={12} color={IOS_ORANGE} />
              <Text className="text-[12px] text-sub">고정됨</Text>
            </View>
            <View className="gap-2.5">{pinned.map(row)}</View>
          </View>
        )}
        {groups.map((g) => (
          <View key={g} className="mt-5">
            <Text className="tabular-nums text-[12px] text-sub mb-2.5 px-1">{g}</Text>
            <View className="gap-2.5">{rest.filter((c) => dayGroup(c.startedAt) === g).map(row)}</View>
          </View>
        ))}
        {items.length > 0 && <Text className="text-[12px] text-mute text-center mt-5">오른쪽으로 밀면 고정, 왼쪽으로 밀면 삭제할 수 있어요</Text>}
        {items.length === 0 && !loading && (
          <View className="items-center mt-20">
            <Text className="text-[16px] font-semibold text-ink">{chats.length === 0 ? '아직 마친 대화가 없어요' : '검색 결과가 없어요'}</Text>
            {chats.length === 0 && <Text className="text-[12px] text-sub mt-1.5">대화를 나누고 ‘대화 마치기’를 누르면 여기에 저장돼요</Text>}
          </View>
        )}
      </View>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(ChatHistoryScreen);
