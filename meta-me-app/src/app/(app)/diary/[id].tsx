import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDeleteDailyRecord, useGetDailyRecord } from '@/entities/diary';
import { useAuthStore } from '@/store';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { Button, TopBar } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlays';
import { Text } from '@/components/ui/Text';
import { toDateKey } from '@/lib/date';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

function DiaryDetail() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data, isError } = useGetDailyRecord(id, !!accessToken);
  const del = useDeleteDailyRecord();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const q = data?.questions?.[0];
  const created = data ? new Date(data.record.recorded_at) : null;
  const detail =
    q && created
      ? {
          title: (q.scene_description || q.user_answer || '기록').slice(0, 20),
          date: toDateKey(created).replaceAll('-', '.'),
          meta: `${WEEK[created.getDay()]}요일 · ${String(created.getHours()).padStart(2, '0')}:${String(created.getMinutes()).padStart(2, '0')} 작성`,
          original: q.user_answer,
          // 객관화 문장 API가 기록 상세에 아직 연결되지 않아 장면 묘사를 대신 보여준다.
          objectified: q.scene_description,
          patterns: q.emotion_tag.split(',').map((t) => t.trim()).filter(Boolean),
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
    // 웹은 /diary로 push했다. 앱은 지운 기록 화면을 스택에 남기지 않도록 다이어리 탭까지 되돌아간다.
    router.dismissTo('/diary');
  };

  if (!detail) {
    // 응답은 왔는데 질문이 없는 기록이면 '불러오는 중'에 멈추지 않게 따로 안내한다.
    const message = isError ? '기록을 불러오지 못했어요.' : data ? '표시할 내용이 없는 기록이에요.' : '불러오는 중...';
    return (
      <Screen>
        <TopBar backHref="/diary" />
        <Text className="text-center text-[14px] text-sub mt-24">{message}</Text>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View className="gap-2.5">
          {!!deleteError && <Text className="text-[13px] text-danger text-center">{deleteError}</Text>}
          <View className="flex-row gap-2.5">
            <Button variant="danger" className="flex-1" onPress={() => setConfirmDelete(true)}>
              삭제
            </Button>
            {/* /diary/write는 쿼리(edit)로 수정 모드를 고른다. */}
            <Button variant="gray" className="flex-1" onPress={() => router.push(`/diary/write?edit=${encodeURIComponent(id)}`)}>
              수정
            </Button>
          </View>
        </View>
      }
    >
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <Text className="text-[17px] font-bold text-ink text-center">이 기록을 삭제할까요?</Text>
        <Text className="text-[13px] text-sub text-center mt-2">삭제한 기록은 되돌릴 수 없어요.</Text>
        <View className="flex-row gap-2 mt-5">
          <Button variant="gray" className="flex-1" onPress={() => setConfirmDelete(false)}>
            취소
          </Button>
          <Button variant="danger" className="flex-1" onPress={remove} disabled={del.isPending}>
            {del.isPending ? '삭제 중...' : '삭제'}
          </Button>
        </View>
      </Modal>

      <TopBar title={detail.date} backHref="/diary" right={<Text className="text-[18px] text-primary tracking-[1.8px]">···</Text>} />
      <View className="px-5 pt-3 pb-6">
        <Text className="text-[24px] font-bold text-ink">{detail.title}</Text>
        <Text className="font-mono text-[13px] text-sub mt-1.5">{detail.meta}</Text>

        <View className="mt-6 rounded-2xl bg-card border border-line px-5 py-4">
          <Text className="text-[12px] font-semibold text-sub">내가 쓴 문장</Text>
          <Text className="text-[15px] text-ink leading-[26px] mt-2">{detail.original}</Text>
        </View>
        <View className="mt-4 rounded-2xl bg-primary-soft px-5 py-4">
          <Text className="text-[12px] font-semibold text-primary">객관화된 문장</Text>
          <Text className="text-[15px] text-ink leading-[26px] mt-2">{detail.objectified}</Text>
        </View>

        <Text className="text-[15px] font-bold text-ink mt-6">감지된 패턴</Text>
        <View className="flex-row flex-wrap gap-2 mt-2.5">
          {detail.patterns.map((p) => (
            <View key={p} className="h-8 px-3.5 rounded-full bg-primary-soft justify-center">
              <Text className="text-[13px] font-semibold text-primary">{p}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

export default function DiaryDetailScreen() {
  return (
    <SensitiveGate>
      <DiaryDetail />
    </SensitiveGate>
  );
}
