'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import {
  useGetMyAccount,
  useGetNotificationSettings,
  useLogout,
  useUpdateNotificationSettings,
  useWithdrawAccount,
} from '@/entities/user';
import { Screen } from '@/components/ui/Screen';
import { Button, ChevronRight, Toggle, TopBar } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlays';
import { MOCK_NICKNAME } from '@/lib/mock';

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
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { data: account } = useGetMyAccount(!!accessToken);
  const { data: noti } = useGetNotificationSettings(!!accessToken);
  const updateNoti = useUpdateNotificationSettings();
  const logout = useLogout();
  const withdraw = useWithdrawAccount();
  const [friendAlert, setFriendAlert] = useState(true);
  const [confirm, setConfirm] = useState<'logout' | 'withdraw' | null>(null);

  const reportOn = noti ? noti.report_enabled : true;
  const setReport = (v: boolean) => {
    if (noti) updateNoti.mutate({ ...noti, report_enabled: v });
  };

  const run = async () => {
    try {
      if (confirm === 'withdraw') await withdraw.mutateAsync();
      else if (accessToken) await logout.mutateAsync();
    } catch {
      // 서버 실패와 관계없이 로컬 세션은 정리
    }
    clearAuth();
    router.push('/');
  };

  return (
    <Screen
      overlay={
        <Modal open={!!confirm} onClose={() => setConfirm(null)}>
          <p className="text-[17px] font-bold text-ink text-center">{confirm === 'withdraw' ? '정말 탈퇴할까요?' : '로그아웃할까요?'}</p>
          <p className="text-[13px] text-sub text-center mt-2">
            {confirm === 'withdraw' ? '기록과 도감이 모두 삭제되고 되돌릴 수 없어요.' : '언제든 다시 로그인할 수 있어요.'}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-5">
            <Button variant="gray" onClick={() => setConfirm(null)}>
              취소
            </Button>
            <Button variant={confirm === 'withdraw' ? 'danger' : 'primary'} onClick={run}>
              {confirm === 'withdraw' ? '탈퇴하기' : '로그아웃'}
            </Button>
          </div>
        </Modal>
      }
    >
      <TopBar title="설정" />
      <div className="px-5 pb-8">
        <Group title="계정">
          <Row label="프로필 편집" value={MOCK_NICKNAME} />
          <Row label="이메일" value={account?.user.email ?? 'sohee@metame.app'} />
          <Row label="연결된 계정" value="카카오" />
        </Group>
        <Group title="알림">
          <Row label="기록 리마인더" value="매일 21:00" onClick={() => router.push('/notifications')} />
          <Row label="친구 응답 알림" right={<Toggle on={friendAlert} onChange={setFriendAlert} />} />
          <Row label="주간 리포트 알림" right={<Toggle on={reportOn} onChange={setReport} />} />
        </Group>
        <Group title="데이터">
          <Row label="기록 내보내기" />
          <Row label="객관화 기록 보관" value="12개월" />
        </Group>
        <Group title="정보">
          <Row label="이용약관" onClick={() => router.push('/terms')} />
          <Row label="개인정보 처리방침" onClick={() => router.push('/terms')} />
          <Row label="버전" value="1.0.3" />
        </Group>
        <div className="flex gap-5 px-1 mt-6">
          <button onClick={() => setConfirm('logout')} className="text-[13px] text-danger">
            로그아웃
          </button>
          <button onClick={() => setConfirm('withdraw')} className="text-[13px] text-danger">
            회원탈퇴
          </button>
        </div>
      </div>
    </Screen>
  );
}
