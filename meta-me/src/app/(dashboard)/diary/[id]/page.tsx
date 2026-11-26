'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useDeleteDailyRecord, useGetDailyRecord } from '@/entities/diary';
import { useRecordLatestMirror } from '@/entities/objective';
import { useAuthStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, ButtonPair, TopBar, goBack } from '@/components/ui/primitives';
import { Modal, useEscape } from '@/components/ui/overlays';
import { Portal, Pressable, View } from '@/components/ui/rn';
import { Skeleton, StatusView, useOnline } from '@/components/ui/states';
import { Text } from '@/components/ui/Text';
import { toDateKey } from '@/lib/date';
import { router } from '@/lib/router';
import { useMe } from '@/hooks/useMe';
import { useTheme } from '@/lib/theme';
import { withSensitiveGate } from '@/components/SensitiveGate';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

const MENU_ICON = {
  edit: 'M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3ZM13.5 7.5l3 3',
  share: 'M12 15V4M8 8l4-4 4 4M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
};

const toEdit = (id: string) => router.push(`/diary/write?edit=${encodeURIComponent(id)}`);

/** 앱 Share.share 자리: 공유 시트가 있으면 열고, 없으면 글을 클립보드에 복사한다. */
async function shareText(title: string, message: string) {
  if (typeof navigator.share === 'function') {
    await navigator.share({ title, text: message });
    return;
  }
  await navigator.clipboard?.writeText(message);
}

