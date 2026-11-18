import { useState } from 'react';
import { NativeModules, TurboModuleRegistry, View } from 'react-native';
import { router } from 'expo-router';
import { useGoogleLogin } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { useAuthStore, useLocalStore } from '@/store';
import { loginDestination } from '@/lib/onboarding';
import { Button } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';
import { GoogleIcon } from '@/components/ui/icons';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin');

/**
 * Google 로그인 네이티브 모듈은 개발 빌드에만 들어 있다(Expo Go에는 없음).
 * 라이브러리는 불러오는 순간 네이티브 모듈을 강제로 찾는데, 개발 모드의 Metro는 이 예외를
 * try/catch로 오기 전에 치명적 오류로 띄워 버린다. 그래서 네이티브 모듈이 있는지 먼저 보고 불러온다.
 */
function hasNativeGoogle(): boolean {
  return TurboModuleRegistry.get('RNGoogleSignin') != null || NativeModules.RNGoogleSignin != null;
}

let googleModule: GoogleSigninModule | null | undefined;
function loadGoogle(): GoogleSigninModule | null {
  if (googleModule !== undefined) return googleModule;
  if (!hasNativeGoogle()) {
    googleModule = null;
    return null;
  }
  try {
    // 모듈이 없을 때 앱이 죽지 않도록 정적 import 대신 여기서 불러온다.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    googleModule = require('@react-native-google-signin/google-signin') as GoogleSigninModule;
    // webClientId를 넣어야 서버가 검증하는 audience(웹 클라이언트 ID)로 ID Token이 발급된다.
    googleModule.GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, iosClientId: IOS_CLIENT_ID });
  } catch {
    googleModule = null;
  }
  return googleModule;
}

class UnavailableError extends Error {}

/** Google 계정을 고르게 하고 ID Token을 받는다. 사용자가 취소하면 null. */
async function getGoogleIdToken(): Promise<string | null> {
  const g = loadGoogle();
  if (!g) throw new UnavailableError();
  try {
    await g.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const res = await g.GoogleSignin.signIn();
    if (!g.isSuccessResponse(res)) return null;
    return res.data.idToken;
  } catch (err) {
    if (g.isErrorWithCode(err) && (err.code === g.statusCodes.SIGN_IN_CANCELLED || err.code === g.statusCodes.IN_PROGRESS)) return null;
    throw err;
  }
}

/**
 * "Google로 시작하기" 버튼. Google이 준 ID Token을 /v1/auth/google로 보내 로그인한다.
 * 처음 쓰는 Google 계정이면 서버가 자동으로 가입시킨다.
 */
export function GoogleLoginButton() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const googleLogin = useGoogleLogin();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const start = async () => {
    setBusy(true);
    setError('');
    try {
      const idToken = await getGoogleIdToken();
      if (!idToken) {
        setBusy(false);
        return;
      }
      const res = await googleLogin.mutateAsync(idToken);
      setAuth(res.access_token, res.refresh_token, res.user_id);
      if (res.is_new_user) {
        // Google 가입은 약관 화면을 거치지 않고 계정이 바로 만들어지므로, 가입 직후 약관 동의를 받는다.
        // 동의 전에 앱을 닫아도 다시 약관 화면으로 오도록 기기에 표시해 둔다.
        useLocalStore.getState().update(res.user_id, (u) => ({ ...u, termsPending: true }));
        router.replace('/terms');
        return;
      }
      router.replace(await loginDestination(res.user_id));
    } catch (err) {
      setBusy(false);
      setError(
        err instanceof UnavailableError
          ? 'Google 로그인은 개발 빌드(또는 스토어 앱)에서만 쓸 수 있어요.'
          : err instanceof ApiError && err.status === 401
            ? 'Google 계정을 확인하지 못했어요. 다시 시도해 주세요.'
            : '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
    }
  };

  return (
    <View className="gap-2">
      <Button variant="gray" onPress={start} disabled={busy || !WEB_CLIENT_ID}>
        <View className="absolute left-7">
          <GoogleIcon />
        </View>
        <Text className="text-[16px] font-medium text-ink">{busy ? '로그인 중...' : 'Google로 시작하기'}</Text>
      </Button>
      {!!error && <Text className="text-center text-[13px] text-danger">{error}</Text>}
    </View>
  );
}
