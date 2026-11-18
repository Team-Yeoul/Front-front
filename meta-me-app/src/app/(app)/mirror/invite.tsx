import { useEffect, useState } from 'react';
import { Pressable, Share, View } from 'react-native';
import { useAuthStore } from '@/store';
import { useMe } from '@/hooks/useMe';
import { useGetMyAccount } from '@/entities/user';
import { useCreatePeerFeedbackInvitation, useListPeerFeedback } from '@/entities/peer-feedback';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, Toast } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';
import { SensitiveGate } from '@/components/SensitiveGate';

const OPEN_AT = 3;
const COLORS = ['#A9ABFF', '#FFD66B', '#8FD3B6', '#FFB0A8', '#B9D7FF'];

function timeAgo(iso?: string) {
  if (!iso) return '';
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`;
  return `${Math.floor(min / (60 * 24))}일 전`;
}

export default function MirrorInviteScreen() {
  return (
    <SensitiveGate>
      <MirrorInvite />
    </SensitiveGate>
  );
}

function MirrorInvite() {
  const token = useAuthStore((s) => s.accessToken);
  const me = useMe();
  // 닉네임은 가입한 기기에만 저장돼 있어, 없으면 계정 이름으로 대신한다.
  const { data: account, refetch: refetchAccount } = useGetMyAccount(!!token && !me.nickname);
  const accountName = (a?: typeof account) => a?.user.username || a?.user.email?.split('@')[0];
  const nickname = me.nickname || accountName(account);
  const { data: list } = useListPeerFeedback(undefined, !!token);
  const feedbacks = list?.feedbacks ?? [];
  const count = list?.total_elements ?? feedbacks.length;
  const createInvitation = useCreatePeerFeedbackInvitation();
  const [link, setLink] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  // 링크 하나에 한 명만 답할 수 있어, 공유할 때마다 새 초대 링크를 발급한다.
  const issueLink = async () => {
    // 계정 이름을 아직 못 받았으면 함께 받아 와, 이름 없는 링크(친구 화면에 '친구님')가 나가지 않게 한다.
    const [{ invite_url }, name] = await Promise.all([
      createInvitation.mutateAsync(),
      nickname || refetchAccount().then((r) => accountName(r.data)),
    ]);
    // invite_url은 {프론트 URL}/feedback/{token}이다. 친구는 웹에서 답하므로 서버가 준 웹 주소를 그대로 쓴다.
    // (웹은 개발 서버에서도 열리게 지금 보고 있는 주소로 다시 만들었지만, 앱에는 그런 주소가 없다.)
    const base = invite_url?.split('?')[0];
    const inviteToken = base?.split('/').pop();
    if (!base || !inviteToken) throw new Error('초대 링크가 비어 있어요');
    // 친구 화면에 내 이름이 보이도록 닉네임을 링크에 담는다.
    const url = `${base}${name ? `?n=${encodeURIComponent(name)}` : ''}`;
    setLink(url);
    return url;
  };

  // 웹은 클립보드에 복사했다. 앱은 클립보드 패키지가 없어 iOS 공유 시트로 보낸다(시트에서 '복사'도 고를 수 있다).
  const share = async () => {
    if (createInvitation.isPending) return;
    let url: string;
    try {
      url = await issueLink();
    } catch {
      // 발급 실패는 아래 안내 문구로 보여 준다.
      return;
    }
    try {
      const result = await Share.share({ message: url });
      if (result.action === Share.sharedAction) setToast(true);
    } catch {
      // 공유 시트를 못 띄우면 화면의 링크를 길게 눌러 직접 복사하게 둔다.
    }
  };

  return (
    <Screen footer={<Button onPress={share}>링크 공유하기</Button>} overlay={toast && <Toast message="초대 링크를 보냈어요" />}>
      <View className="px-5 pt-2 pb-6">
        <BackButton href="/main" />
        <Text className="font-mono text-[12px] tracking-[1.2px] text-sub mt-5">MIRROR · 타인의 시선</Text>
        <Text className="text-[26px] font-bold text-ink mt-2">남이 보는 나 모으기</Text>
        <Text className="text-[13px] text-sub leading-[21px] mt-2">친구 3명 이상이 답하면 비교 리포트가 열려요. 누가 무엇을 골랐는지는 보이지 않습니다.</Text>

        <View className="mt-6 rounded-3xl bg-primary px-5 py-5">
          <View className="flex-row justify-between">
            <Text className="text-[13px] text-white/75">응답 현황</Text>
            <Text className="text-[13px] text-white/75">링크마다 7일</Text>
          </View>
          <View className="flex-row items-end justify-between mt-4">
            <View className="flex-row items-baseline">
              <Text className="text-[40px] font-bold text-white leading-[40px]">{count}</Text>
              <Text className="text-[15px] text-white ml-2">명 응답</Text>
            </View>
            <View className="h-7 px-3 rounded-full bg-white/20 justify-center">
              <Text className="text-[12px] font-bold text-white">{count >= OPEN_AT ? '비교 리포트 열림' : `${OPEN_AT - count}명 더 모이면 열려요`}</Text>
            </View>
          </View>
          <Text className="text-[13px] text-white/85 mt-4">인원 제한 없이 계속 받을 수 있어요</Text>
        </View>

        <View className="mt-4 rounded-3xl bg-surface px-5 py-5">
          <Text className="text-[16px] font-bold text-ink">초대 링크</Text>
          <View className="mt-4 flex-row items-center justify-between gap-2 rounded-2xl bg-[#EDEDF2] pl-4 pr-2 h-14">
            <Text selectable numberOfLines={1} className={`flex-1 font-mono text-[14px] ${link ? 'text-[#48484F]' : 'text-mute'}`}>
              {link ?? '공유하면 새 링크가 만들어져요'}
            </Text>
            <Pressable
              onPress={share}
              disabled={createInvitation.isPending}
              accessibilityRole="button"
              className="h-9 px-3.5 rounded-xl bg-primary-soft justify-center active:opacity-70"
            >
              <Text className="text-[13px] font-semibold text-primary">{createInvitation.isPending ? '만드는 중' : '공유'}</Text>
            </Pressable>
          </View>
          {createInvitation.isError ? (
            <Text className="text-[12px] text-danger mt-3">링크를 만들지 못했어요. 다시 눌러 주세요.</Text>
          ) : (
            <Text className="text-[12px] text-sub mt-3 leading-[19px]">
              {'링크 하나에 친구 한 명이 답할 수 있어요. 친구마다 새로 공유해서 보내 주세요.\n로그인 없이 3분 안에 답할 수 있고, 링크는 7일 동안 유효해요.'}
            </Text>
          )}
        </View>

        <View className="mt-4 rounded-3xl bg-surface px-5 py-5">
          <Text className="text-[16px] font-bold text-ink">응답한 사람</Text>
          {count === 0 && <Text className="text-[13px] text-sub mt-3">아직 답한 친구가 없어요. 링크를 보내 보세요.</Text>}
          <View className="gap-2.5 mt-4">
            {/* 누가 답했는지는 공개하지 않아, 답한 순서로만 보여준다. */}
            {feedbacks.map((f, i) => (
              <View key={f.feedback_id} className="flex-row items-center gap-3 rounded-2xl bg-[#EDEDF2] px-4 h-14">
                <View className="w-7 h-7 rounded-full" style={{ backgroundColor: COLORS[(count - i - 1) % COLORS.length] }} />
                <Text className="flex-1 text-[14px] text-ink">익명 친구 {count - i}</Text>
                <Text className="text-[12px] text-sub">{timeAgo(f.created_at)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}
