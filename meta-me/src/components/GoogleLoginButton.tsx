'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleLogin } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { beginAuthAttempt, isLatestAuthAttempt, useAuthStore } from '@/store';
import { loginDestination } from '@/lib/onboarding';
import { router } from '@/lib/router';
import { markTermsPendingIfMissing } from '@/hooks/useSensitiveConsent';
import { Button } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';
import { GoogleIcon } from '@/components/ui/icons';
import { View } from '@/components/ui/rn';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const GSI_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleId {
  initialize(config: { client_id: string; callback: (res: { credential?: string }) => void; ux_mode?: 'popup' }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  prompt(): void;
}
type GoogleWindow = Window & { google?: { accounts: { id: GoogleId } } };

let gsiLoading: Promise<GoogleId> | null = null;
// initialize는 앱 전체에서 한 번만 부른다. 로그인 결과는 지금 화면에 있는 버튼의 핸들러로 넘긴다.
let credentialHandler: ((idToken: string) => void) | null = null;

function loadGsiScript(): Promise<GoogleId> {
  const w = window as GoogleWindow;
  if (w.google?.accounts?.id) return Promise.resolve(w.google.accounts.id);
  return new Promise<GoogleId>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.onload = () => (w.google?.accounts?.id ? resolve(w.google.accounts.id) : reject(new Error('GSI unavailable')));
    script.onerror = () => reject(new Error('GSI load failed'));
    document.head.appendChild(script);
  });
}

/** Google Identity Services 스크립트를 불러오고 initialize까지 한 번만 한다. */
function loadGsi(): Promise<GoogleId> {
  gsiLoading ??= loadGsiScript()
    .then((id) => {
      id.initialize({
        client_id: CLIENT_ID,
        ux_mode: 'popup',
        callback: ({ credential }) => credential && credentialHandler?.(credential),
      });
      return id;
    })
    .catch((err) => {
      gsiLoading = null;
      throw err;
    });
  return gsiLoading;
}

/**
 * "Google로 시작하기" 버튼(앱과 같은 props). Google이 준 ID Token을 /v1/auth/google로 보내 로그인한다.
 * 처음 쓰는 Google 계정이면 서버가 자동으로 가입시킨다.
 * 웹은 ID Token을 Google 공식 버튼으로만 받을 수 있어서, 공식 버튼을 거의 투명하게 우리 버튼 위에 겹쳐 둔다.
 */
export function GoogleLoginButton({
  variant = 'filled',
  disabled = false,
  onBusyChange,
}: {
  variant?: 'filled' | 'outline';
  /** 다른 가입·로그인 방법이 진행 중이면 막는다. */
  disabled?: boolean;
  /** 진행 중 여부를 화면에 알려, 그동안 다른 방법을 막게 한다. */
  onBusyChange?: (busy: boolean) => void;
} = {}) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const googleLogin = useGoogleLogin();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [gsi, setGsi] = useState<GoogleId | null>(null);
  const [busy, setBusyState] = useState(false);
  const setBusy = (b: boolean) => {
    setBusyState(b);
    onBusyChange?.(b);
  };
  const [error, setError] = useState('');

  // 렌더마다 바뀌는 핸들러를 ref로 들고, credentialHandler는 이 ref를 거쳐 부른다.
  const onCredential = useRef<(idToken: string) => void>(() => {});
  useEffect(() => {
    onCredential.current = async (idToken: string) => {
      if (disabled) return;
      const attempt = beginAuthAttempt();
      setBusy(true);
      setError('');
      try {
        const res = await googleLogin.mutateAsync(idToken);
        // 그사이 다른 로그인이 시작됐다면 이 응답으로 세션을 바꾸지 않는다.
        if (!isLatestAuthAttempt(attempt)) {
          setBusy(false);
          return;
        }
        setAuth(res.access_token, res.refresh_token, res.user_id);
        // Google 가입은 약관 화면을 거치지 않고 계정이 바로 만들어지므로, 서버에 필수 약관 동의가 없으면 약관 화면으로 보낸다.
        if (await markTermsPendingIfMissing(res.user_id, { onError: res.is_new_user ? 'pending' : 'skip' })) {
          if (isLatestAuthAttempt(attempt)) router.replace('/terms');
          else setBusy(false);
          return;
        }
        const dest = await loginDestination(res.user_id);
        if (isLatestAuthAttempt(attempt)) router.replace(dest);
        else setBusy(false);
      } catch (err) {
        setBusy(false);
        if (!isLatestAuthAttempt(attempt)) return;
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[GoogleLogin] 실패', err instanceof ApiError ? { status: err.status, code: err.code, message: err.message } : err);
        }
        const reason = err instanceof ApiError ? `${err.status} ${err.code}` : 'network';
        setError(
          err instanceof ApiError && err.status === 401
            ? `Google 계정을 확인하지 못했어요. 다시 시도해 주세요.\n(${reason})`
            : `로그인하지 못했어요. 잠시 후 다시 시도해 주세요.\n(${reason})`,
        );
      }
    };
  });

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    const handler = (idToken: string) => onCredential.current(idToken);
    credentialHandler = handler;
    loadGsi()
      .then((id) => {
        if (cancelled || !overlayRef.current) return;
        id.renderButton(overlayRef.current, {
          type: 'standard',
          size: 'large',
          width: Math.min(400, overlayRef.current.offsetWidth || 400),
        });
        setGsi(id);
      })
      .catch(() => !cancelled && setError('Google 로그인을 불러오지 못했어요.'));
    return () => {
      cancelled = true;
      if (credentialHandler === handler) credentialHandler = null;
    };
  }, []);

  const off = disabled || !CLIENT_ID;
  return (
    <View className="gap-2">
      <View className="w-full">
        {variant === 'outline' ? (
          // 로그인·회원가입: 흰 바탕 + 1px 테두리, 로고는 글자 옆
          <Button variant="white" className="border border-border" onPress={() => gsi?.prompt()} disabled={off} loading={busy} accessibilityLabel="Google로 계속하기">
            <GoogleIcon size={22} />
            <Text className="text-[16px] font-semibold text-ink">Google로 계속하기</Text>
          </Button>
        ) : (
          <Button variant="gray" onPress={() => gsi?.prompt()} disabled={off} loading={busy} accessibilityLabel="Google로 시작하기">
            <View className="absolute left-7">
              <GoogleIcon />
            </View>
            <Text className="text-[16px] font-medium text-ink">Google로 시작하기</Text>
          </Button>
        )}
        {/* 투명한 공식 버튼이 클릭을 받는다. opacity-0이면 데스크톱 폰 프레임(둥근 모서리로 잘린 #phone-screen) 안에서
            Chrome이 공식 버튼 클릭을 버려서, 눈에 띄지 않을 만큼만 남겨 둔다. */}
        <div
          ref={overlayRef}
          aria-hidden
          className={`absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.01] ${busy || off ? 'pointer-events-none' : ''}`}
        />
      </View>
      {!!error && <Text className="text-center text-[12px] text-danger">{error}</Text>}
    </View>
  );
}
