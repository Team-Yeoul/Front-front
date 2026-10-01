'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { useMe } from '@/hooks/useMe';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, Toast } from '@/components/ui/primitives';

// 친구 응답 API가 아직 없어 응답 수는 0으로 둔다.
const RESPONDERS: { name: string; color: string; when: string }[] = [];
const OPEN_AT = 3;

// 초대 링크 발급 API가 아직 없어 사용자 id로 데모 링크를 만든다.
export default function MirrorInvitePage() {
  const userId = useAuthStore((s) => s.userId);
  const code = (userId ?? 's0h33').replace(/-/g, '').slice(0, 5);
  const { nickname } = useMe();
  // 친구 화면에 내 이름이 보이도록 닉네임을 링크에 담는다.
  const path = `/m/${code}${nickname ? `?n=${encodeURIComponent(nickname)}` : ''}`;
  const display = `metame.app/mirror/${code}`;
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    } catch {
      // 클립보드 권한이 없어도 안내는 띄움
    }
    setToast(true);
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
            <span>기한 없음</span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <p className="text-white">
              <span className="text-[40px] font-bold leading-none">{RESPONDERS.length}</span>
              <span className="text-[15px] ml-2">명 응답</span>
            </p>
            <span className="h-7 px-3 rounded-full bg-white/20 text-[12px] font-bold text-white inline-flex items-center">
              {RESPONDERS.length >= OPEN_AT ? '비교 리포트 열림' : `${OPEN_AT - RESPONDERS.length}명 더 모이면 열려요`}
            </span>
          </div>
          <p className="text-[13px] text-white/85 mt-4">인원 제한 없이 계속 받을 수 있어요</p>
        </div>

        <div className="mt-4 rounded-3xl bg-surface px-5 py-5">
          <p className="text-[16px] font-bold text-ink">초대 링크</p>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#EDEDF2] pl-4 pr-2 h-14">
            <span className="font-mono text-[14px] text-[#48484F] truncate">{display}</span>
            <button onClick={copy} className="h-9 px-3.5 rounded-xl bg-primary-soft text-[13px] font-semibold text-primary shrink-0">
              복사
            </button>
          </div>
          <p className="text-[12px] text-sub mt-3">링크를 받은 사람은 로그인 없이 3분 안에 답할 수 있어요</p>
        </div>

        <div className="mt-4 rounded-3xl bg-surface px-5 py-5">
          <p className="text-[16px] font-bold text-ink">응답한 사람</p>
          {RESPONDERS.length === 0 && <p className="text-[13px] text-sub mt-3">아직 답한 친구가 없어요. 링크를 보내 보세요.</p>}
          <div className="flex flex-col gap-2.5 mt-4">
            {RESPONDERS.map((r) => (
              <div key={r.name} className="flex items-center gap-3 rounded-2xl bg-[#EDEDF2] px-4 h-14">
                <span className="w-7 h-7 rounded-full" style={{ background: r.color }} />
                <span className="flex-1 text-[14px] text-ink">{r.name}</span>
                <span className="text-[12px] text-sub">{r.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}
