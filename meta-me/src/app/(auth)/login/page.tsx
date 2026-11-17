'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { useAuthStore } from '@/store';
import { loginDestination } from '@/lib/onboarding';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { ErrorText, Field, RememberRow } from '@/components/ui/Field';
import { AUTH_FOOTER, AuthHeader, FooterLink } from '@/components/ui/auth';

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

  // 칸이 비어 있지만 않으면 버튼을 켜 두고, 틀린 내용은 눌렀을 때 알려 준다.
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('이메일 형식을 확인해 주세요.');
      return;
    }
    // 가입할 때 비밀번호는 8자 이상이라, 그보다 짧으면 서버에 묻지 않고 바로 틀렸다고 알린다.
    if (password.length < 8) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await loginMutation.mutateAsync({ email: email.trim(), password });
      setAuth(res.access_token, res.refresh_token, res.user_id);
      try {
        if (rememberMe) localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      } catch {
        // 저장소를 못 쓰는 환경은 무시
      }
      if (rememberMe) await storeCredential(email, password);
      router.push(await loginDestination(res.user_id));
    } catch (err) {
      setSubmitting(false);
      // 인증 실패(401)와 서버·네트워크 오류를 구분해 안내한다.
      setError(
        err instanceof ApiError && (err.status === 401 || err.status === 400)
          ? '이메일 또는 비밀번호가 올바르지 않아요.'
          : '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
    }
  };

  return (
    <Screen
      footerClassName={AUTH_FOOTER}
      footer={
        <>
          <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? '로그인 중...' : '시작하기'}
          </Button>
          <FooterLink question="계정이 존재하지 않는다면?" label="회원가입" href="/terms" />
        </>
      }
    >
      <AuthHeader title="로그인" sub="이메일과 비밀번호를 입력하세요" backHref="/" />

      <form
        className="flex flex-col gap-5 px-6 mt-13"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Field
          label="이메일"
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setError('');
          }}
          placeholder="이메일을 입력해 주세요"
          name="email"
          id="email"
          autoComplete="username"
          error={!!error}
        />
        <div className="flex flex-col gap-2">
          <Field
            label="비밀번호"
            type="password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              setError('');
            }}
            placeholder="비밀번호를 입력해 주세요"
            name="password"
            id="password"
            autoComplete="current-password"
            error={!!error}
          />
          {/* 틀렸을 때 문구는 비밀번호 칸 바로 아래에 띄운다. */}
          {error && <ErrorText>{error}</ErrorText>}
        </div>
        <RememberRow checked={rememberMe} onChange={setRememberMe} />
        <button type="submit" className="hidden" />
      </form>
    </Screen>
  );
}