/** 기록 상세 (13b) · 더보기 메뉴 (13b2) */
function DiaryDetailScreen() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? decodeURIComponent(params.id) : '';
  const { fg } = useTheme();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data, isError, refetch, isFetching } = useGetDailyRecord(id, !!accessToken);
  const online = useOnline();
  // 이 기록의 객관화 중 가장 최근 것(목록을 넘겨 가며 찾는다).
  const { data: latestMirror } = useRecordLatestMirror(id, !!accessToken);
  // 기록을 수정한 뒤라면 그보다 나중에 만든 것만 쓴다(수정 전 글 기준 문장은 버린다).
  // 서버 시각은 시간대 표기가 달라도 같은 순간을 비교하도록 문자열이 아닌 시각 값으로 비교한다.
  const { recordEditedAt } = useMe();
  const editedAt = recordEditedAt?.[id];
  const mirror = latestMirror && (!editedAt || Date.parse(latestMirror.created_at) > Date.parse(editedAt)) ? latestMirror : undefined;
  const del = useDeleteDailyRecord();
  const [menu, setMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  useEscape(menu, () => setMenu(false));

  const q = data?.questions?.[0];
  const created = data ? new Date(data.record.recorded_at) : null;
  const detail =
    q && created
      ? {
          title: (q.scene_description || q.user_answer || '기록').slice(0, 20),
          date: toDateKey(created).replaceAll('-', '.'),
          meta: `${WEEK[created.getDay()]}요일 · ${String(created.getHours()).padStart(2, '0')}:${String(created.getMinutes()).padStart(2, '0')} 작성`,
          original: q.user_answer,
          // 객관화를 거치지 않은 기록은 장면 묘사를 대신 보여준다.
          objectified: mirror?.objective_fact || q.scene_description,
          patterns: (q.emotion_tag ?? '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }
      : null;

  const remove = async () => {
    if (del.isPending) return;
    setDeleteError('');
    try {
      await del.mutateAsync(id);
    } catch {
      setConfirmDelete(false);
      setDeleteError('기록을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setConfirmDelete(false);
    // 지운 기록 화면을 기록에 남기지 않도록 다이어리 탭으로 바꿔 간다.
    router.dismissTo('/diary');
  };

  const share = async () => {
    setMenu(false);
    if (!detail) return;
    try {
      await shareText('metame 기록', `${detail.date} ${detail.title}\n\n${detail.objectified ?? detail.original}`);
    } catch {
      // 공유를 취소한 경우는 무시
    }
  };

  if (!detail) {
    // 응답은 왔는데 질문이 없는 기록이면 '불러오는 중'에 멈추지 않게 따로 안내한다.
    const failed = !data && (!online || isError);
    return (
      <Screen>
        <TopBar backHref="/diary" />
        {failed ? (
          <StatusView
            kind={online ? 'error' : 'offline'}
            title={online ? '기록을 불러오지 못했어요' : undefined}
            onRetry={() => refetch()}
            retrying={isFetching}
            className="pt-40"
          />
        ) : data ? (
          <Text className="text-center text-[14px] text-sub mt-24">표시할 내용이 없는 기록이에요.</Text>
        ) : (
          <View className="px-5 pt-4" accessibilityLabel="기록 불러오는 중">
            <Skeleton className="w-1/2 h-6" />
            <Skeleton className="w-32 h-3.5 mt-2.5" />
            <Skeleton className="h-[120px] mt-6 rounded-[20px]" />
            <Skeleton className="h-[120px] mt-5 rounded-[20px]" />
          </View>
        )}
      </Screen>
    );
  }

  const menuItems: {
    label: string;
    icon: string;
    onPress: () => void;
    danger?: boolean;
  }[] = [
    {
      label: '수정하기',
      icon: MENU_ICON.edit,
      onPress: () => {
        setMenu(false);
        toEdit(id);
      },
    },
    { label: '공유하기', icon: MENU_ICON.share, onPress: share },
    {
      label: '삭제',
      icon: MENU_ICON.trash,
      danger: true,
      onPress: () => {
        setMenu(false);
        setConfirmDelete(true);
      },
    },
  ];

  return (
    <Screen
      overlay={
        <>
          {menu && (
            <Portal>
              <View className="absolute inset-0 z-50 bg-[#11111E]/62" style={{ animation: 'fade-in 200ms ease-out' }}>
                <Pressable className="flex-1" onPress={() => setMenu(false)} accessibilityLabel="메뉴 닫기" tabIndex={-1} />
              </View>
              <View
                accessibilityRole="menu"
                className="absolute z-50 right-5 w-[228px] rounded-[20px] bg-page overflow-hidden"
                style={{
                  top: 'calc(var(--safe-top) + 62px)',
                  boxShadow: '0 12px 40px rgba(20,20,40,0.2)',
                  transformOrigin: 'center',
                  animation: 'zoom-in 200ms ease-out',
                }}
              >
                {menuItems.map((it, i) => {
                  const color = it.danger ? '#E5484D' : fg('#1A1A1E');
                  return (
                    <Pressable
                      key={it.label}
                      onPress={it.onPress}
                      accessibilityRole="menuitem"
                      className={`h-14 shrink-0 px-5 flex-row items-center justify-between active:bg-surface ${
                        it.danger ? 'border-t-[6px] border-surface-2' : i > 0 ? 'border-t border-surface-2' : ''
                      }`}
                    >
                      <Text className="text-[16px] font-medium" style={{ color }}>
                        {it.label}
                      </Text>
                      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d={it.icon} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Pressable>
                  );
                })}
              </View>
            </Portal>
          )}
          <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
            <Text className="text-[16px] font-bold text-ink text-center">이 기록을 삭제할까요?</Text>
            <Text className="text-[12px] text-sub text-center mt-2">삭제한 기록은 되돌릴 수 없어요.</Text>
            <ButtonPair className="mt-5">
              <Button variant="gray" size="pair" onPress={() => setConfirmDelete(false)}>
                취소
              </Button>
              <Button variant="danger" size="pair" onPress={remove} loading={del.isPending}>
                삭제
              </Button>
            </ButtonPair>
          </Modal>
        </>
      }
      footer={
        <View className="gap-2.5">
          {!!deleteError && <Text className="text-[12px] text-danger text-center">{deleteError}</Text>}
          <ButtonPair>
            <Button variant="danger" size="pair" onPress={() => setConfirmDelete(true)}>
              삭제
            </Button>
            <Button variant="gray" size="pair" onPress={() => toEdit(id)}>
              수정
            </Button>
          </ButtonPair>
        </View>
      }
    >
      <View className="h-11 mt-2 flex-row items-center justify-between px-5">
        <BackButton onPress={() => goBack('/diary')} />
        <View pointerEvents="none" className="absolute left-0 right-0 items-center">
          <Text accessibilityRole="header" className="tabular-nums text-[16px] font-semibold text-ink">
            {detail.date}
          </Text>
        </View>
        <Pressable
          onPress={() => setMenu(true)}
          accessibilityRole="button"
          accessibilityLabel="더보기"
          accessibilityState={{ expanded: menu }}
          className="w-10 h-10 shrink-0 rounded-xl bg-surface items-center justify-center"
        >
          <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden>
            <circle cx="5" cy="12" r="1.8" fill="#6367FF" />
            <circle cx="12" cy="12" r="1.8" fill="#6367FF" />
            <circle cx="19" cy="12" r="1.8" fill="#6367FF" />
          </svg>
        </Pressable>
      </View>
      <View className="px-5 pt-4 pb-6">
        <Text className="text-[24px] font-bold tracking-[-0.24px] text-ink">{detail.title}</Text>
        <Text className="tabular-nums text-[12px] text-mute mt-1">{detail.meta}</Text>

        <View className="mt-6 rounded-[20px] bg-surface px-5 py-5">
          <Text className="text-[12px] font-semibold text-sub">내가 쓴 문장</Text>
          <Text className="text-[16px] leading-[27px] text-ink mt-2.5">{detail.original}</Text>
        </View>
        <View className="mt-5 rounded-[20px] bg-primary-soft px-5 py-5">
          <Text className="text-[12px] font-semibold text-primary">객관화된 문장</Text>
          <Text className="text-[16px] leading-[27px] text-ink mt-2.5">{detail.objectified}</Text>
        </View>

        {detail.patterns.length > 0 && (
          <>
            <Text accessibilityRole="header" className="text-[16px] font-bold text-ink mt-6">
              감지된 패턴
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-2.5">
              {detail.patterns.map((p) => (
                <View key={p} className="h-8 px-3.5 rounded-full bg-primary-soft justify-center">
                  <Text className="text-[12px] font-semibold text-primary-pressed">{p}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(DiaryDetailScreen);
