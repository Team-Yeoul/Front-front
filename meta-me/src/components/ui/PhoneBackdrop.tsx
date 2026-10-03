'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * 폰 화면(#phone-screen, PhoneFrame) 전체에 배경을 깐다. 상태바·홈 인디케이터 뒤까지 끊김 없이 채운다.
 * z-index -1이라 화면의 모든 요소 아래에 놓인다. 위에 올라가는 Screen·상태바는 배경을 투명하게 둬야 비친다.
 */
export function PhoneBackdrop({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById('phone-screen')), []);
  if (!target) return null;
  return createPortal(<div className="absolute inset-0 -z-10 pointer-events-none">{children}</div>, target);
}
