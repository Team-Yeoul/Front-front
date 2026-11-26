'use client';

import { useEffect, useRef, useState } from 'react';
import { useSignup, userApi } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { beginAuthAttempt, isLatestAuthAttempt, useAuthStore, useLocalStore, useTermsStore } from '@/store';
import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { Field, PasswordStrength } from '@/components/ui/Field';
import { BirthDateField } from '@/components/ui/BirthDateField';
import { AuthHeader, FooterLink, OrDivider } from '@/components/ui/auth';
import { MailIcon, PadlockIcon, UserIcon } from '@/components/ui/icons';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { useTextCheck } from '@/lib/textQuality';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/rn';
import { useTheme } from '@/lib/theme';

// 명세상 비밀번호는 8~64자
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 만 14세 미만은 법정대리인 동의가 있어야 하는데, 아직 보호자 동의를 받는 기능(서버 포함)이 없어 가입을 막는다. */
const MIN_AGE = 14;
/** 'YYYY-MM-DD' → 오늘 기준 만 나이 */
function ageOf(birth: string, today = new Date()) {
  const [y, m, d] = birth.split('-').map(Number);
  if (!y || !m || !d) return null;
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
}

export default function SignupScreen() {
  const { fg } = useTheme();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { service, privacy, sensitive, marketing } = useTermsStore();
  const resetTerms = useTermsStore((s) => s.reset);
  const signupMutation = useSignup();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 강도 막대는 비밀번호 칸을 한 번 누르면 보여 준다.
  const [pwTouched, setPwTouched] = useState(false);
  // v2 시안에는 생년월일 칸이 없지만, 가입 API(/v1/auth/signup)가 birth_date를 필수로 받아서 유지한다.
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  // 가입 API 뒤에 알림 설정 저장까지 기다리므로, mutation 상태가 아니라 처리 전체를 기준으로 버튼을 막는다.
  const [submitting, setSubmitting] = useState(false);
  const loading = submitting || signupMutation.isPending;
  // Google로 가입하는 중이면 이메일 가입을 막고, 이메일 가입 중이면 Google 버튼을 막는다.
  const [googleBusy, setGoogleBusy] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!submittedRef.current && (!service || !privacy || !sensitive)) router.replace('/terms');
  }, [service, privacy, sensitive]);

  // 닉네임이 자음만·같은 글자 반복 등 알아볼 수 없는 글이면 막는다(한 글자 이름은 허용).
  const nicknameCheck = useTextCheck(nickname, true, { minLetters: 1 });
  const emailError = email.length > 0 && !EMAIL_RULE.test(email) ? '이메일 형식을 확인해 주세요' : undefined;
  // 강도 막대가 보이니, 오류 문구는 8자 이상인데 영문·숫자 조건을 못 채웠을 때만 띄운다.
  const passwordError = password.length >= 8 && !PASSWORD_RULE.test(password) ? '영문과 숫자를 함께 넣어 주세요' : undefined;
  const age = birthDate ? ageOf(birthDate) : null;
  const underAge = age !== null && age < MIN_AGE;
  const canSubmit =
    nickname.trim().length > 0 &&
    !nicknameCheck.invalid &&
    EMAIL_RULE.test(email) &&
    PASSWORD_RULE.test(password) &&
    birthDate.length > 0 &&
    !underAge &&
    service &&
    privacy &&
    sensitive;

  const handleSubmit = async () => {
    if (!canSubmit || loading || googleBusy) return;
    const attempt = beginAuthAttempt();
    setSubmitting(true);
    setError('');
    try {
      // 닉네임을 계정 이름(username)으로 저장해, 다른 기기에서도 초대 링크 등에 같은 이름이 쓰이게 한다.
      const res = await signupMutation.mutateAsync({ email, password, birth_date: birthDate, username: nickname.trim() });
      // 그사이 다른 로그인이 시작됐다면 이 응답으로 세션을 바꾸지 않는다(버튼만 다시 누를 수 있게 풀어 둔다).
      if (!isLatestAuthAttempt(attempt)) {
        setSubmitting(false);
        return;
      }
      submittedRef.current = true;
      setAuth(res.access_token, res.refresh_token, res.user_id);
      // 계정 정보를 받기 전에도 바로 보이도록 기기에도 저장해 둔다.
      // 약관 화면에서 받은 민감정보 처리 동의도 함께 남긴다.
      useLocalStore.getState().update(res.user_id, (u) => ({
        ...u,
        nickname: nickname.trim(),
        sensitiveConsent: { agreed: true, at: new Date().toISOString() },
      }));
      // 약관 동의를 서버에도 저장한다. 서버는 민감정보 동의가 없으면 온보딩·기록을 403으로 막는다.
      // 실패해도 가입은 진행하고, 앱에 들어갈 때 기기 기록으로 다시 맞춘다(syncSensitiveConsent).
      try {
        await userApi.updateConsents({
          consents: [
            { consent_type: 'SERVICE', agreed: service },
            { consent_type: 'PRIVACY', agreed: privacy },
            { consent_type: 'SENSITIVE', agreed: sensitive },
            { consent_type: 'MARKETING', agreed: marketing },
          ],
        });
      } catch {
        // 위 주석 참고
      }
      try {
        const current = await userApi.getNotificationSettings();
        // 설정을 받는 사이 다른 로그인이 시작됐거나 계정이 바뀌었다면 그 계정의 설정을 건드리지 않는다.
        if (isLatestAuthAttempt(attempt) && useAuthStore.getState().userId === res.user_id) {
          await userApi.updateNotificationSettings({ ...current, marketing_consent: marketing });
        }
      } catch {
        // 알림 설정 저장 실패는 가입 자체를 막지 않음
      }
      resetTerms();
      if (isLatestAuthAttempt(attempt)) router.replace('/notifications');
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Screen
      footer={
        <View>
          <Button onPress={handleSubmit} disabled={!canSubmit || googleBusy} loading={loading}>
            시작하기
          </Button>
          <OrDivider />
          <GoogleLoginButton variant="outline" disabled={loading} onBusyChange={setGoogleBusy} />
          <FooterLink question="계정이 존재한다면?" label="로그인" href="/login" />
        </View>
      }
    >
      <AuthHeader title="계정을 만들어 주세요" sub="메타미에서 불릴 이름과 로그인 정보를 정해 주세요." backHref="/terms" />
      <View className="px-6 mt-7 pb-6 gap-3">
        <Field
          label="닉네임"
          value={nickname}
          onChange={setNickname}
          maxLength={10}
          placeholder="닉네임"
          error={nicknameCheck.hint ?? undefined}
          icon={(f) => <UserIcon color={f || nickname ? fg('#1A1A1E') : fg('#A1A1AA')} />}
        />
        <Field
          label="이메일"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="이메일"
          autoComplete="email"
          textContentType="emailAddress"
          error={emailError}
          icon={(f) => <MailIcon color={f || email ? fg('#1A1A1E') : fg('#A1A1AA')} />}
        />
        <View className="gap-2.5">
          <Field
            label="비밀번호"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호"
            onFocus={() => setPwTouched(true)}
            autoComplete="new-password"
            textContentType="newPassword"
            error={passwordError}
            icon={(f) => <PadlockIcon color={f || password ? fg('#1A1A1E') : fg('#A1A1AA')} />}
          />
          {(pwTouched || !!password) && !passwordError && <PasswordStrength password={password} />}
        </View>
        <View className="gap-2">
          <BirthDateField label="생년월일" value={birthDate} onChange={setBirthDate} />
          <Text className={`text-[12px] ${underAge ? 'text-danger' : 'text-sub'}`}>
            {underAge ? '만 14세 미만은 아직 가입할 수 없어요. 보호자 동의 기능을 준비하고 있어요.' : '만 14세 이상만 가입할 수 있어요'}
          </Text>
        </View>
        {!!error && <Text className="text-[12px] text-danger">{error}</Text>}
      </View>
    </Screen>
  );
}
