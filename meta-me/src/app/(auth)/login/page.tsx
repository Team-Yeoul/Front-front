'use client';

import { useEffect, useRef, useState } from 'react';
import { useLogin } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { beginAuthAttempt, isLatestAuthAttempt, useAuthStore } from '@/store';
import { loginDestination } from '@/lib/onboarding';
import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { Field, RememberRow } from '@/components/ui/Field';
import { AuthHeader, FooterLink, OrDivider } from '@/components/ui/auth';
import { MailIcon, PadlockIcon } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/rn';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { useTheme } from '@/lib/theme';

/**
 * '기억하기'로 저장해 두는 이메일. 비밀번호는 앱이 직접 저장하지 않고
 * 브라우저 비밀번호 관리자에 맡긴다(autoComplete).
 */
const REMEMBERED_EMAIL_KEY = 'metame-remembered-email';

/** 앱 AsyncStorage 자리. 저장소를 쓸 수 없는 브라우저(사생활 보호 모드 등)에서도 화면은 동작한다. */
const remembered = {
  get: () => {
    try {
      return localStorage.getItem(REMEMBERED_EMAIL_KEY);
    } catch {
      return null;
    }
  },
  set: (email: string | null) => {
    try {
      if (email) localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    } catch {
      // 저장하지 못해도 로그인은 진행
    }
  },
};

export default function LoginScreen() {
  const { fg } = useTheme();
  const setAuth = useAuthStore((s) => s.setAuth);
  const loginMutation = useLogin();
  const passwordRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  // 로그인 API 뒤에 온보딩 확인까지 기다리므로, 처리 전체를 기준으로 버튼을 막는다.
  const [submitting, setSubmitting] = useState(false);
  const loading = submitting || loginMutation.isPending;
  // Google 로그인이 진행 중이면 비밀번호 로그인을 막는다(반대도 마찬가지).
  const [googleBusy, setGoogleBusy] = useState(false);

  // 지난번에 '기억하기'로 로그인했다면 이메일을 미리 채운다.
  useEffect(() => {
    const saved = remembered.get();
    if (saved) setEmail((cur) => cur || saved);
  }, []);

  const canSubmit = email.includes('@') && email.includes('.') && password.length >= 8; // 명세상 비밀번호는 8자 이상

  const handleSubmit = async () => {
    if (!canSubmit || loading || googleBusy) return;
    const attempt = beginAuthAttempt();
    setSubmitting(true);
    setError('');
    try {
      const res = await loginMutation.mutateAsync({ email, password });
      // 그사이 다른 로그인이 시작됐다면 이 응답으로 세션을 바꾸지 않는다.
      if (!isLatestAuthAttempt(attempt)) {
        setSubmitting(false);
        return;
      }
      setAuth(res.access_token, res.refresh_token, res.user_id);
      remembered.set(rememberMe ? email : null);
      const dest = await loginDestination(res.user_id);
      // 이동하기 전에 다른 로그인이 시작됐다면 이동은 그쪽에 맡기고, 이 버튼의 로딩만 푼다.
      if (isLatestAuthAttempt(attempt)) router.replace(dest);
      else setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      if (!isLatestAuthAttempt(attempt)) return;
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
        <View>
          <Button onPress={handleSubmit} disabled={!canSubmit || googleBusy} loading={loading}>
            시작하기
          </Button>
          <OrDivider />
          <GoogleLoginButton variant="outline" disabled={loading} onBusyChange={setGoogleBusy} />
          <FooterLink question="계정이 존재하지 않는다면?" label="회원가입" href="/terms" />
        </View>
      }
    >
      <AuthHeader title="다시 만나서 반가워요" sub="가입한 이메일과 비밀번호로 로그인해 주세요." backHref="/" />
      <View className="px-6 mt-7 gap-3">
        <Field
          label="이메일"
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setError('');
          }}
          placeholder="이메일"
          autoComplete="email"
          textContentType="username"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={!!error}
          icon={(f) => <MailIcon color={f || email ? fg('#1A1A1E') : fg('#A1A1AA')} />}
        />
        <View className="gap-2">
          <Field
            ref={passwordRef}
            label="비밀번호"
            type="password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              setError('');
            }}
            placeholder="비밀번호"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            error={!!error}
            icon={(f) => <PadlockIcon color={f || password ? fg('#1A1A1E') : fg('#A1A1AA')} />}
          />
          {/* 틀렸을 때 문구는 비밀번호 칸 바로 아래에 띄운다. */}
          {!!error && <Text className="text-[12px] text-danger">{error}</Text>}
        </View>
        <View className="mt-1">
          <RememberRow checked={rememberMe} onChange={setRememberMe} />
        </View>
      </View>
    </Screen>
  );
}
