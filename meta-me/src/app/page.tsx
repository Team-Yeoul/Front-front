import Link from 'next/link';

export default function SplashPage() {
  return (
    <main
      className="flex flex-col h-full px-6"
      style={{
        backgroundImage:
          'linear-gradient(180deg, #4F52E5 0%, #8287FF 28%, #E3E4FF 55%, #FFFFFF 75%)',
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt=""
          className="w-24 h-auto"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <span className="text-[40px] font-bold text-white lowercase leading-none">metame</span>
      </div>

      <div className="pb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-snug">
          하루 한 번의 기록으로
          <br />
          나를 한 문장으로
        </h1>
        <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
          질문에 답하기만 하면 됩니다. 기록이 쌓일수록 그 문장이 정확해져요.
        </p>

        <div className="flex flex-col gap-3 mt-7">
          <Link href="/terms">
            <button className="w-full h-14 bg-[#8287FF] text-white rounded-2xl text-base font-semibold">
              가입하기
            </button>
          </Link>
          <button className="w-full h-14 bg-gray-100 text-gray-800 rounded-2xl text-base font-semibold flex items-center justify-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M18.1 10.2c0-.6-.06-1.18-.16-1.74H10v3.3h4.55a3.9 3.9 0 0 1-1.69 2.56v2.12h2.73C17.1 14.96 18.1 12.76 18.1 10.2z" fill="#4285F4"/>
              <path d="M10 18.4c2.29 0 4.21-.76 5.61-2.06l-2.73-2.12C12.13 14.83 11.15 15.1 10 15.1c-2.21 0-4.08-1.49-4.75-3.5H2.43v2.19C3.82 16.69 6.72 18.4 10 18.4z" fill="#34A853"/>
              <path d="M5.25 11.6A5.4 5.4 0 0 1 4.97 10c0-.55.1-1.09.28-1.6V6.21H2.43A9.24 9.24 0 0 0 1.4 10c0 1.48.35 2.88.97 4.13l2.88-2.53z" fill="#FBBC05"/>
              <path d="M10 4.9c1.25 0 2.37.43 3.25 1.27l2.44-2.44C14.21 2.36 12.29 1.6 10 1.6 6.72 1.6 3.82 3.31 2.43 6l2.82 2.19C5.92 6.39 7.79 4.9 10 4.9z" fill="#EA4335"/>
            </svg>
            Google로 시작하기
          </button>
        </div>

        <p className="text-center text-[13px] text-gray-400 mt-5">
          계정이 존재하지 않는다면?{' '}
          <Link href="/terms" className="text-[#8287FF] font-semibold">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
