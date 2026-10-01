'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignup, userApi } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { useAuthStore, useLocalStore, useTermsStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button } from '@/components/ui/primitives';
import { Field, RememberRow } from '@/components/ui/Field';
import { BirthDateField } from '@/components/ui/BirthDateField';
import { Wordmark } from '@/components/ui/brand';

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { service, privacy, marketing } = useTermsStore();
  const resetTerms = useTermsStore((s) => s.reset);
  const signupMutation = useSignup();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // v2 시안에는 생년월일 칸이 없지만, 가입 API(/v1/auth/signup)가 birth_date를 필수로 받아서 유지한다.
  const [birthDate, setBirthDate] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const loading = signupMutation.isPending;
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!submittedRef.current && (!service || !privacy)) router.replace('/terms');
  }, [service, privacy, router]);

  const passwordError = password.length > 0 && !PASSWORD_RULE.test(password) ? '영문·숫자 조합 8자 이상으로 입력해 주세요' : undefined;
  const canSubmit =
    nickname.trim().length > 0 && email.includes('@') && email.includes('.') && PASSWORD_RULE.test(password) && birthDate.length > 0 && service && privacy;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setError('');
    try {
      const res = await signupMutation.mutateAsync({ email, password, birth_date: birthDate });
      setAuth(res.access_token, res.refresh_token, res.user_id);
      // 가입 API가 닉네임을 받지 않아 기기에 저장해 마이페이지 등에서 쓴다.
      if (nickname.trim()) useLocalStore.getState().update(res.user_id, (u) => ({ ...u, nickname: nickname.trim() }));
      try {
        const current = await userApi.getNotificationSettings();
        await userApi.updateNotificationSettings({ ...current, marketing_consent: marketing });
      } catch {
        // 알림 설정 저장 실패는 가입 자체를 막지 않음
      }
      submittedRef.current = true;
      resetTerms();
      router.push('/notifications');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Screen
      footer={
        <div className="flex flex-col gap-3">
          <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? '가입 중...' : '시작하기'}
          </Button>
          <p className="text-center text-[14px] font-semibold text-ink">
            계정이 존재한다면?
            <Link href="/login" className="text-primary">
              로그인
            </Link>
          </p>
        </div>
      }
    >
      <div className="px-5 pt-2 pb-6">
        <BackButton href="/terms" />
        <div className="mt-4">
          <Wordmark />
        </div>
        <h1 className="text-[28px] font-bold text-ink mt-4">회원가입</h1>
        <p className="text-[14px] text-sub mt-1.5">정보를 입력해 계정을 생성하세요</p>

        <div className="flex flex-col gap-6 mt-12">
          <Field label="닉네임" value={nickname} onChange={setNickname} maxLength={10} placeholder="사용할 이름을 작성해 주세요" />
          <Field label="이메일" type="email" value={email} onChange={setEmail} placeholder="이메일을 입력해 주세요" autoComplete="email" />
          <div className="flex flex-col gap-4">
            <Field
              label="비밀번호"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="비밀번호를 입력해 주세요"
              autoComplete="new-password"
              error={passwordError}
            />
            <RememberRow checked={rememberMe} onChange={setRememberMe} />
          </div>
          <BirthDateField value={birthDate} onChange={setBirthDate} />
          {error && <p className="text-[13px] text-danger -mt-2">{error}</p>}
        </div>
      </div>
    </Screen>
  );
}
