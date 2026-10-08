'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLogin, userApi } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { useAuthStore, useLocalStore } from '@/store';
import { isOnboardingMissing } from '@/lib/onboarding';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button } from '@/components/ui/primitives';
import { Field, RememberRow } from '@/components/ui/Field';
import { GoogleIcon, Wordmark } from '@/components/ui/brand';

/** '기억하기'로 저장해 두는 이메일. 비밀번호는 앱이 직접 저장하지 않고 브라우저 비밀번호 관리자에 맡긴다. */
const REMEMBERED_EMAIL_KEY = 'metame-remembered-email';

/** 로그인에 성공한 계정을 브라우저 비밀번호 관리자에 저장해 달라고 요청한다. (Chrome·Edge 등 지원 브라우저만) */
async function storeCredential(email: string, password: string) {
  const Ctor = (window as unknown as { PasswordCredential?: new (data: { id: string; password: string }) => Credential }).PasswordCredential;
  if (!Ctor || !navigator.credentials) return;
  try {
    await navigator.credentials.store(new Ctor({ id: email, password }));
  } catch {
    // 사용자가 거절했거나 브라우저가 막은 경우: 로그인 자체에는 영향 없음
  }
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  // 로그인 API 뒤에 비밀번호 저장·온보딩 확인까지 기다리므로, 처리 전체를 기준으로 버튼을 막는다.
  const [submitting, setSubmitting] = useState(false);
  const loading = submitting || loginMutation.isPending;

  // 지난번에 '기억하기'로 로그인했다면 이메일을 미리 채운다.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (saved) setEmail(saved);
    } catch {
      // 저장소를 못 쓰는 환경(시크릿 모드 등)은 무시
    }
  }, []);

  const canSubmit = email.includes('@') && email.includes('.') && password.length >= 8; // 명세상 비밀번호는 8자 이상

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await loginMutation.mutateAsync({ email, password });
      setAuth(res.access_token, res.refresh_token, res.user_id);
      try {
        if (rememberMe) localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      } catch {
        // 저장소를 못 쓰는 환경은 무시
      }
      if (rememberMe) await storeCredential(email, password);
      // 서버에 온보딩 기록이 없고(ONBOARDING_NOT_FOUND) 이 기기에서도 마친 적이 없을 때만 온보딩으로 보낸다.
      const doneHere = !!useLocalStore.getState().byUser[res.user_id]?.onboardedAt;
      let missing = false;
      if (!doneHere) {
        try {
          await userApi.getOnboardingResult();
        } catch (err) {
          missing = isOnboardingMissing(err);
        }
      }
      router.push(missing ? '/onboarding' : '/main');
    } catch (err) {
      setSubmitting(false);
      // 인증 실패(401)와 서버·네트워크 오류를 구분해 안내한다.
      setError(
        err instanceof ApiError && (err.status === 401 || err.status === 400)
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
    }
  };

  return (
    <Screen
      footer={
        <div className="flex flex-col gap-3">
          <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
          <Button variant="gray" className="relative font-medium">
            <span className="absolute left-7">
              <GoogleIcon />
            </span>
            Google로 시작하기
          </Button>
          <p className="text-center text-[14px] font-semibold text-ink mt-1">
            계정이 존재하지 않는다면?
            <Link href="/terms" className="text-primary">
              회원가입
            </Link>
          </p>
        </div>
      }
    >
      <div className="px-5 pt-2">
        <BackButton href="/" />
        <div className="mt-4">
          <Wordmark />
        </div>
        <h1 className="text-[28px] font-bold text-ink mt-4">로그인</h1>
        <p className="text-[14px] text-sub mt-1.5">이메일과 비밀번호를 입력하세요</p>

        <form
          className="flex flex-col gap-6 mt-12"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Field label="이메일" type="email" value={email} onChange={setEmail} placeholder="이메일을 입력해 주세요" name="email" id="email" autoComplete="username" />
          <div className="flex flex-col gap-4">
            <Field label="비밀번호" type="password" value={password} onChange={setPassword} placeholder="비밀번호를 입력해 주세요" name="password" id="password" autoComplete="current-password" />
            <RememberRow checked={rememberMe} onChange={setRememberMe} />
          </div>
          {error && <p className="text-[13px] text-danger -mt-2">{error}</p>}
          <button type="submit" className="hidden" />
        </form>
      </div>
    </Screen>
  );
}
