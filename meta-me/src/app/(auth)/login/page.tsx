'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLogin, userApi } from '@/entities/user';
import { useAuthStore, useLocalStore } from '@/store';
import { isOnboardingMissing } from '@/lib/onboarding';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button } from '@/components/ui/primitives';
import { Field, RememberRow } from '@/components/ui/Field';
import { GoogleIcon, Wordmark } from '@/components/ui/brand';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const loading = loginMutation.isPending;

  const canSubmit = email.includes('@') && email.includes('.') && password.length >= 6;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setError('');
    try {
      const res = await loginMutation.mutateAsync({ email, password });
      setAuth(res.access_token, res.refresh_token, res.user_id);
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
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
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
          <Field label="이메일" type="email" value={email} onChange={setEmail} placeholder="이메일을 입력해 주세요" autoComplete="email" />
          <div className="flex flex-col gap-4">
            <Field label="비밀번호" type="password" value={password} onChange={setPassword} placeholder="비밀번호를 입력해 주세요" autoComplete="current-password" />
            <RememberRow checked={rememberMe} onChange={setRememberMe} />
          </div>
          {error && <p className="text-[13px] text-danger -mt-2">{error}</p>}
          <button type="submit" className="hidden" />
        </form>
      </div>
    </Screen>
  );
}
