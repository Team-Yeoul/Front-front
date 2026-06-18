'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signup } from '@/lib/api';
import { useAuthStore } from '@/store';

function KakaoIcon() {
  return (
    <svg width="22" height="21" viewBox="0 0 22 21" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 0C4.925 0 0 3.96 0 8.85c0 3.15 2.003 5.92 5.028 7.51l-1.32 5.13c-.12.46.397.83.79.56l6.128-4.09c.31.03.63.04.95.04 6.075 0 11-3.97 11-8.85C22.58 3.96 17.075 0 11 0z"
        fill="#3C1E1E"
      />
    </svg>
  );
}

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

function AppleIcon() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="white">
      <path d="M15.24 11.65c-.02-2.47 2.02-3.66 2.11-3.72-1.15-1.68-2.94-1.91-3.58-1.93-1.53-.15-2.98.9-3.75.9-.77 0-1.97-.88-3.24-.85C4.97 6.08 3.07 7.04 2.04 8.66 0 11.96.96 16.81 3 19.17c.99 1.45 2.17 3.07 3.72 3.01 1.49-.06 2.06-.97 3.87-.97s2.32.97 3.9.94c1.61-.03 2.63-1.46 3.62-2.91a10.8 10.8 0 0 0 1.63-3.38c-.04-.02-3.47-1.33-3.5-5.21zM12.86 4.14c.84-1 1.4-2.39 1.25-3.78-1.2.05-2.67.8-3.53 1.79-.77.9-1.45 2.33-1.27 3.7 1.34.1 2.71-.68 3.55-1.71z"/>
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nameValid = name.trim().length > 0;
  const emailValid = email.includes('@') && email.includes('.');
  const canSubmit = nameValid && emailValid && password.length >= 8 && termsAgreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await signup({ name, email, password });
      setAuth(res.access_token, res.refresh_token, res.user_id);
      router.push('/onboarding');
    } catch {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center px-4 h-[52px] border-b border-gray-100 shrink-0">
        <Link href="/login" className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <span className="flex-1 text-center text-[16px] font-semibold text-gray-900 pr-8">회원가입</span>
      </div>

      <div className="flex flex-col px-5 pt-5 pb-6 gap-5">
        {/* 타이틀 */}
        <div>
          <h2 className="text-[24px] font-bold text-gray-900 leading-tight">
            나를 발견하는 여정,<br />지금 시작해요
          </h2>
          <p className="text-[13px] text-gray-400 mt-2">MetaMe와 함께 내 안의 OOO를 만나보세요</p>
        </div>

        {/* 소셜 로그인 */}
        <div className="flex flex-col gap-3">
          <button className="w-full h-[52px] rounded-2xl bg-[#FEE500] flex items-center justify-center gap-2.5 font-semibold text-[15px] text-gray-900">
            <KakaoIcon />
            카카오톡으로 계속하기
          </button>
          <button className="w-full h-[52px] rounded-2xl bg-white border border-gray-200 flex items-center justify-center gap-2.5 font-semibold text-[15px] text-gray-800">
            <GoogleIcon />
            Google로 계속하기
          </button>
          <button className="w-full h-[52px] rounded-2xl bg-gray-900 flex items-center justify-center gap-2.5 font-semibold text-[15px] text-white">
            <AppleIcon />
            Apple로 계속하기
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[12px] text-gray-400">또는 이메일로 가입</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">이메일</label>
            <div className="flex items-center h-[52px] border border-gray-200 rounded-xl px-4 bg-gray-50 gap-3">
              <svg width="18" height="15" viewBox="0 0 18 15" fill="none">
                <rect x="0.75" y="0.75" width="16.5" height="13.5" rx="2.25" stroke="#9CA3AF" strokeWidth="1.5"/>
                <path d="M1 3.5L9 8.5L17 3.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 text-[15px] bg-transparent outline-none placeholder:text-gray-300"
              />
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

          {/* 닉네임 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">닉네임</label>
            <div className="flex items-center h-[52px] border border-gray-200 rounded-xl px-4 bg-gray-50 gap-3">
              <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
                <circle cx="9" cy="5.5" r="4" stroke="#9CA3AF" strokeWidth="1.5"/>
                <path d="M1 18C1 14.134 4.686 11 9 11S17 14.134 17 18" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="앱에서 사용할 이름"
                className="flex-1 text-[15px] bg-transparent outline-none placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* 약관 동의 체크박스 */}
          <button
            type="button"
            onClick={() => setTermsAgreed(!termsAgreed)}
            className="flex items-center gap-2.5 py-1"
          >
            <div className={`w-[20px] h-[20px] rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-colors ${
              termsAgreed ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white'
            }`}>
              {termsAgreed && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-[13px] text-gray-700 text-left">
              <span className="text-red-500 font-semibold">[필수]</span>{' '}
              이용약관 및 개인정보 처리방침 동의
            </span>
          </button>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          {/* 가입하기 버튼 */}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`w-full h-[54px] rounded-2xl text-[15px] font-semibold transition-colors ${
              canSubmit && !loading ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>

        {/* 로그인 링크 */}
        <div className="text-center text-[13px] text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-blue-500 font-semibold">로그인</Link>
        </div>
      </div>
    </div>
  );
}
