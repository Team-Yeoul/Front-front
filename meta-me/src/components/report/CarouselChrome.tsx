'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export function CarouselChrome({
  title,
  subtitle,
  step,
  total,
  backHref,
  nextHref,
  nextLabel = '다음',
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  step: number;
  total: number;
  backHref?: string;
  nextHref?: string;
  nextLabel?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 pt-6 pb-1 flex items-start justify-between">
        <div className="flex items-start gap-2">
          {backHref && (
            <Link href={backHref} className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5" aria-label="뒤로가기">
              <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                <path d="M7 1L1 6.5L7 12" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
          <div>
            <h1 className="text-[19px] font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-[12px] text-gray-400 mt-1">{subtitle}</p>}
          </div>
        </div>
        <span className="text-[12px] text-gray-300 shrink-0 mt-1">
          {step} / {total}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-4">{children}</div>

      <div className="px-6 pb-6 pt-2">
        {footer ??
          (nextHref && (
            <div className="flex justify-end">
              <Link href={nextHref} className="text-[13px] font-semibold text-[#8287FF]">
                {nextLabel} ›
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}
