import Link from 'next/link';

export function BackToSummaryButton() {
  return (
    <div className="px-6 py-5">
      <Link href="/report/summary">
        <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-base font-semibold">
          리포트로 돌아가기
        </button>
      </Link>
    </div>
  );
}
