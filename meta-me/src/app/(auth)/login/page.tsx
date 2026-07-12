"use client";

import React, { useState } from "react";
// 💡 누락되었던 필수 컴포넌트 및 Hook들을 프로젝트 구조에 맞게 임포트하세요.
// import Link from "next/link"; 
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "@/store";
// import { login } from "@/shared/api"; // 실제 가상의 로그인 API 위치

// 💡 임시 테스트용 MONSTER_DATA 객체 (실제 위치에서 불러오거나 정의해야 합니다)
const MONSTER_DATA = {
  namtat: {
    name: "남탓대마왕",
    category: "사고/인지",
    tier: "1티어",
    reason: "팀원들의 비협조적인 태도로 인해 문제의 원인을 외부로 돌렸습니다.",
    desc: "문제의 원인을 주로 바깥에서 찾을 때 나타나는 몬스터예요."
  }
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M18.1 10.2c0-.6-.06-1.18-.16-1.74H10v3.3h4.55a3.9 3.9 0 0 1-1.69 2.56v2.12h2.73C17.1 14.96 18.1 12.76 18.1 10.2z" fill="#4285F4"/>
      <path d="M10 18.4c2.29 0 4.21-.76 5.61-2.06l-2.73-2.12C12.13 14.83 11.15 15.1 10 15.1c-2.21 0-4.08-1.49-4.75-3.5H2.43v2.19C3.82 16.69 6.72 18.4 10 18.4z" fill="#34A853"/>
      <path d="M5.25 11.6A5.4 5.4 0 0 1 4.97 10c0-.55.1-1.09.28-1.6V6.21H2.43A9.24 9.24 0 0 0 1.4 10c0 1.48.35 2.88.97 4.13l2.88-2.53z" fill="#FBBC05"/>
      <path d="M10 4.9c1.25 0 2.37.43 3.25 1.27l2.44-2.44C14.21 2.36 12.29 1.6 10 1.6 6.72 1.6 3.82 3.31 2.43 6l2.82 2.19C5.92 6.39 7.79 4.9 10 4.9z" fill="#EA4335"/>
    </svg>
  );
}

// 💡 껍데기 링크 컴포넌트 (실제 Next.js의 Link를 임포트하면 이 구문은 지우셔도 됩니다)
function Link({ href, children, className }: any) {
  return <a href={href} className={className}>{children}</a>;
}

