'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { login } from '@/lib/api';
import { useAuthStore } from '@/store';

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

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailValid = email.includes('@') && email.includes('.');
  const canSubmit = emailValid && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      setAuth(res.access_token, res.refresh_token, res.user_id);
      router.push('/main');
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center px-4 h-[52px] border-b border-gray-100 shrink-0">
        <Link href="/" className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <span className="flex-1 text-center text-[16px] font-semibold text-gray-900 pr-8">로그인</span>
      </div>

      <div className="flex flex-col px-5 pt-8 pb-6">
      {/* 로고 영역 */}
      <div className="flex flex-col items-center mb-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="MetaMe" className="h-12 w-auto" />
        <h1 className="text-[22px] font-bold text-gray-900 mt-3">MetaMe</h1>
        <p className="text-[13px] text-gray-400 mt-1">MetaMe에 오신걸 환영합니다^^</p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              className="flex-1 text-[15px] text-gray-900 bg-transparent outline-none placeholder:text-gray-300"
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
              placeholder="비밀번호 입력"
              className="flex-1 text-[15px] text-gray-900 bg-transparent outline-none placeholder:text-gray-300"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-300 shrink-0">
              {showPw ? (
                <svg width="20" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 비밀번호 찾기 */}
        <div className="flex justify-end -mt-1">
          <button type="button" className="text-[13px] text-blue-500 font-medium">
            비밀번호를 잊으셨나요?
          </button>
        </div>

        {error && <p className="text-[13px] text-red-500 -mt-1">{error}</p>}

        {/* 로그인 버튼 */}
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

      {/* 구분선 */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[12px] text-gray-400">또는 간편 로그인</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 소셜 로그인 */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/main' })}
          className="w-full h-[54px] rounded-2xl bg-white border border-gray-200 flex items-center justify-center gap-2.5 font-semibold text-[15px] text-gray-800"
        >
          <GoogleIcon />
          Google로 계속하기
        </button>
      </div>

      {/* 회원가입 링크 */}
      <div className="mt-5 text-center text-[13px] text-gray-400">
        아직 계정이 없으신가요?{' '}
        <Link href="/terms" className="text-blue-500 font-semibold">회원가입</Link>
      </div>
      </div>
    </div>
  );
}
