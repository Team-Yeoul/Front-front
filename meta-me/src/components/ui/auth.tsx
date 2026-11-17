'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { BackButton } from './primitives';

/** v3 인증 화면 footer 여백: 좌우 24px, 아래는 FooterLink 줄(44px)이 채운다. */
export const AUTH_FOOTER = 'px-6 pt-2';

/** 뒤로가기 + 큰 제목 + 설명 (로그인 · 회원가입). */
export function AuthHeader({
  title,
  sub,
  backHref,
  onBack,
}: {
  title: ReactNode;
  sub?: ReactNode;
  backHref?: string;
  onBack?: () => void;
}) {
  return (
    <>
      <div className="px-5 pt-1">
        <BackButton href={backHref} onClick={onBack} />
      </div>
      <div className="px-6 mt-7">
        <h1 className="text-[28px] font-bold text-ink tracking-[-0.02em]">{title}</h1>
        {sub && <p className="text-[14px] text-[#8A8A96] mt-2">{sub}</p>}
      </div>
    </>
  );
}

/** 뒤로가기 + 단계 막대 + "1 / 3" (비밀번호 찾기). */
export function StepHeader({ step, total, onBack, backHref }: { step: number; total: number; onBack?: () => void; backHref?: string }) {
  return (
    <div className="flex items-center gap-3.5 px-6 pt-2">
      <BackButton href={backHref} onClick={onBack} />
      <div className="flex-1 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-[#EDEDF2]'}`} />
        ))}
      </div>
      <span className="text-[13px] text-[#8A8A96] ml-0.5">
        {step} / {total}
      </span>
    </div>
  );
}

/** 64px 연보라 타일 안의 아이콘 (비밀번호 찾기 각 단계). */
export function IconTile({ children }: { children: ReactNode }) {
  return <div className="w-16 h-16 rounded-[20px] bg-primary-soft text-primary flex items-center justify-center">{children}</div>;
}

/** 버튼 아래 "계정이 존재하지 않는다면? 회원가입" 같은 한 줄. */
export function FooterLink({
  question,
  label,
  href,
  onClick,
  tone = 'primary',
  muted = false,
}: {
  question: string;
  label: string;
  href?: string;
  onClick?: () => void;
  /** 링크 글자색: primary(보라) · ink(검정) */
  tone?: 'primary' | 'ink';
  /** 질문 글자를 회색 보통 굵기로 */
  muted?: boolean;
}) {
  const linkCls = `font-bold ${tone === 'primary' ? 'text-[#4A4ED9]' : 'text-ink'} disabled:text-[#A1A1AA] disabled:font-normal`;
  return (
    <p className={`h-11 flex items-center justify-center gap-1.5 text-[14px] ${muted ? 'text-[#8A8A96]' : 'font-semibold text-ink'}`}>
      {question}
      {href ? (
        <Link href={href} className={linkCls}>
          {label}
        </Link>
      ) : (
        <button type="button" onClick={onClick} disabled={!onClick} className={linkCls}>
          {label}
        </button>
      )}
    </p>
  );
}