export default function LoginPage() {
  // 💡 아래의 모킹(Mock) 변수들은 실제 환경에 맞게 커스텀 훅이나 스토어로 연결하세요.
  const router = { push: (url: string) => {} }; 
  const setAuth = (access: string, refresh: string, id: string) => {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 💡 마이페이지용/도감용으로 정의되어 있던 상태들을 추가하여 에러를 방지합니다.
  const [step, setStep] = useState<"login" | "loading" | "result" | "monster_discovery" | "dogam">("login");
  const [progress, setProgress] = useState(50);
  const [isMirrorOpen, setIsMirrorOpen] = useState(false);
  const [isMonsterGrowthOpen, setIsMonsterGrowthOpen] = useState(false);
  const [selectedMonsterDetail, setSelectedMonsterDetail] = useState(false);

  const emailValid = email.includes('@') && email.includes('.');
  const canSubmit = emailValid && password.length >= 6;

  // ✅ 수정 완료: 함수 뒤에 붙어있던 ', [step]);' 오타를 제거했습니다.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setError('');
    setLoading(true);
    try {
      // const res = await login({ email, password });
      // setAuth(res.access_token, res.refresh_token, res.user_id);
      router.push('/diary');
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressText = () => {
    const filled = Math.floor(progress / 10);
    return `[${"■".repeat(filled)}${"□".repeat(10 - filled)}]`;
  };

  return (
    <div className="flex flex-col bg-white max-w-sm mx-auto min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center px-4 h-[52px] border-b border-gray-100 shrink-0">
        <Link href="/" className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <span className="flex-1 text-center text-[16px] font-semibold text-gray-900 pr-8">로그인</span>
      </div>

      <div className="flex flex-col px-5 pt-8 pb-6 flex-1">
        {/* 로고 영역 */}
        <div className="flex flex-col items-center mb-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MetaMe" className="h-12 w-auto" />
          <h1 className="text-[22px] font-bold text-gray-900 mt-3">MetaMe</h1>
          <p className="text-[13px] text-gray-400 mt-1">MetaMe에 오신걸 환영합니다^^</p>
        </div>

        {/* 메인 콘텐츠 에어리어 */}
        <main className="flex-1 overflow-y-auto pb-10">
          
          {/* [화면 0] 기본 로그인 양식 폼 */}
          {step === "login" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  placeholder="이메일 입력" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[54px] px-4 border border-gray-200 rounded-2xl text-[15px]" 
                />
              </div>
              <div>
                <input 
                  type={showPw ? "text" : "password"} 
                  placeholder="비밀번호 입력" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[54px] px-4 border border-gray-200 rounded-2xl text-[15px]" 
                />
              </div>
              {error && <p className="text-red-500 text-[13px]">{error}</p>}
              
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className={`w-full h-[54px] rounded-2xl text-[15px] font-semibold transition-colors ${
                  canSubmit && !loading ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>
          )}

          {/* [화면 1] 첫 진입 */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center pt-12 space-y-10 text-center">
              <div className="space-y-4">
                <p className="text-[17px] text-gray-600 font-normal">감정을 닦는 중...</p>
                <h2 className="text-[23px] font-medium leading-snug">“짜증”과 “사실”을<br />분리하고 있어요</h2>
              </div>
              <div className="w-36 h-36 bg-gradient-to-b from-[#E2F5E1] to-[#C9EAC7] rounded-full flex items-center justify-center text-4xl shadow-sm">
                😐
              </div>
              <div className="text-[16px] font-mono text-[#7482FF] tracking-widest font-bold">
                {renderProgressText()}
              </div>
              <p className="text-[16px] text-gray-600 font-normal leading-relaxed">오늘의 뇌내 몬스터가<br />숨어있는지 확인 중...</p>
            </div>
          )}

          {/* [화면 2] 결과 화면 */}
          {step === "result" && (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-[18px] font-medium text-gray-800 pl-1">내가 쓴 기록</h3>
                <div className="bg-white p-5 rounded-2xl shadow-sm text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap break-all border border-gray-100">
                  조별과제 팀원들이 보여주는 기상천외한 행태는 현대 의학으로도 치료할 수 없는 만성 편두통의 근원입니다...
                </div>
              </section>

              <section className="space-y-2 cursor-pointer" onClick={() => setIsMirrorOpen(true)}>
                <h3 className="text-[18px] font-medium text-gray-800 pl-1">거울이 비춘 사실</h3>
                <div className="bg-white p-5 rounded-2xl shadow-sm text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap break-all border border-gray-100">
                  제시된 본문은 대학 조별과제 과정에서 발생하는 팀원들의 비협조적인 태도와 이로 인한 극심한 스트레스를...
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[18px] font-medium text-gray-800 pl-1">발견한 몬스터</h3>
                <div 
                  className="bg-white p-4 rounded-2xl shadow-sm flex items-center space-x-4 cursor-pointer border border-gray-100"
                  onClick={() => setIsMonsterGrowthOpen(true)}
                >
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-14 h-14 bg-[#E2F5E1] rounded-full flex items-center justify-center text-2xl">😐</div>
                    <span className="text-[11px] text-gray-500 mt-1 font-medium text-center max-w-[70px] break-all leading-tight">성장하는 현우 x2</span>
                  </div>
                  <div className="flex-1 flex flex-col space-y-1.5 text-[11px] text-gray-600 min-w-0">
                    <div className="bg-[#F2F3F8] p-2 rounded-xl whitespace-pre-wrap break-all leading-normal">
                      위기 관리 및 문제 해결 능력의 성장 (개인적 측면)
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button onClick={() => setStep("loading")} className="bg-[#949499] text-white py-3.5 rounded-2xl text-[16px] font-medium shadow-sm active:opacity-80 transition">
                  다시 생성
                </button>
                <button onClick={() => setStep("monster_discovery")} className="bg-black text-white py-3.5 rounded-2xl text-[16px] font-medium shadow-sm active:opacity-80 transition">
                  몬스터 보기
                </button>
              </div>
            </div>
          )}

          {/* [화면 3] 야생의 몬스터 발견 */}
          {step === "monster_discovery" && (
            <div className="flex flex-col items-center text-center pt-4 space-y-5">
              <h2 className="text-[20px] font-medium text-gray-900 tracking-tight">!야생의 몬스터 발견!</h2>
              <div className="w-32 h-32 bg-[#E2F5E1] rounded-full flex items-center justify-center text-5xl shadow-sm">😐</div>
              <div className="space-y-1">
                <h3 className="text-[22px] font-medium break-all">{MONSTER_DATA.namtat.name}</h3>
                <p className="text-[18px] text-gray-800 font-normal">{MONSTER_DATA.namtat.category}</p>
                <p className="text-[16px] text-gray-500 tracking-wider font-medium">{MONSTER_DATA.namtat.tier}</p>
              </div>
              <p className="text-[15px] font-normal text-gray-800 px-4 leading-relaxed whitespace-pre-wrap break-all">“문제의 원인을 주로 바깥에서 찾을 때<br />나타나는 몬스터예요.”</p>
              <div className="w-full space-y-2 text-center pt-2">
                <h4 className="font-medium text-[16px] text-gray-900">오늘의 출몰 이유</h4>
                <p className="text-[13px] text-gray-600 leading-relaxed px-2 whitespace-pre-wrap break-all">{MONSTER_DATA.namtat.reason}</p>
              </div>
              <button onClick={() => setStep("dogam")} className="w-full bg-black text-white py-3.5 rounded-2xl text-[16px] font-medium shadow-sm active:opacity-80 transition mt-4">
                도감으로 가기
              </button>
            </div>
          )}

          {/* [화면 4] 나의 뇌내 도감 */}
          {step === "dogam" && (
            <div className="space-y-6">
              <div className="space-y-0.5">
                <h2 className="text-[20px] font-medium">나의 뇌내 도감</h2>
                <p className="text-[14px] text-gray-500 font-medium">7 / 32 발견</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-[14px] font-medium text-gray-800 tracking-wide">이번 주 출몰 TOP 3</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div onClick={() => setSelectedMonsterDetail(true)} className="bg-white p-4 rounded-2xl text-center shadow-sm cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center min-w-0 border border-gray-100">
                    <div className="text-3xl mb-1.5">😐</div>
                    <div className="text-[12px] font-medium w-full truncate text-center">남탓대마왕</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">x 20</div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>

        {/* 간편 로그인 및 회원가입 영역 (로그인 상태일 때만 보이도록 유도하거나 하단 고정 가능) */}
        {step === "login" && (
          <div className="mt-auto">
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[12px] text-gray-400">또는 간편 로그인</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="flex flex-col gap-3">
              <button className="w-full h-[54px] rounded-2xl bg-white border border-gray-200 flex items-center justify-center gap-2.5 font-semibold text-[15px] text-gray-800">
                <GoogleIcon />
                Google로 계속하기
              </button>
            </div>

            <div className="mt-5 text-center text-[13px] text-gray-400">
              아직 계정이 없으신가요?{' '}
              <Link href="/terms" className="text-blue-500 font-semibold">회원가입</Link>
            </div>
          </div>
        )}
      </div>

      {/* 모달 오버레이 레이어 */}
      {isMirrorOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col justify-end max-w-sm mx-auto">
          <div className="absolute inset-0" onClick={() => setIsMirrorOpen(false)} />
          <div className="bg-white rounded-t-[28px] max-h-[80%] overflow-y-auto p-6 relative z-10 space-y-6 shadow-xl w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-[18px] font-medium">거울이 비춘 사실</h3>
              <button onClick={() => setIsMirrorOpen(false)} className="text-xl text-gray-400 p-1">✕</button>
            </div>
            <div className="space-y-4 text-[13px] leading-relaxed text-gray-700 whitespace-pre-wrap break-all">
              <p>대학 조별과제 수행 중 일부 구성원의 불성실한 태도로 인해 발생한 갈등과 운영 효율성 저하를 다루고 있습니다.</p>
            </div>
          </div>
        </div>
      )}

      {isMonsterGrowthOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col justify-end max-w-sm mx-auto">
          <div className="absolute inset-0" onClick={() => setIsMonsterGrowthOpen(false)} />
          <div className="bg-white rounded-t-[28px] p-6 relative z-10 space-y-6 shadow-xl max-h-[80%] overflow-y-auto w-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 bg-[#E2F5E1] rounded-full flex items-center justify-center text-xl">😐</div>
                <h3 className="text-[18px] font-medium break-all">성장하는 현우 x2</h3>
              </div>
              <button onClick={() => setIsMonsterGrowthOpen(false)} className="text-xl text-gray-400 p-1">✕</button>
            </div>
            <div className="space-y-4 text-[13px] leading-relaxed text-gray-500 whitespace-pre-wrap break-all">
              <h4 className="font-medium text-[14px] text-black">1. 위기 관리 및 문제 해결 능력의 성장</h4>
              <p>팀원들의 소통 거부, 결과물 미제출 등 악조건 속에서 주도권을 잡고 수습해 나가는 과정입니다.</p>
            </div>
          </div>
        </div>
      )}

      {selectedMonsterDetail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col justify-end max-w-sm mx-auto">
          <div className="absolute inset-0" onClick={() => setSelectedMonsterDetail(false)} />
          <div className="bg-white rounded-t-[28px] p-6 relative z-10 space-y-6 shadow-xl max-h-[85%] overflow-y-auto w-full">
            <div className="flex justify-between items-start relative">
              <div className="w-full flex flex-col items-center pt-2">
                <h3 className="text-[24px] font-medium break-all">{MONSTER_DATA.namtat.name}</h3>
                <div className="w-20 h-20 bg-[#E2F5E1] rounded-full flex items-center justify-center text-4xl my-3">😐</div>
                <p className="text-[14px] font-normal text-gray-500">{MONSTER_DATA.namtat.category}</p>
              </div>
              <button onClick={() => setSelectedMonsterDetail(false)} className="absolute right-0 top-2 text-xl text-gray-400 p-1">✕</button>
            </div>
            <div className="space-y-3 text-[13px] text-gray-500 whitespace-pre-wrap break-all leading-relaxed">
              <p>{MONSTER_DATA.namtat.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}