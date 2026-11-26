'use client';

import { useEffect, useState } from 'react';
import { router } from '@/lib/router';
import { useAuthStore } from '@/store';
import { useGetMyAccount, useGetNotificationSettings, useLogout, useUpdateNotificationSettings } from '@/entities/user';
import type { NotificationSetting } from '@/entities/user';
import { Button, ButtonPair, Snackbar, Toast, Toggle } from '@/components/ui/primitives';
import { SettingsGroup as Group, SettingsRow as Row, SettingsShell, ThemeCard } from '@/components/ui/settings';
import { Modal } from '@/components/ui/overlays';
import { View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { useMe } from '@/hooks/useMe';
import { useSensitiveConsent } from '@/hooks/useSensitiveConsent';
import { APP_VERSION } from '@/lib/appInfo';

/** 설정 (13j) */
export default function SettingsScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { nickname } = useMe();
  const { data: account } = useGetMyAccount(!!accessToken);
  const { data: noti } = useGetNotificationSettings(!!accessToken);
  const updateNoti = useUpdateNotificationSettings();
  const logout = useLogout();
  const alarm = noti?.push_enabled === false ? '꺼짐' : noti?.daily_question_time ? `매일 ${noti.daily_question_time}` : '';
  const [confirm, setConfirm] = useState(false);
  // 민감정보 처리 동의. 서버에 저장하고 기기(계정별)에도 남긴다. 철회하면 기록·리포트·AI 대화 화면이 동의 화면으로 바뀐다.
  const consent = useSensitiveConsent();
  const [revoking, setRevoking] = useState(false);
  const [agreeing, setAgreeing] = useState(false);
  // 동의는 서버에 저장된 뒤에 켜진다. 저장하는 동안은 토글을 막고, 실패하면 알려 준다.
  const agreeConsent = async () => {
    if (agreeing) return;
    setAgreeing(true);
    try {
      await consent.agree();
    } catch {
      setSnack('동의를 저장하지 못했어요. 다시 시도해 주세요');
    } finally {
      setAgreeing(false);
    }
  };
  // 성공 확인은 토스트(제자리 Fade), 실패 안내는 스낵바(아래에서 올라옴)
  const [toast, setToast] = useState('');
  const [snack, setSnack] = useState('');
  const busy = logout.isPending;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!snack) return;
    const t = setTimeout(() => setSnack(''), 3500);
    return () => clearTimeout(t);
  }, [snack]);

  // 알림 설정(push_enabled · marketing_consent)은 서버에 저장한다.
  const setNoti = (patch: Partial<NotificationSetting>) => {
    if (!noti) return;
    updateNoti.mutate({ ...noti, ...patch }, { onError: () => setSnack('알림 설정을 바꾸지 못했어요') });
  };

  const run = async () => {
    if (busy) return;
    if (accessToken) {
      try {
        await logout.mutateAsync();
      } catch {
        // 로그아웃은 서버 실패와 관계없이 로컬 세션을 정리
      }
    }
    // 화면이 내려가기 전에 팝업을 닫아 둔다.
    setConfirm(false);
    // 토큰을 지우고 시작 화면으로 보낸다.
    clearAuth();
    router.replace('/');
  };

  return (
    <SettingsShell
      title="설정"
      sub="메타미를 내 방식대로 맞춰보세요"
      backHref="/mypage"
      overlay={
        <>
          {!!toast && <Toast message={toast} />}
          <Snackbar message={snack} />
          {/* 요청이 진행 중이면 닫아도 로그아웃은 계속되므로, 그동안은 닫을 수 없게 한다. (17b) */}
          <Modal open={confirm} onClose={() => !busy && setConfirm(false)}>
            <View>
              <Text className="text-[20px] font-bold text-ink">로그아웃할까요?</Text>
              <Text className="text-[14px] text-sub leading-[22px] mt-2">기록은 계정에 그대로 남아요. 다시 로그인하면 이어서 쓸 수 있어요.</Text>
              <ButtonPair className="mt-6">
                <Button variant="gray" size="pair" onPress={() => setConfirm(false)} disabled={busy}>
                  취소
                </Button>
                <Button size="pair" onPress={run} loading={busy}>
                  로그아웃
                </Button>
              </ButtonPair>
            </View>
          </Modal>
          <Modal open={revoking} onClose={() => setRevoking(false)}>
            <View>
              <Text className="text-[20px] font-bold text-ink">민감정보 처리 동의를 철회할까요?</Text>
              <Text className="text-[14px] text-sub leading-[22px] mt-2">철회하면 기록 쓰기, AI 분석·리포트, AI 대화를 쓸 수 없어요. 다시 동의하면 이어서 쓸 수 있어요.</Text>
              <ButtonPair className="mt-6">
                <Button variant="gray" size="pair" onPress={() => setRevoking(false)}>
                  취소
                </Button>
                <Button
                  variant="dangerSolid"
                  size="pair"
                  onPress={() => {
                    consent.revoke();
                    setRevoking(false);
                    setToast('민감정보 처리 동의를 철회했어요');
                  }}
                >
                  철회하기
                </Button>
              </ButtonPair>
            </View>
          </Modal>
        </>
      }
    >
      <ThemeCard />
      <Group title="계정">
        <Row icon="user" label="프로필 편집" sub={nickname || account?.user?.username || '이름을 정해 주세요'} onPress={() => router.push('/settings/profile')} />
        <Row icon="mail" label="이메일" sub={account?.user?.email ?? ''} onPress={() => router.push('/settings/email')} />
        <Row icon="link" label="연결된 계정" sub="이메일 로그인" />
      </Group>
      <Group title="알림">
        <Row
          icon="bell"
          label="알림 받기"
          sub="기록 · 친구 응답 · 리포트 소식을 한 번에"
          right={<Toggle label="알림 받기" on={noti?.push_enabled ?? true} disabled={!noti} onChange={(v) => setNoti({ push_enabled: v })} />}
        />
        <Row icon="clock" label="기록 리마인더" sub={alarm || '설정 안 함'} onPress={() => router.push('/notifications?from=settings')} />
        <Row
          icon="megaphone"
          label="마케팅 정보 수신"
          right={<Toggle label="마케팅 정보 수신" on={noti?.marketing_consent ?? false} disabled={!noti} onChange={(v) => setNoti({ marketing_consent: v })} />}
        />
      </Group>
      <Group title="개인정보">
        {/* 처리방침·약관에 적힌 철회 경로(설정 > 개인정보 > 민감정보 처리 동의). 끌 때는 확인을 받는다. */}
        <Row
          icon="shield"
          label="민감정보 처리 동의"
          sub="기록·AI 대화 저장과 분석"
          right={<Toggle label="민감정보 처리 동의" on={consent.agreed} disabled={agreeing} onChange={(v) => (v ? void agreeConsent() : setRevoking(true))} />}
        />
        <Row icon="doc" label="민감정보 처리 동의 내용" onPress={() => router.push('/settings/terms/sensitive')} />
      </Group>
      <Group title="데이터">
        <Row icon="box" label="내 기록 내보내기" onPress={() => router.push('/settings/export')} />
      </Group>
      <Group title="정보">
        <Row icon="doc" label="이용약관" onPress={() => router.push('/settings/terms/service')} />
        <Row icon="doc" label="개인정보 처리방침" onPress={() => router.push('/settings/terms/privacy')} />
        <Row icon="info" label="앱 정보" sub={`버전 ${APP_VERSION}`} onPress={() => router.push('/settings/about')} />
      </Group>
      <Group>
        <Row label="로그아웃" onPress={() => setConfirm(true)} right={<View />} />
        <Row label="회원탈퇴" danger onPress={() => router.push('/settings/withdraw')} right={<View />} />
      </Group>
    </SettingsShell>
  );
}
