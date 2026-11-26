'use client';

import { useEffect, useState } from 'react';
import { router } from '@/lib/router';
import { Pressable, View } from '@/components/ui/rn';
import { useAuthStore } from '@/store';
import { useMe } from '@/hooks/useMe';
import { useGetMyAccount } from '@/entities/user';
import { useCreatePeerFeedbackInvitation, useListPeerFeedback } from '@/entities/peer-feedback';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, Toast } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';
import { withSensitiveGate } from '@/components/SensitiveGate';

const OPEN_AT = 3;
const COLORS = ['#C9CAFF', '#FFE066', '#C9CAD3', '#FFB0A8', '#B9D7FF'];

function timeAgo(iso?: string) {
  if (!iso) return '';
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`;
  if (min < 60 * 48) return '어제';
  return `${Math.floor(min / (60 * 24))}일 전`;
}

function MirrorInviteScreen() {
  const token = useAuthStore((s) => s.accessToken);
  const me = useMe();
  // 닉네임은 가입한 기기에만 저장돼 있어, 없으면 계정 이름으로 대신한다.
  const { data: account, refetch: refetchAccount } = useGetMyAccount(!!token && !me.nickname);
  const accountName = (a?: typeof account) => a?.user?.username || a?.user?.email?.split('@')[0];
  const nickname = me.nickname || accountName(account);
  const { data: list } = useListPeerFeedback(undefined, !!token);
  const feedbacks = list?.feedbacks ?? [];
  const count = list?.total_elements ?? feedbacks.length;
  const open = count >= OPEN_AT;
  const createInvitation = useCreatePeerFeedbackInvitation();
  const [link, setLink] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  // 링크 하나에 한 명만 답할 수 있어, 복사할 때마다 새 초대 링크를 발급한다.
  const issueLink = async () => {
    // 계정 이름을 아직 못 받았으면 함께 받아 와, 이름 없는 링크(친구 화면에 '친구님')가 나가지 않게 한다.
    const [{ invite_url }, name] = await Promise.all([
      createInvitation.mutateAsync(),
      nickname || refetchAccount().then((r) => accountName(r.data)),
    ]);
    // invite_url은 {프론트 URL}/feedback/{token}이다. 웹은 개발 서버에서도 열리게 지금 보고 있는 주소로 다시 만든다.
    const inviteToken = invite_url?.split('?')[0].split('/').pop();
    if (!inviteToken) throw new Error('초대 링크가 비어 있어요');
    // 친구 화면에 내 이름이 보이도록 닉네임을 링크에 담는다.
    const url = `${window.location.origin}/feedback/${inviteToken}${name ? `?n=${encodeURIComponent(name)}` : ''}`;
    setLink(url);
    return url;
  };

  const copy = async () => {
    if (createInvitation.isPending) return;
    const pending = issueLink();
    // 발급 실패는 아래 안내 문구로 보여 준다.
    pending.catch(() => {});
    try {
      // Safari는 비동기 응답을 기다린 뒤의 복사를 막아, 누른 순간에 Promise를 넘긴다.
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': pending.then((u) => new Blob([u], { type: 'text/plain' })) })]);
      setToast(true);
    } catch {
      try {
        await navigator.clipboard.writeText(await pending);
        setToast(true);
      } catch {
        // 복사하지 못하면 화면의 링크를 직접 골라 복사하게 둔다.
      }
    }
  };

  return (
    <Screen footer={<Button onPress={copy}>링크 복사하기</Button>} overlay={toast && <Toast message="초대 링크를 복사했어요" />}>
      <View className="px-5 pt-2 pb-6">
        <View className="flex-row">
          <BackButton href="/main" />
        </View>
        <Text accessibilityRole="header" className="text-[24px] font-bold text-ink mt-6">
          남이 보는 나 모으기
        </Text>
        <Text className="text-[14px] text-sub leading-[22px] mt-2">친구 3명 이상이 답하면 비교 리포트가 열려요. 누가 무엇을 골랐는지는 보이지 않습니다.</Text>

        <View className="mt-6 rounded-[24px] bg-primary overflow-hidden">
          <View className="px-5 pt-5 pb-5">
            <View className="flex-row justify-between">
              <Text className="text-[12px] text-white/75">응답 현황</Text>
              <Text className="text-[12px] text-white/75">링크마다 7일</Text>
            </View>
            <View className="flex-row items-end justify-between mt-4">
              <View className="flex-row items-baseline">
                <Text className="text-[24px] font-bold text-white tabular-nums">{count}</Text>
                <Text className="text-[16px] text-white/80 ml-2">명 응답</Text>
              </View>
              <View className={`h-7 px-3 rounded-full justify-center ${open ? 'bg-yellow' : 'bg-white/20'}`}>
                <Text className={`text-[12px] font-bold ${open ? 'text-[#1A1A1E]' : 'text-white'}`}>{open ? '비교 리포트 열림' : `${OPEN_AT - count}명 더 모이면 열려요`}</Text>
              </View>
            </View>
          </View>
          {open && (
            <Pressable
              onPress={() => router.push('/mirror/results')}
              accessibilityRole="link"
              className="flex-row items-center justify-between border-t border-white/20 px-5 h-[54px] active:bg-white/10"
            >
              <Text className="text-[16px] font-bold text-white">친구들의 답 보기</Text>
              <Text className="text-[16px] font-bold text-white">›</Text>
            </Pressable>
          )}
        </View>

        <Text accessibilityRole="header" className="text-[16px] font-bold text-ink mt-7">
          초대 링크
        </Text>
        <View className="mt-3 flex-row items-center justify-between gap-2 rounded-2xl bg-surface pl-4 pr-2 h-14">
          <Text numberOfLines={1} className={`flex-1 min-w-0 select-all tabular-nums text-[14px] ${link ? 'text-body' : 'text-mute'}`}>
            {link ?? '복사하면 새 링크가 만들어져요'}
          </Text>
          <Pressable
            onPress={copy}
            disabled={createInvitation.isPending}
            accessibilityRole="button"
            className="h-9 px-4 rounded-full bg-primary justify-center shrink-0 active:opacity-80"
          >
            <Text className="text-[12px] font-semibold text-white">{createInvitation.isPending ? '만드는 중' : '복사'}</Text>
          </Pressable>
        </View>
        {createInvitation.isError ? (
          <Text className="text-[12px] text-danger mt-2.5">링크를 만들지 못했어요. 다시 눌러 주세요.</Text>
        ) : (
          <Text className="text-[12px] text-sub mt-2.5 leading-[19px]">링크 하나에 친구 한 명이 답할 수 있어요. 로그인 없이 3분 안에 답할 수 있어요.</Text>
        )}

        <Text accessibilityRole="header" className="text-[16px] font-bold text-ink mt-7">
          응답한 사람
        </Text>
        {count === 0 && <Text className="text-[12px] text-sub mt-3">아직 답한 친구가 없어요. 링크를 보내 보세요.</Text>}
        <View className="gap-2.5 mt-3">
          {/* 누가 답했는지는 공개하지 않아, 답한 순서로만 보여준다. */}
          {feedbacks.map((f, i) => (
            <View key={f.feedback_id} className="flex-row items-center gap-3 rounded-2xl bg-surface px-4 h-[52px]">
              <View className="w-7 h-7 shrink-0 rounded-full" style={{ backgroundColor: COLORS[(count - i - 1) % COLORS.length] }} />
              <Text className="flex-1 text-[16px] text-ink">익명 {count - i}</Text>
              <Text className="text-[12px] text-sub">{timeAgo(f.created_at)}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(MirrorInviteScreen);
