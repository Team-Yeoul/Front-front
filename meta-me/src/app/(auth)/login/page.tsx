'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

  const emailValid = email.includes('@') && email.includes('.');
  const canSubmit = emailValid && password.length >= 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    router.push('/diary');
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="flex-1 px-6 pt-14 pb-10">
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">로그인</h1>
        <p className="text-sm text-gray-400 mb-8">이메일과 비밀번호를 입력하세요</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">이메일</label>
            <div className="flex items-center h-[52px] border border-gray-200 rounded-xl px-4 bg-gray-50 gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="flex-1 text-[15px] text-gray-900 bg-transparent outline-none placeholder:text-gray-300"
              />
              {emailValid && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">비밀번호</label>
            <div className="flex items-center h-[52px] border border-gray-200 rounded-xl px-4 bg-gray-50 gap-2">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="flex-1 text-[15px] text-gray-900 bg-transparent outline-none placeholder:text-gray-300"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400">
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember / Forgot */}
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setRemember(!remember)} className="flex items-center gap-2">
              <div className={`w-[18px] h-[18px] rounded border flex items-center justify-center ${remember ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
                {remember && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-[13px] text-gray-800">기억하기</span>
            </button>
            <button type="button" className="text-[13px] text-gray-400">비밀번호 찾으러 가기</button>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`mt-2 w-full h-14 rounded-2xl text-base font-semibold text-white transition-colors ${canSubmit ? 'bg-gray-900' : 'bg-gray-300'}`}
          >
            시작하기
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          계정이 존재하지 않는다면?{' '}
          <Link href="/terms" className="text-blue-500 font-semibold">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
