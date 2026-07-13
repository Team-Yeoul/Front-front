'use client';

import { useRouter } from 'next/navigation';

export function DetailHeader({
  title,
  subtitle,
  backHref,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  const router = useRouter();

  return (
    <div className="px-5 pt-6 pb-4 border-b border-gray-100 bg-white">
      <button
        onClick={() => (backHref ? router.push(backHref) : router.back())}
        className="mb-3 w-8 h-8 flex items-center justify-center shrink-0 focus:outline-none"
        aria-label="뒤로가기"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Vector.png" alt="" width={14} height={22} />
      </button>
      <h1 className="text-[17px] font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="text-[12px] text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
