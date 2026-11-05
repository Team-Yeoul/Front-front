'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
import { Button, ChevronRight, Toast, Toggle, TopBar } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlays';
import { useMe } from '@/hooks/useMe';

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <p className="text-[12px] font-semibold text-sub px-1 mb-2">{title}</p>
      <div className="rounded-2xl border border-line bg-white divide-y divide-line">{children}</div>
    </section>
  );
}

function Row({ label, value, right, onClick }: { label: string; value?: string; right?: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between h-[52px] px-4 ${onClick ? 'cursor-pointer' : ''}`}>
      <span className="text-[15px] text-ink">{label}</span>
      {right ?? (
        <span className="flex items-center gap-1.5 text-[14px] text-sub">
          {value}
          <ChevronRight size={15} />
        </span>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const removeLocal = useLocalStore((s) => s.remove);
  const { data: account } = useGetMyAccount(!!accessToken);
  const { data: noti } = useGetNotificationSettings(!!accessToken);
  const updateNoti = useUpdateNotificationSettings();
  const logout = useLogout();
  const withdraw = useWithdrawAccount();
  const me = useMe();
  const alarm = noti?.push_enabled === false ? '꺼짐' : noti?.daily_question_time ? `매일 ${noti.daily_question_time}` : '';
  const [confirm, setConfirm] = useState<'logout' | 'withdraw' | null>(null);
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
    clearAuth();
    router.push('/');
  };

  return (
    <Screen
      overlay={
        <>
        {toast && <Toast message={toast} />}
        {/* 요청이 진행 중이면 닫아도 로그아웃·탈퇴는 계속되므로, 그동안은 닫을 수 없게 한다. */}
        <Modal open={!!confirm} onClose={() => !busy && setConfirm(null)}>
          <p className="text-[17px] font-bold text-ink text-center">{confirm === 'withdraw' ? '정말 탈퇴할까요?' : '로그아웃할까요?'}</p>
          <p className="text-[13px] text-sub text-center mt-2">
            {confirm === 'withdraw' ? '기록과 도감이 모두 삭제되고 되돌릴 수 없어요.' : '언제든 다시 로그인할 수 있어요.'}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-5">
            <Button variant="gray" onClick={() => setConfirm(null)} disabled={busy}>
              취소
            </Button>
            <Button variant={confirm === 'withdraw' ? 'danger' : 'primary'} onClick={run} disabled={busy}>
              {busy ? '처리 중...' : confirm === 'withdraw' ? '탈퇴하기' : '로그아웃'}
            </Button>
          </div>
        </Modal>
        </>
      }
    >
      <TopBar title="설정" />
      <div className="px-5 pb-8">
        <Group title="계정">
          <Row label="프로필 편집" value={me.nickname || account?.user.username || ''} />
          <Row label="이메일" value={account?.user.email ?? ''} />
          <Row label="연결된 계정" value="이메일" />
        </Group>
        <Group title="알림">
          <Row label="기록 리마인더" value={alarm} onClick={() => router.push('/notifications?from=settings')} />
          <Row label="푸시 알림" right={<Toggle on={noti?.push_enabled ?? true} disabled={!noti} onChange={(v) => setNoti({ push_enabled: v })} />} />
          <Row label="마케팅 정보 수신" right={<Toggle on={noti?.marketing_consent ?? false} disabled={!noti} onChange={(v) => setNoti({ marketing_consent: v })} />} />
        </Group>
        <Group title="데이터">
          <Row label="기록 내보내기" />
          <Row label="객관화 기록 보관" value="12개월" />
        </Group>
        <Group title="정보">
          <Row label="이용약관" onClick={() => router.push('/settings/terms/service')} />
          <Row label="개인정보 처리방침" onClick={() => router.push('/settings/terms/privacy')} />
          <Row label="버전" value="1.0.3" />
        </Group>
        <div className="flex gap-5 px-1 mt-6">
          <button onClick={() => setConfirm('logout')} className="text-[15px] text-danger">
            로그아웃
          </button>
          <button onClick={() => setConfirm('withdraw')} className="text-[15px] text-danger">
            회원탈퇴
          </button>
        </div>
      </div>
    </Screen>
  );
}
