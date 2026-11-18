import { Children, useEffect, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore, useLocalStore } from '@/store';
import {
  useGetMyAccount,
  useGetNotificationSettings,
  useLogout,
  useUpdateNotificationSettings,
  useWithdrawAccount,
} from '@/entities/user';
import type { NotificationSetting } from '@/entities/user';
import { Screen } from '@/components/ui/Screen';
import { Button, Toast, Toggle, TopBar } from '@/components/ui/primitives';
import { ChevronRight } from '@/components/ui/icons';
import { Modal } from '@/components/ui/overlays';
import { Text } from '@/components/ui/Text';
import { useSensitiveConsent } from '@/hooks/useSensitiveConsent';

function Group({ title, children }: { title: string; children: ReactNode }) {
  // 웹의 divide-y: 두 번째 행부터 위쪽 구분선을 긋는다.
  const rows = Children.toArray(children);
  return (
    <View className="mt-5">
      <Text className="text-[12px] font-semibold text-sub px-1 mb-2">{title}</Text>
      <View className="rounded-2xl border border-line bg-white">
        {rows.map((row, i) => (
          <View key={i} className={i > 0 ? 'border-t border-line' : ''}>
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}

function Row({ label, value, right, onPress }: { label: string; value?: string; right?: ReactNode; onPress?: () => void }) {
  const body = (
    <>
      <Text className="text-[15px] text-ink">{label}</Text>
      {right ?? (
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[14px] text-sub">{value}</Text>
          {/* 누를 수 있는 행에만 화살표를 붙인다. */}
          {onPress && <ChevronRight size={15} />}
        </View>
      )}
    </>
  );
  const cls = 'flex-row items-center justify-between h-[52px] px-4';
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" className={`${cls} active:opacity-60`}>
      {body}
    </Pressable>
  ) : (
    <View className={cls}>{body}</View>
  );
}

export default function SettingsScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const removeLocal = useLocalStore((s) => s.remove);
  const { data: account } = useGetMyAccount(!!accessToken);
  const { data: noti } = useGetNotificationSettings(!!accessToken);
  const updateNoti = useUpdateNotificationSettings();
  const logout = useLogout();
  const withdraw = useWithdrawAccount();
  const alarm = noti?.push_enabled === false ? '꺼짐' : noti?.daily_question_time ? `매일 ${noti.daily_question_time}` : '';
  const consent = useSensitiveConsent();
  const [confirm, setConfirm] = useState<'logout' | 'withdraw' | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [toast, setToast] = useState('');
  const busy = logout.isPending || withdraw.isPending;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // 알림 설정(push_enabled · marketing_consent)은 서버에 저장한다.
  const setNoti = (patch: Partial<NotificationSetting>) => {
    if (!noti) return;
    updateNoti.mutate({ ...noti, ...patch }, { onError: () => setToast('알림 설정을 바꾸지 못했어요') });
  };

  const run = async () => {
    if (busy) return;
    if (confirm === 'withdraw') {
      // 탈퇴는 서버에서 실패하면 계정이 남아 있으므로 세션을 유지하고 다시 시도하게 한다.
      try {
        await withdraw.mutateAsync();
      } catch {
        setConfirm(null);
        setToast('탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요');
        return;
      }
      if (userId) removeLocal(userId);
    } else if (accessToken) {
      try {
        await logout.mutateAsync();
      } catch {
        // 로그아웃은 서버 실패와 관계없이 로컬 세션을 정리
      }
    }
    // 화면이 내려가기 전에 RN Modal을 닫아 둔다.
    setConfirm(null);
    // 토큰을 지우면 루트 Stack.Protected가 (app) 화면들을 걷어 낸다. 시작 화면으로 보낸다.
    clearAuth();
    router.replace('/');
  };

  return (
    <Screen
      overlay={
        <>
          {!!toast && <Toast message={toast} />}
          {/* 요청이 진행 중이면 닫아도 로그아웃·탈퇴는 계속되므로, 그동안은 닫을 수 없게 한다. */}
          <Modal open={!!confirm} onClose={() => !busy && setConfirm(null)}>
            <Text className="text-[17px] font-bold text-ink text-center">{confirm === 'withdraw' ? '정말 탈퇴할까요?' : '로그아웃할까요?'}</Text>
            <Text className="text-[13px] text-sub text-center mt-2">
              {confirm === 'withdraw' ? '기록과 도감이 모두 삭제되고 되돌릴 수 없어요.' : '언제든 다시 로그인할 수 있어요.'}
            </Text>
            <View className="flex-row gap-2 mt-5">
              <View className="flex-1">
                <Button variant="gray" onPress={() => setConfirm(null)} disabled={busy}>
                  취소
                </Button>
              </View>
              <View className="flex-1">
                <Button variant={confirm === 'withdraw' ? 'danger' : 'primary'} onPress={run} disabled={busy}>
                  {busy ? '처리 중...' : confirm === 'withdraw' ? '탈퇴하기' : '로그아웃'}
                </Button>
              </View>
            </View>
          </Modal>
          <Modal open={revoking} onClose={() => setRevoking(false)}>
            <Text className="text-[17px] font-bold text-ink text-center">민감정보 처리 동의를 철회할까요?</Text>
            <Text className="text-[13px] text-sub text-center mt-2 leading-[21px]">
              {'철회하면 기록 쓰기, AI 분석·리포트, AI 대화를 쓸 수 없어요.\n다시 동의하면 이어서 쓸 수 있어요.'}
            </Text>
            <View className="flex-row gap-2 mt-5">
              <View className="flex-1">
                <Button variant="gray" onPress={() => setRevoking(false)}>
                  취소
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  variant="danger"
                  onPress={() => {
                    consent.revoke();
                    setRevoking(false);
                    setToast('민감정보 처리 동의를 철회했어요');
                  }}
                >
                  철회하기
                </Button>
              </View>
            </View>
          </Modal>
        </>
      }
    >
      <TopBar title="설정" />
      <View className="px-5 pb-8">
        <Group title="계정">
          <Row label="이메일" value={account?.user.email ?? ''} />
          <Row label="연결된 계정" value="이메일" />
        </Group>
        <Group title="알림">
          <Row label="기록 리마인더" value={alarm} onPress={() => router.push('/notifications?from=settings')} />
          <Row label="푸시 알림" right={<Toggle on={noti?.push_enabled ?? true} disabled={!noti} onChange={(v) => setNoti({ push_enabled: v })} />} />
          <Row
            label="마케팅 정보 수신"
            right={<Toggle on={noti?.marketing_consent ?? false} disabled={!noti} onChange={(v) => setNoti({ marketing_consent: v })} />}
          />
        </Group>
        <Group title="개인정보">
          <Row label="민감정보 처리 동의" right={<Toggle on={consent.agreed} onChange={(v) => (v ? consent.agree() : setRevoking(true))} />} />
          <Row label="동의 내용 보기" onPress={() => router.push('/settings/terms/sensitive')} />
        </Group>
        <Group title="데이터">
          <Row label="객관화 기록 보관" value="12개월" />
        </Group>
        <Group title="정보">
          <Row label="이용약관" onPress={() => router.push('/settings/terms/service')} />
          <Row label="개인정보 처리방침" onPress={() => router.push('/settings/terms/privacy')} />
          <Row label="버전" value="1.0.3" />
        </Group>
        <View className="flex-row gap-5 px-1 mt-6">
          <Pressable onPress={() => setConfirm('logout')} accessibilityRole="button" hitSlop={6}>
            <Text className="text-[15px] text-danger">로그아웃</Text>
          </Pressable>
          <Pressable onPress={() => setConfirm('withdraw')} accessibilityRole="button" hitSlop={6}>
            <Text className="text-[15px] text-danger">회원탈퇴</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
