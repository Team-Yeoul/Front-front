'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/*
 * expo-router의 `router` 싱글턴 자리. 앱 화면의 router.push / replace / back / dismissTo / canGoBack을 그대로 쓸 수 있다.
 * Next 라우터 인스턴스는 루트 레이아웃의 <AppShell>(useRouterBridge)이 넣어 준다.
 * 훅 안에서는 next/navigation의 useRouter()를 써도 된다.
 *
 * Href: 문자열('/diary/write?edit=1') 또는 앱처럼 { pathname: '/diary/[id]', params: { id } }.
 */

export type Href = string | { pathname: string; params?: Record<string, string | number | undefined> };

/** { pathname: '/diary/[id]', params: { id } } → '/diary/abc'. 경로에 쓰지 않은 params는 쿼리로 붙인다. */
export function toHref(href: Href): string {
  if (typeof href === 'string') return href;
  const query = new URLSearchParams();
  const path = href.pathname.replace(/\[(?:\.\.\.)?([^\]]+)\]/g, (_, key: string) => {
    const v = href.params?.[key];
    return v === undefined ? '' : encodeURIComponent(String(v));
  });
  for (const [k, v] of Object.entries(href.params ?? {})) {
    if (v !== undefined && !href.pathname.includes(`[${k}]`) && !href.pathname.includes(`[...${k}]`)) query.set(k, String(v));
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

type NextRouter = ReturnType<typeof useRouter>;
let next: NextRouter | null = null;
/** 이 탭에서 앱 안 이동이 한 번이라도 있었는지(처음 연 화면이면 뒤로 갈 곳이 없다). */
let navigated = false;

/** 루트 레이아웃에서 한 번 부른다. */
export function useRouterBridge() {
  const r = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    next = r;
  }, [r]);
  const first = useRef(pathname);
  useEffect(() => {
    // 처음 연 경로에서 바뀌었으면 앱 안 이동이 있었던 것
    if (pathname !== first.current) navigated = true;
  }, [pathname]);
}

const go = (fn: (r: NextRouter, url: string) => void, href: Href) => {
  const url = toHref(href);
  if (next) fn(next, url);
  else window.location.assign(url);
};

export const router = {
  push: (href: Href) => go((r, u) => r.push(u), href),
  /** expo-router navigate: 웹에서는 push와 같다. */
  navigate: (href: Href) => go((r, u) => r.push(u), href),
  replace: (href: Href) => go((r, u) => r.replace(u), href),
  /** 쌓인 화면을 걷어내고 그 화면으로: 웹에서는 replace. */
  dismissTo: (href: Href) => go((r, u) => r.replace(u), href),
  back: () => (next ? next.back() : window.history.back()),
  canGoBack: () => typeof window !== 'undefined' && navigated && window.history.length > 1,
};

/** 뒤로 갈 화면이 없으면(이 화면을 주소로 바로 연 경우 등) fallback으로 이동한다. */
export function goBack(fallback: Href = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
