'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { useMe } from '@/hooks/useMe';
import { useGetMyAccount } from '@/entities/user';
import { useCreatePeerFeedbackInvitation, useListPeerFeedback } from '@/entities/peer-feedback';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, Toast } from '@/components/ui/primitives';

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

export default function MirrorInvitePage() {
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

  // 링크 하나에 한 명만 답할 수 있어, 복사할 때마다 새 초대 링크를 발급한다.
  const issueLink = async () => {
    // 계정 이름을 아직 못 받았으면 함께 받아 와, 이름 없는 링크(친구 화면에 '친구님')가 나가지 않게 한다.
    const [{ invite_url }, name] = await Promise.all([
      createInvitation.mutateAsync(),
      nickname || refetchAccount().then((r) => accountName(r.data)),
    ]);
    // invite_url은 {프론트 URL}/feedback/{token}이라, 지금 보고 있는 주소로 다시 만든다(개발 서버에서도 열리게).
    const inviteToken = invite_url?.split('/').pop();
    if (!inviteToken) throw new Error('초대 링크가 비어 있어요');
    // 친구 화면에 내 이름이 보이도록 닉네임을 링크에 담는다.
    const url = `${window.location.origin}/feedback/${inviteToken}${name ? `?n=${encodeURIComponent(name)}` : ''}`;
    setLink(url);
    return url;
  };

  const copy = async () => {
    if (createInvitation.isPending) return;
    const pending = issueLink();
    try {
      // Safari는 비동기 응답을 기다린 뒤의 복사를 막아, 클릭한 순간에 Promise를 넘긴다.
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': pending.then((u) => new Blob([u], { type: 'text/plain' })) })]);
    } catch {
      try {
        await navigator.clipboard.writeText(await pending);
      } catch {
        // 발급 실패는 아래 안내로, 클립보드 권한이 없으면 화면의 링크를 직접 복사하게 둔다.
      }
    }
    if (await pending.then(() => true, () => false)) setToast(true);
  };

  return (
    <Screen footer={<Button onClick={copy}>링크 복사하기</Button>} overlay={toast && <Toast message="초대 링크를 복사했어요" />}>
      <div className="px-5 pt-2 pb-6">
        <BackButton />
        <p className="font-mono text-[12px] tracking-[0.1em] text-sub mt-5">MIRROR · 타인의 시선</p>
        <h1 className="text-[26px] font-bold text-ink mt-2">남이 보는 나 모으기</h1>
        <p className="text-[13px] text-sub leading-relaxed mt-2">친구 3명 이상이 답하면 비교 리포트가 열려요. 누가 무엇을 골랐는지는 보이지 않습니다.</p>

        <div className="mt-6 rounded-3xl bg-primary px-5 py-5">
          <div className="flex justify-between text-[13px] text-white/75">
            <span>응답 현황</span>
            <span>링크마다 7일</span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <p className="text-white">
              <span className="text-[40px] font-bold leading-none">{count}</span>
              <span className="text-[15px] ml-2">명 응답</span>
            </p>
            <span className="h-7 px-3 rounded-full bg-white/20 text-[12px] font-bold text-white inline-flex items-center">
              {count >= OPEN_AT ? '비교 리포트 열림' : `${OPEN_AT - count}명 더 모이면 열려요`}
            </span>
          </div>
          <p className="text-[13px] text-white/85 mt-4">인원 제한 없이 계속 받을 수 있어요</p>
        </div>

        <div className="mt-4 rounded-3xl bg-surface px-5 py-5">
          <p className="text-[16px] font-bold text-ink">초대 링크</p>
          <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl bg-[#EDEDF2] pl-4 pr-2 h-14">
            <span className={`font-mono text-[14px] truncate select-all ${link ? 'text-[#48484F]' : 'text-mute'}`}>{link ?? '복사하면 새 링크가 만들어져요'}</span>
            <button onClick={copy} disabled={createInvitation.isPending} className="h-9 px-3.5 rounded-xl bg-primary-soft text-[13px] font-semibold text-primary shrink-0">
              {createInvitation.isPending ? '만드는 중' : '복사'}
            </button>
          </div>
          {createInvitation.isError ? (
            <p className="text-[12px] text-danger mt-3">링크를 만들지 못했어요. 다시 눌러 주세요.</p>
          ) : (
            <p className="text-[12px] text-sub mt-3 leading-relaxed">
              링크 하나에 친구 한 명이 답할 수 있어요. 친구마다 새로 복사해서 보내 주세요.
              <br />
              로그인 없이 3분 안에 답할 수 있고, 링크는 7일 동안 유효해요.
            </p>
          )}
        </div>

        <div className="mt-4 rounded-3xl bg-surface px-5 py-5">
          <p className="text-[16px] font-bold text-ink">응답한 사람</p>
          {count === 0 && <p className="text-[13px] text-sub mt-3">아직 답한 친구가 없어요. 링크를 보내 보세요.</p>}
          <div className="flex flex-col gap-2.5 mt-4">
            {/* 누가 답했는지는 공개하지 않아, 답한 순서로만 보여준다. */}
            {feedbacks.map((f, i) => (
              <div key={f.feedback_id} className="flex items-center gap-3 rounded-2xl bg-[#EDEDF2] px-4 h-14">
                <span className="w-7 h-7 rounded-full" style={{ background: COLORS[(count - i - 1) % COLORS.length] }} />
                <span className="flex-1 text-[14px] text-ink">익명 친구 {count - i}</span>
                <span className="text-[12px] text-sub">{timeAgo(f.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}
