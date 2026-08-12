'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useLogin } from '@/entities/user';
import { ApiError } from '@/shared/api';
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

function CheckBadgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="8" fill="#4CAF6D" />
      <path d="M4.5 8.2L6.8 10.5L11.5 5.5" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeToggleIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#A9ACB6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="1" y1="1" x2="23" y2="23" stroke="#A9ACB6" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M1 9C1 9 4 3.5 9 3.5C14 3.5 17 9 17 9C17 9 14 14.5 9 14.5C4 14.5 1 9 1 9Z" stroke="#A9ACB6" strokeWidth="1.4" fill="none" />
      <circle cx="9" cy="9" r="2.4" stroke="#A9ACB6" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <div
      className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center shrink-0 border-[1.5px] transition-colors"
      style={{
        background: checked ? '#8287FF' : '#FFFFFF',
        borderColor: checked ? '#8287FF' : '#D8D9E0',
      }}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 12 10">
          <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const emailValid = email.includes('@') && email.includes('.');
  const canSubmit = emailValid && password.length >= 6;
  const loading = login.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setError('');
    login.mutate(
      { email, password },
      {
        onSuccess: (res) => {
          setAuth(res.access_token, res.refresh_token, res.user_id);
          router.push('/main');
        },
        onError: (err) => {
          const message =
            err instanceof ApiError ? err.message : '이메일 또는 비밀번호가 올바르지 않습니다.';
          setError(message);
        },
      },
    );
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F2F2F7] px-7">
      {/* 로고 영역 */}
      <div className="flex flex-col items-center mt-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="MetaMe" className="h-11 w-auto" />
        <p className="text-[14px] text-[#8A8D9A] mt-3.5">이메일과 비밀번호를 입력해주세요</p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-10">
        {/* 이메일 */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-[#4B4E5C]">이메일</label>
          <div className="relative flex items-center">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="내용을 입력하세요"
              autoComplete="email"
              suppressHydrationWarning
              className="h-12 w-full rounded-xl border border-[#E3E4EA] pl-4 pr-10 text-[14px] text-[#1C1D24] bg-[#FAFAFC] outline-none focus:border-[#8287FF] focus:bg-white placeholder:text-[#A9ACB6]"
            />
            <div className="absolute right-4 pointer-events-none">
              <CheckBadgeIcon />
            </div>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-[#4B4E5C]">비밀번호</label>
          <div className="relative flex items-center">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="내용을 입력하세요"
              autoComplete="current-password"
              suppressHydrationWarning
              className="h-12 w-full rounded-xl border border-[#E3E4EA] pl-4 pr-10 text-[14px] text-[#1C1D24] bg-[#FAFAFC] outline-none focus:border-[#8287FF] focus:bg-white placeholder:text-[#A9ACB6]"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 flex items-center justify-center"
              aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              <EyeToggleIcon visible={showPw} />
            </button>
          </div>
        </div>

        {/* 기억하기 / 비밀번호 찾기 */}
        <div className="flex items-center justify-between -mt-1">
          <button type="button" onClick={() => setRemember(!remember)} className="flex items-center gap-2">
            <CheckboxIcon checked={remember} />
            <span className="text-[13px] text-[#4B4E5C]">기억하기</span>
          </button>
          <button type="button" className="text-[13px] font-medium text-[#8A8D9A]">
            비밀번호 찾으러 가기
          </button>
        </div>

        {error && <p className="text-[13px] text-[#E2483F] -mt-1">{error}</p>}

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className={`mt-2 h-12 rounded-2xl text-[16px] font-bold text-white transition-colors ${
            canSubmit && !loading ? 'bg-[#8287FF] hover:bg-[#6a6ff0]' : 'bg-[#D8D9E0]'
          }`}
        >
          {loading ? '로그인 중...' : '시작하기'}
        </button>
      </form>

      {/* 구분선 */}
      <div className="flex items-center gap-3 mt-6">
        <div className="flex-1 h-px bg-[#EDEDF2]" />
        <span className="text-[12px] text-[#8A8D9A]">또는 간편 로그인</span>
        <div className="flex-1 h-px bg-[#EDEDF2]" />
      </div>

      {/* 구글 로그인 */}
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/main' })}
        className="mt-4 h-12 rounded-2xl bg-white border border-[#E3E4EA] flex items-center justify-center gap-2.5 font-semibold text-[14px] text-[#1C1D24]"
      >
        <GoogleIcon />
        Google로 계속하기
      </button>

      {/* 회원가입 링크 */}
      <div className="flex-1" />
      <div className="flex justify-center gap-1.5 pb-8 pt-6">
        <span className="text-[13px] text-[#8A8D9A]">계정이 존재하지 않는다면?</span>
        <Link href="/terms" className="text-[13px] font-bold text-[#6266E8]">회원가입</Link>
      </div>
    </div>
  );
}
