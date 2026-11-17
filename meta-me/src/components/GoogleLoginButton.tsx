'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { useAuthStore } from '@/store';
import { loginDestination } from '@/lib/onboarding';
import { Button } from '@/components/ui/primitives';
import { GoogleIcon } from '@/components/ui/brand';

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
 * "Google로 시작하기" 버튼. Google이 준 ID Token을 /v1/auth/google로 보내 로그인한다.
 * 처음 쓰는 Google 계정이면 서버가 자동으로 가입시킨다.
 * ID Token은 Google 공식 버튼으로만 받을 수 있어서, 공식 버튼을 투명하게 우리 버튼 위에 겹쳐 둔다.
 */
export function GoogleLoginButton() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const googleLogin = useGoogleLogin();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [gsi, setGsi] = useState<GoogleId | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // 렌더마다 바뀌는 핸들러를 ref로 들고, credentialHandler는 이 ref를 거쳐 부른다.
  const onCredential = useRef<(idToken: string) => void>(() => {});
  onCredential.current = async (idToken: string) => {
    setBusy(true);
    setError('');
    try {
      const res = await googleLogin.mutateAsync(idToken);
      setAuth(res.access_token, res.refresh_token, res.user_id);
      // 방금 가입한 계정은 온보딩 기록이 있을 수 없으니 확인하지 않고 바로 온보딩으로 보낸다.
      router.push(res.is_new_user ? '/onboarding' : await loginDestination(res.user_id));
    } catch (err) {
      setBusy(false);
      setError(
        err instanceof ApiError && err.status === 401
          ? 'Google 계정을 확인하지 못했어요. 다시 시도해 주세요.'
          : '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
    }
  };

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

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full max-w-[382px] mx-auto">
        {/* 투명한 공식 버튼이 클릭을 받는다. 공식 버튼이 닿지 않는 가장자리를 누르면 One Tap을 띄운다. */}
        {/* 로고는 왼쪽에 붙이고 글자는 버튼 가운데 둔다. */}
        <Button variant="gray" className="relative font-medium" disabled={busy || !CLIENT_ID} onClick={() => gsi?.prompt()}>
          <span className="absolute left-7 flex">
            <GoogleIcon size={26} />
          </span>
          {busy ? '로그인 중...' : 'Google로 시작하기'}
        </Button>
        {/* opacity-0이면 데스크톱 폰 프레임(둥근 모서리로 잘린 #phone-screen) 안에서 Chrome이 공식 버튼 클릭을 버린다.
            눈에 띄지 않을 만큼만 남겨 둔다. */}
        <div
          ref={overlayRef}
          className={`absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.01] ${busy ? 'pointer-events-none' : ''}`}
        />
      </div>
      {error && <p className="text-center text-[13px] text-danger">{error}</p>}
    </div>
  );
}
