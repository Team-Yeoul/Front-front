'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignup, userApi } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { useAuthStore, useLocalStore, useTermsStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { ErrorText, Field, PasswordStrength } from '@/components/ui/Field';
import { BirthDateField } from '@/components/ui/BirthDateField';
import { AUTH_FOOTER, AuthHeader, FooterLink } from '@/components/ui/auth';

// 명세상 비밀번호는 8~64자
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { service, privacy, sensitive, marketing } = useTermsStore();
  const resetTerms = useTermsStore((s) => s.reset);
  const signupMutation = useSignup();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // v2 시안에는 생년월일 칸이 없지만, 가입 API(/v1/auth/signup)가 birth_date를 필수로 받아서 유지한다.
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  // 가입 API 뒤에 알림 설정 저장까지 기다리므로, mutation 상태가 아니라 처리 전체를 기준으로 버튼을 막는다.
  const [submitting, setSubmitting] = useState(false);
  const loading = submitting || signupMutation.isPending;
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!submittedRef.current && (!service || !privacy || !sensitive)) router.replace('/terms');
  }, [service, privacy, sensitive, router]);

  const emailError = email.length > 0 && !EMAIL_RULE.test(email) ? '이메일 형식을 확인해 주세요' : undefined;
  // 강도 막대가 늘 보이니, 오류 문구는 가입 조건(영문·숫자 8자 이상)을 못 채운 채 길이가 8자 이상일 때만 띄운다.
  const passwordError = password.length >= 8 && !PASSWORD_RULE.test(password) ? '영문과 숫자를 함께 넣어 주세요' : undefined;
  const canSubmit =
    nickname.trim().length > 0 && EMAIL_RULE.test(email) && PASSWORD_RULE.test(password) && birthDate.length > 0 && service && privacy && sensitive;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setSubmitting(true);
    setError('');
    try {
      // 닉네임을 계정 이름(username)으로 저장해, 다른 기기에서도 초대 링크 등에 같은 이름이 쓰이게 한다.
      const res = await signupMutation.mutateAsync({ email, password, birth_date: birthDate, username: nickname.trim() });
      setAuth(res.access_token, res.refresh_token, res.user_id);
      // 계정 정보를 받기 전에도 바로 보이도록 기기에도 저장해 둔다.
      // 약관 화면에서 받은 민감정보 처리 동의도 함께 남긴다(서버에 동의 API가 아직 없음).
      useLocalStore.getState().update(res.user_id, (u) => ({
        ...u,
        nickname: nickname.trim(),
        sensitiveConsent: { agreed: true, at: new Date().toISOString() },
      }));
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
      setSubmitting(false);
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Screen
      footerClassName={AUTH_FOOTER}
      footer={
        <>
          <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? '가입 중...' : '시작하기'}
          </Button>
          <FooterLink question="계정이 존재한다면?" label="로그인" href="/login" />
        </>
      }
    >
      <AuthHeader title="회원가입" sub="정보를 입력해 계정을 생성하세요" backHref="/terms" />

      <div className="flex flex-col gap-5 px-6 mt-13 pb-6">
        <Field label="닉네임" value={nickname} onChange={setNickname} maxLength={10} placeholder="사용할 이름을 작성해 주세요" />
        <Field label="이메일" type="email" value={email} onChange={setEmail} placeholder="이메일을 입력해 주세요" autoComplete="email" error={emailError} />
        <div className="flex flex-col gap-2.5">
          <Field
            label="비밀번호"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호를 입력해 주세요"
            autoComplete="new-password"
            error={passwordError}
          />
          {password && !passwordError && <PasswordStrength password={password} />}
        </div>
        <div className="flex flex-col gap-2">
          <BirthDateField value={birthDate} onChange={setBirthDate} />
          <p className="text-[13px] text-[#8A8A96]">만 14세 미만은 보호자 동의 후 가입할 수 있어요</p>
        </div>
        {error && <ErrorText>{error}</ErrorText>}
      </div>
    </Screen>
  );
}
