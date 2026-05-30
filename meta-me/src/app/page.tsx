import Link from 'next/link';

export default function SplashPage() {
  return (
    <main className="flex flex-col h-full bg-white px-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-40 h-40 rounded-3xl border border-gray-200 bg-gray-50" />
      </div>

      <div className="pb-14 flex flex-col gap-5">
        <Link href="/terms">
          <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-base font-semibold">
            가입하기
          </button>
        </Link>
        <Link href="/login" className="text-center text-sm text-gray-400">
          이미 계정이 있으신가요?
        </Link>
      </div>
    </main>
  );
}
