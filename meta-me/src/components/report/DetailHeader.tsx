'use client';

import { useRouter } from 'next/navigation';

export function DetailHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();

  return (
    <div className="px-5 pt-6 pb-4 border-b border-gray-100 bg-white">
      <button
        onClick={() => router.back()}
        className="mb-2 -ml-1 p-1 focus:outline-none"
        aria-label="뒤로가기"
      >
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
          <path
            d="M8.5 1.5L1.5 8L8.5 14.5"
            stroke="#1C1C1E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h1 className="text-[17px] font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="text-[12px] text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
