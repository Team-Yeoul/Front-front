'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignup, userApi } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { useAuthStore, useTermsStore } from '@/store';
import { DatePicker } from '@/components/DatePicker';

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { service, privacy, marketing } = useTermsStore();
  const resetTerms = useTermsStore((s) => s.reset);
  const signupMutation = useSignup();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const loading = signupMutation.isPending;
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!submittedRef.current && (!service || !privacy)) router.replace('/terms');
  }, [service, privacy, router]);

  const emailValid = email.includes('@') && email.includes('.');
  const canSubmit = emailValid && password.length >= 8 && birthDate.length > 0 && service && privacy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setError('');
    try {
      const res = await signupMutation.mutateAsync({ email, password, birth_date: birthDate });
      setAuth(res.access_token, res.refresh_token, res.user_id);
      try {
        const current = await userApi.getNotificationSettings();
        await userApi.updateNotificationSettings({ ...current, marketing_enabled: marketing });
      } catch {
        // 알림 설정 저장 실패는 가입 자체를 막지 않음
      }
      submittedRef.current = true;
      resetTerms();
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center px-5 h-[52px] shrink-0">
        <Link href="/" className="flex items-center gap-1.5 text-[15px] font-bold text-gray-900 lowercase">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="w-5 h-5 object-contain" />
          metame
        </Link>
      </div>

      <div className="flex flex-col px-5 pt-2 pb-6 gap-5">
        {/* 타이틀 */}
        <div>
          <h2 className="text-[22px] font-bold text-gray-900 leading-tight">회원가입</h2>
          <p className="text-[13px] text-gray-400 mt-2">정보를 입력해 계정을 생성하세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* 닉네임 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">닉네임</label>
            <div className="flex items-center h-[52px] border border-gray-200 rounded-xl px-4 bg-gray-50 gap-3">
              <input
                type="text"
                value={nickname}
                maxLength={10}
                onChange={e => setNickname(e.target.value)}
                placeholder="사용할 이름을 작성해 주세요"
                className="flex-1 text-[15px] bg-transparent outline-none placeholder:text-gray-300"
              />
              <span className="text-[12px] text-gray-300 shrink-0">{nickname.length}/10</span>
            </div>
          </div>

          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">이메일</label>
            <div className="flex items-center h-[52px] border border-gray-200 rounded-xl px-4 bg-gray-50 gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 text-[15px] bg-transparent outline-none placeholder:text-gray-300"
              />
              {emailValid && (
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="shrink-0">
                  <path d="M1 6l4.5 4.5L15 1" stroke="#22C55E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">비밀번호</label>
            <div className="flex items-center h-[52px] border border-gray-200 rounded-xl px-4 bg-gray-50 gap-3">
              <svg width="16" height="19" viewBox="0 0 16 19" fill="none">
                <rect x="0.75" y="7.75" width="14.5" height="10.5" rx="2.25" stroke="#9CA3AF" strokeWidth="1.5"/>
                <path d="M4 8V5.5C4 3.01 5.79 1 8 1S12 3.01 12 5.5V8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="8자 이상 입력"
                className="flex-1 text-[15px] bg-transparent outline-none placeholder:text-gray-300"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-300 shrink-0">
                <svg width="20" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* 생년월일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">생년월일</label>
            <div className="flex items-center h-[52px] border border-gray-200 rounded-xl px-4 bg-gray-50 gap-3">
              <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
                <rect x="1" y="3" width="16" height="14" rx="2" stroke="#9CA3AF" strokeWidth="1.5"/>
                <path d="M1 7H17M5 1V4.5M13 1V4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <DatePicker value={birthDate} onChange={setBirthDate} />
            </div>
          </div>

          {/* 기억하기 */}
          <label className="flex items-center gap-2 -mt-1">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-[18px] h-[18px] rounded accent-[#8287FF]"
            />
            <span className="text-[13px] text-gray-500">기억하기</span>
          </label>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          {/* 시작하기 버튼 */}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`w-full h-[54px] rounded-2xl text-[15px] font-semibold transition-colors ${
              canSubmit && !loading ? 'bg-[#8287FF] text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            {loading ? '가입 중...' : '시작하기'}
          </button>
        </form>

        {/* 로그인 링크 */}
        <div className="text-center text-[13px] text-gray-400">
          계정이 존재한다면?{' '}
          <Link href="/login" className="text-[#8287FF] font-semibold">로그인</Link>
        </div>
      </div>
    </div>
  );
}
