'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { User, Lock, Bell, ChevronRight, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store';
import { useGetMyAccount, useLogout } from '@/entities/user';
import { useListDailyRecords } from '@/entities/diary';

type MyPageView = 'main' | 'settings' | 'inquiry';

function computeStreaks(dateKeys: Set<string>) {
  if (dateKeys.size === 0) return { current: 0, max: 0 };
  const sorted = [...dateKeys].sort();

  let max = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = Math.round(
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000,
    );
    run = diffDays === 1 ? run + 1 : 1;
    max = Math.max(max, run);
  }

  let current = 0;
  const cursor = new Date();
  while (dateKeys.has(cursor.toLocaleDateString('sv-SE'))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, max };
}

export default function MyPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const nickname = useAuthStore((s) => s.nickname);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [view, setView] = useState<MyPageView>('main');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [inquiryType, setInquiryType] = useState('버그');

  const { data: account } = useGetMyAccount(!!accessToken);
  const { data: recordsData } = useListDailyRecords({ size: 200 }, !!accessToken);
  const logout = useLogout();

  const displayName = nickname || (account?.user.email ? account.user.email.split('@')[0] : '회원');
  const recordDates = new Set(
    (recordsData?.records ?? []).map((r) => new Date(r.created_at).toLocaleDateString('sv-SE')),
  );
  const hasRecords = recordDates.size > 0;
  const { current: currentStreak, max: maxStreak } = computeStreaks(recordDates);
  const answeredCount = recordsData?.page_info.total_elements;

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout.mutateAsync();
    } catch {
      // 세션 만료 등으로 실패해도 로컬 로그아웃은 진행
    }
    clearAuth();
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <div className="relative flex flex-col h-full bg-[#F3F3F6] font-sans select-none overflow-hidden">

      {/* ======================================================== */}
      {/* 화면 1: 마이페이지 메인 뷰 */}
      {/* ======================================================== */}
      {view === 'main' && (
        <div className="flex-1 overflow-y-auto pt-4 px-6 pb-6 space-y-5 animate-fadeIn">
          {/* 타이틀 */}
          <div>
            <h1 className="text-[22px] font-normal text-gray-900 tracking-tight">마이 페이지</h1>
            <p className="text-[13px] text-gray-400 font-light mt-0.5">내 면</p>
          </div>

          {/* 프로필 및 활동 통계 통합 카드 (시안 싱크 100%) */}
          <div className="bg-white rounded-[24px] shadow-sm overflow-hidden">
            {/* 상단: 프로필 정보 */}
            <div className="p-5 flex items-center gap-4">
              <div className="relative w-[72px] h-[72px] flex items-center justify-center shrink-0">
                <Image src="/자책_인피니티.png" alt="자책 인피니티" fill className="object-contain" />
              </div>
              <div>
                <h2 className="text-[18px] font-normal text-gray-900 tracking-tight">{displayName}</h2>
                <p className="text-[12px] text-gray-400 font-light mt-0.5">팀 여울의 CEO</p>
              </div>
            </div>

            {/* 중간 구분선 */}
            <div className="border-t border-gray-200 mx-5" />

            {/* 하단: 활동 통계 보드 ('현재 연속 로그인', '최대 연속 로그인', '대답한 질문') */}
            <div className="grid grid-cols-3 py-5 text-center relative">
              {/* 현재 연속 로그인 */}
              <div className="flex flex-col items-center justify-center px-2">
                <span className="text-[11px] text-[#A0A0A0] font-light tracking-tight mb-1">현재 연속 로그인</span>
                <span className="text-[17px] font-normal text-gray-900 font-mono">
                  D+{hasRecords ? currentStreak : 0}
                </span>
              </div>

              {/* 세로 구분선 1 */}
              <div className="absolute left-1/3 top-1/4 bottom-1/4 w-[1px] bg-gray-200" />

              {/* 최대 연속 로그인 */}
              <div className="flex flex-col items-center justify-center px-2">
                <span className="text-[11px] text-[#A0A0A0] font-light tracking-tight mb-1">최대 연속 로그인</span>
                <span className="text-[17px] font-normal text-gray-900 font-mono">
                  D+{hasRecords ? maxStreak : 0}
                </span>
              </div>

              {/* 세로 구분선 2 */}
              <div className="absolute left-2/3 top-1/4 bottom-1/4 w-[1px] bg-gray-200" />

              {/* 대답한 질문 */}
              <div className="flex flex-col items-center justify-center px-2">
                <span className="text-[11px] text-[#A0A0A0] font-light tracking-tight mb-1">대답한 질문</span>
                <span className="text-[17px] font-normal text-gray-900">{answeredCount ?? 0}개</span>
              </div>
            </div>
          </div>

          {/* 네비게이션 메뉴 목록 (설정 / 문의하기) */}
          <div className="bg-white rounded-[24px] shadow-sm divide-y divide-gray-100 overflow-hidden">
            <button
              onClick={() => setView('settings')}
              className="w-full h-[56px] px-5 flex items-center justify-between text-left active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-gray-400" strokeWidth={1.5} />
                <span className="text-[15px] font-light text-gray-900 tracking-tight">설정</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
            <button
              onClick={() => setView('inquiry')}
              className="w-full h-[56px] px-5 flex items-center justify-between text-left active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={18} className="text-gray-400" strokeWidth={1.5} />
                <span className="text-[15px] font-light text-gray-900 tracking-tight">문의하기</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          </div>

          {/* 로그아웃 버튼 트리거 */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full h-[56px] px-5 bg-white rounded-[24px] shadow-sm flex items-center gap-3 text-left active:bg-gray-50 transition-colors"
          >
            <LogOut size={18} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-[15px] font-light text-gray-900 tracking-tight">로그아웃</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 화면 2: 마이페이지 - 설정 서브뷰 */}
      {/* ======================================================== */}
      {view === 'settings' && (
        <div className="flex-1 overflow-y-auto pt-4 px-6 pb-6 space-y-5 animate-fadeIn">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('main')}
              className="w-8 h-8 flex items-center justify-center shrink-0"
            >
              <svg width="16" height="25" viewBox="0 0 16 25">
                <path
                  d="M13 3 L3 12.5 L13 22 Z"
                  fill="black"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-[22px] font-normal text-gray-900 tracking-tight">마이 페이지 - 설정</h1>
              <p className="text-[13px] text-gray-400 font-light mt-0.5">내 면 - 설정</p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm space-y-6">
            <div className="flex items-center gap-4 cursor-pointer group">
              <User size={20} className="text-gray-900" strokeWidth={1.5} />
              <span className="text-[15px] font-light text-gray-900 tracking-tight group-hover:underline">프로필 설정</span>
            </div>
            <div className="flex items-center gap-4 cursor-pointer group">
              <Lock size={20} className="text-gray-900" strokeWidth={1.5} />
              <span className="text-[15px] font-light text-gray-900 tracking-tight group-hover:underline">비밀번호 재설정</span>
            </div>
            <div className="flex items-center gap-4 cursor-pointer group">
              <Bell size={20} className="text-gray-900" strokeWidth={1.5} />
              <span className="text-[15px] font-light text-gray-900 tracking-tight group-hover:underline">알람 설정</span>
            </div>
            <div className="pt-2 text-[14px] font-light text-gray-400 space-y-2 border-t border-gray-50">
              <p className="cursor-pointer hover:text-gray-600">기타 설정들</p>
              <p className="cursor-pointer hover:text-gray-600">기타 설정들</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 화면 3: 마이페이지 - 문의하기 서브뷰 */}
      {/* ======================================================== */}
      {view === 'inquiry' && (
        <div className="flex-1 flex flex-col pt-4 px-6 pb-12 justify-between animate-fadeIn">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('main')}
                className="w-8 h-8 flex items-center justify-center shrink-0"
              >
                <svg width="16" height="25" viewBox="0 0 16 25">
                <path
                  d="M13 3 L3 12.5 L13 22 Z"
                  fill="black"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              </button>
              <div>
                <h1 className="text-[22px] font-normal text-gray-900 tracking-tight">마이 페이지 - 문의하기</h1>
                <p className="text-[13px] text-gray-400 font-light mt-0.5">내 면 - 문의하기</p>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                <span className="text-[15px] font-normal text-gray-900 shrink-0">제목:</span>
                <input 
                  type="text" 
                  placeholder="제목을 입력해 주세요" 
                  className="w-full text-[15px] font-light text-gray-900 placeholder-gray-300 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto no-scrollbar">
                <span className="text-[14px] text-gray-900 font-normal mr-1 shrink-0">유형</span>
                {['버그', '요청', '기타1', '기타2'].map((type, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInquiryType(type)}
                    className={`px-3 py-1 rounded-full text-[12px] font-light tracking-tight transition-all ${
                      inquiryType === type ? 'bg-black text-white' : 'bg-[#F3F3F6] text-gray-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <textarea 
                placeholder="내용을 입력해 주세요"
                rows={8}
                className="w-full text-[14px] font-light text-gray-900 placeholder-gray-300 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          <button
            onClick={() => {
              alert('문의사항이 성공적으로 전송되었습니다.');
              setView('main');
            }}
            className="w-full h-[54px] rounded-[20px] bg-black text-white text-[16px] font-normal tracking-tight active:opacity-90 transition-all mt-4 shadow-md"
          >
            문의사항 전송하기
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 팝업 모달: 로그아웃 확인창 */}
      {/* ======================================================== */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div 
            onClick={() => setShowLogoutModal(false)} 
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          />
          
          <div className="relative w-full max-w-[340px] bg-white rounded-[32px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] text-center space-y-6 transform scale-100 transition-transform">
            <h3 className="text-[20px] font-normal text-gray-900 tracking-tight pt-2">
              로그아웃하시겠습니까?
            </h3>
            
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 h-[50px] rounded-[18px] bg-[#E32424] text-white text-[15px] font-normal tracking-tight active:opacity-95"
              >
                예
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 h-[50px] rounded-[18px] bg-black text-white text-[15px] font-normal tracking-tight active:opacity-95"
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
