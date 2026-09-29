'use client';

import type { ReactNode } from 'react';
import { useStatusBarTheme } from '@/hooks/useStatusBarTheme';

export function SplashSlide({
  eyebrow,
  heading,
  body,
  chip,
  ctaLabel,
  align = 'center',
  onNext,
  onSkip,
  dotIndex,
  dotCount,
}: {
  eyebrow?: string;
  heading: ReactNode;
  body?: ReactNode;
  chip?: ReactNode;
  ctaLabel?: string;
  align?: 'center' | 'left';
  onNext: () => void;
  onSkip?: () => void;
  dotIndex: number;
  dotCount: number;
}) {
  useStatusBarTheme('#C9CCFF', 'dark');

  const dots = (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: dotCount }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === dotIndex ? 'w-5 bg-gray-900' : 'w-1.5 bg-gray-900/25'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div
      className="relative flex flex-col h-full cursor-pointer select-none"
      style={{ backgroundImage: 'linear-gradient(135deg, #C9CCFF 0%, #FFFFFF 55%, #FFE9A8 100%)' }}
      onClick={onNext}
    >
      {onSkip && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          className="self-end px-6 pt-6 text-[13px] text-gray-500"
        >
          넘어가기
        </button>
      )}

      <div
        className={`flex-1 flex flex-col justify-center px-8 gap-4 ${
          align === 'left' ? 'items-start text-left' : 'items-center text-center'
        }`}
      >
        {eyebrow && <p className="text-[12px] font-semibold tracking-wide text-gray-500">{eyebrow}</p>}
        <div className="text-[24px] font-bold text-gray-900 leading-[1.45]">{heading}</div>
        {body && <p className="text-[14px] text-gray-500 leading-relaxed">{body}</p>}
        {chip && <div onClick={(e) => e.stopPropagation()}>{chip}</div>}
      </div>

      <div className="pb-14 flex flex-col items-center gap-6">
        {ctaLabel ? (
          <>
            {dots}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="w-[calc(100%-48px)] h-14 bg-gray-900 text-white rounded-2xl text-base font-semibold"
            >
              {ctaLabel}
            </button>
          </>
        ) : (
          <>
            <p className="text-[12px] text-gray-400">화면을 탭해서 계속</p>
            {dots}
          </>
        )}
      </div>
    </div>
  );
}
