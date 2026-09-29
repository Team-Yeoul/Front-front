'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Bell, ChevronRight, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store';
import { useGetMyProfile } from '@/entities/user';
import { useListMyMonsters } from '@/entities/collection';
import { HubTabs } from '@/components/layout/HubTabs';

type MyPageView = 'main' | 'settings' | 'inquiry';

function ChevronButton({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-7 h-7 flex items-center justify-center text-gray-300">
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
        <path
          d={direction === 'left' ? 'M7 1L1 7l6 6' : 'M1 1l6 6-6 6'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function StatTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-4">
      <span className="text-[11px] text-gray-400 mb-1.5">{label}</span>
      <span className={`text-[15px] font-bold ${highlight ? 'text-[#6366F1]' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

export default function MyPage() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [view, setView] = useState<MyPageView>('main');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [inquiryType, setInquiryType] = useState('버그');
  const [cursorMonth, setCursorMonth] = useState(new Date().getMonth() + 1);

  const { data: profile, refetch: refetchProfile } = useGetMyProfile(!!accessToken);
  const { data: monsters, refetch: refetchMonsters } = useListMyMonsters(undefined, !!accessToken);

  const nickname = '이시은';
  const handle = profile?.user.email ? profile.user.email.split('@')[0] : 'sohee';
  const dDay = profile
    ? Math.max(0, Math.floor((Date.now() - new Date(profile.user.created_at).getTime()) / 86400000))
    : 62;
  const accuracyPercent = profile?.latest_accuracy?.accuracy_percent ?? 14;
  const level = Math.max(1, Math.floor(dDay / 15) + 1);
  const monsterCount = monsters?.total_count ?? 12;
  const sentence = profile?.profile.ai_first_sentence || '나는 타인의 감정에 민감하고, 막다 안에서 몰입이 커지는 사람입니다.';

  if (view === 'main') {
    return (
      <div className="relative flex flex-col h-full bg-white overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <span className="w-8" />
          <h1 className="text-[16px] font-semibold text-gray-900">마이페이지</h1>
          <button onClick={() => setView('settings')} className="w-8 h-8 flex items-center justify-center" aria-label="설정">
            <Settings size={20} className="text-gray-400" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex items-center gap-4 px-6 pb-5">
          <div className="w-16 h-16 rounded-full bg-gray-100 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold text-gray-900">{nickname}</span>
              <span className="text-[11px] font-bold text-gray-900 bg-[#F5D949] px-2 py-0.5 rounded-full">
                Lv.{level}
              </span>
            </div>
            <p className="text-[13px] text-gray-400 mt-1">
              @{handle} · 기록 {dDay}일차
            </p>
          </div>
        </div>

        <HubTabs active="month" />

        <div className="px-6 pt-5 pb-8">
          <div className="flex items-center justify-center gap-5 mb-5">
            <ChevronButton
              direction="left"
              onClick={() => setCursorMonth((m) => (m === 1 ? 12 : m - 1))}
            />
            <span className="text-[15px] font-semibold text-gray-900 w-10 text-center">{cursorMonth}월</span>
            <ChevronButton
              direction="right"
              onClick={() => setCursorMonth((m) => (m === 12 ? 1 : m + 1))}
            />
          </div>

          <h2 className="text-[19px] font-bold text-gray-900 text-center mb-5">
            이번 달, 나를 {accuracyPercent}%만큼 알았어요
          </h2>

          <div className="grid grid-cols-3 bg-gray-50 rounded-2xl mb-6 divide-x divide-gray-200">
            <StatTile label="이번 달 레벨" value={`Lv.${level}`} highlight />
            <StatTile label="모은 도감" value={`${monsterCount}장`} />
            <StatTile label="정확도 변화" value="▲ 2%" />
          </div>

          <div className="relative flex justify-center mb-6">
            <div
              className="absolute rounded-[50%]"
              style={{
                width: 260,
                height: 150,
                bottom: 6,
                backgroundColor: '#F3E3BF',
                transform: 'rotate(-8deg)',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.png" alt="MetaMe 마스코트" className="relative w-[200px] h-auto" />
            <div className="absolute bottom-0 right-6 flex flex-col gap-2">
              <button
                onClick={() => {
                  refetchProfile();
                  refetchMonsters();
                }}
                className="w-9 h-9 rounded-full bg-[#6366F1] text-white flex items-center justify-center shadow-sm"
                aria-label="새로고침"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12a9 9 0 1 1 2.64 6.36M3 12v6M3 12h6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                className="w-9 h-9 rounded-full bg-[#6366F1] text-white flex items-center justify-center shadow-sm"
                aria-label="공유"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7M17 7H8M17 7v9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-semibold text-gray-900">나의 문장</span>
              <span className="text-[12px] font-semibold text-[#6366F1]">정확도 {accuracyPercent}%</span>
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed">{sentence}</p>
          </div>
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="mx-6 mb-8 h-12 flex items-center gap-3 text-left text-gray-400"
        >
          <LogOut size={16} strokeWidth={1.8} />
          <span className="text-[13px]">로그아웃</span>
        </button>

        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div onClick={() => setShowLogoutModal(false)} className="absolute inset-0 bg-black/20" />
            <div className="relative w-full max-w-[340px] bg-white rounded-[32px] p-6 shadow-lg text-center space-y-6">
              <h3 className="text-[18px] font-semibold text-gray-900 pt-2">로그아웃하시겠습니까?</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    clearAuth();
                    router.push('/login');
                  }}
                  className="flex-1 h-[50px] rounded-2xl bg-gray-100 text-gray-500 text-[15px] font-semibold"
                >
                  예
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 h-[50px] rounded-2xl bg-[#8287FF] text-white text-[15px] font-semibold"
                >
                  아니오
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="flex-1 overflow-y-auto pt-4 px-6 pb-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('main')} className="w-8 h-8 flex items-center justify-center shrink-0" aria-label="뒤로">
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
              <path d="M8.5 1.5L1.5 8L8.5 14.5" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-[18px] font-semibold text-gray-900">설정</h1>
        </div>

        <div className="bg-white rounded-[24px] p-5 shadow-sm space-y-6">
          <div className="flex items-center gap-4 cursor-pointer group">
            <User size={20} className="text-gray-900" strokeWidth={1.5} />
            <span className="text-[15px] text-gray-900 group-hover:underline">프로필 설정</span>
          </div>
          <div className="flex items-center gap-4 cursor-pointer group">
            <Lock size={20} className="text-gray-900" strokeWidth={1.5} />
            <span className="text-[15px] text-gray-900 group-hover:underline">비밀번호 재설정</span>
          </div>
          <div className="flex items-center gap-4 cursor-pointer group">
            <Bell size={20} className="text-gray-900" strokeWidth={1.5} />
            <span className="text-[15px] text-gray-900 group-hover:underline">알림 설정</span>
          </div>
          <button
            onClick={() => setView('inquiry')}
            className="w-full flex items-center justify-between text-left pt-2 border-t border-gray-50"
          >
            <div className="flex items-center gap-4">
              <HelpCircle size={20} className="text-gray-900" strokeWidth={1.5} />
              <span className="text-[15px] text-gray-900">문의하기</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-4 px-6 pb-12 justify-between">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('settings')} className="w-8 h-8 flex items-center justify-center shrink-0" aria-label="뒤로">
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
              <path d="M8.5 1.5L1.5 8L8.5 14.5" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-[18px] font-semibold text-gray-900">문의하기</h1>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <span className="text-[15px] text-gray-900 shrink-0">제목:</span>
            <input type="text" placeholder="제목을 입력해 주세요" className="w-full text-[15px] text-gray-900 placeholder-gray-300 focus:outline-none" />
          </div>
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto no-scrollbar">
            <span className="text-[14px] text-gray-900 mr-1 shrink-0">유형</span>
            {['버그', '요청', '기타1', '기타2'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setInquiryType(type)}
                className={`px-3 py-1 rounded-full text-[12px] transition-colors ${
                  inquiryType === type ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <textarea
            placeholder="내용을 입력해 주세요"
            rows={8}
            className="w-full text-[14px] text-gray-900 placeholder-gray-300 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      <button
        onClick={() => {
          alert('문의사항이 성공적으로 전송되었습니다.');
          setView('main');
        }}
        className="w-full h-[54px] rounded-2xl bg-gray-900 text-white text-[15px] font-semibold mt-4"
      >
        문의사항 전송하기
      </button>
    </div>
  );
}
