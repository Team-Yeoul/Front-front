import { useEffect, useRef, useState } from 'react';
import { View, type TextInputInstance } from 'react-native';
import { Link, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLogin } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { useAuthStore } from '@/store';
import { loginDestination } from '@/lib/onboarding';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button } from '@/components/ui/primitives';
import { Field, RememberRow } from '@/components/ui/Field';
import { Wordmark } from '@/components/ui/brand';
import { Text } from '@/components/ui/Text';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';

/**
 * '기억하기'로 저장해 두는 이메일. 비밀번호는 앱이 직접 저장하지 않고
 * OS 비밀번호 관리자(iCloud 키체인·Google 비밀번호 관리자)에 맡긴다(textContentType/autoComplete).
 */
const REMEMBERED_EMAIL_KEY = 'metame-remembered-email';

export default function LoginScreen() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const loginMutation = useLogin();
  const passwordRef = useRef<TextInputInstance>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  // 로그인 API 뒤에 온보딩 확인까지 기다리므로, 처리 전체를 기준으로 버튼을 막는다.
  const [submitting, setSubmitting] = useState(false);
  const loading = submitting || loginMutation.isPending;

  // 지난번에 '기억하기'로 로그인했다면 이메일을 미리 채운다.
  useEffect(() => {
    AsyncStorage.getItem(REMEMBERED_EMAIL_KEY)
      .then((saved) => saved && setEmail((cur) => cur || saved))
      .catch(() => {});
  }, []);

  const canSubmit = email.includes('@') && email.includes('.') && password.length >= 8; // 명세상 비밀번호는 8자 이상

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await loginMutation.mutateAsync({ email, password });
      setAuth(res.access_token, res.refresh_token, res.user_id);
      (rememberMe ? AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email) : AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY)).catch(() => {});
      router.replace(await loginDestination(res.user_id));
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
        <View className="gap-3">
          <Button onPress={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
          <GoogleLoginButton />
          <View className="flex-row justify-center mt-1">
            <Text className="text-[14px] font-semibold text-ink">계정이 존재하지 않는다면? </Text>
            <Link href="/terms">
              <Text className="text-[14px] font-semibold text-primary">회원가입</Text>
            </Link>
          </View>
        </View>
      }
    >
      <View className="px-5 pt-2">
        <BackButton href="/" />
        <View className="mt-4">
          <Wordmark />
        </View>
        <Text className="text-[28px] font-bold text-ink mt-4">로그인</Text>
        <Text className="text-[14px] text-sub mt-1.5">이메일과 비밀번호를 입력하세요</Text>

        <View className="gap-6 mt-12">
          <Field
            label="이메일"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="이메일을 입력해 주세요"
            autoComplete="email"
            textContentType="username"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <View className="gap-4">
            <Field
              ref={passwordRef}
              label="비밀번호"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="비밀번호를 입력해 주세요"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />
            <RememberRow checked={rememberMe} onChange={setRememberMe} />
          </View>
          {!!error && <Text className="text-[13px] text-danger -mt-2">{error}</Text>}
        </View>
      </View>
    </Screen>
  );
}
