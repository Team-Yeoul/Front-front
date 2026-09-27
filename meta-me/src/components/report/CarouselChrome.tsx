'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export function CarouselChrome({
  title,
  subtitle,
  step,
  total,
  nextHref,
  nextLabel = '다음',
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  step: number;
  total: number;
  nextHref?: string;
  nextLabel?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 pt-6 pb-1 flex items-start justify-between">
        <div>
          <h1 className="text-[19px] font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-[12px] text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <span className="text-[12px] text-gray-300 shrink-0 mt-1">
          {step} / {total}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-4">{children}</div>

      <div className="px-6 pb-6 pt-2">
        {footer ??
          (nextHref && (
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-300">
                {step} / {total}
              </span>
              <Link href={nextHref} className="text-[13px] font-semibold text-[#8287FF]">
                {nextLabel} ›
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}
