'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { GoogleIcon, LogoMark } from '@/components/ui/brand';

function Splash() {
  return (
    <Screen
      bg="radial-gradient(60% 30% at 0% 22%, rgba(255,200,190,0.55) 0%, rgba(255,200,190,0) 70%), radial-gradient(70% 40% at 85% 55%, rgba(200,200,255,0.9) 0%, rgba(200,200,255,0) 70%), linear-gradient(180deg, #5357E8 0%, #8E8BFF 35%, #7C80FF 55%, #3B3E9E 80%, #2E3190 100%)"
      statusBg="#5357E8"
      statusFg="light"
    >
      <div className="h-full flex flex-col items-center justify-center relative">
        <p className="text-[17px] text-white/90">
          나를 이해하는 <b className="font-bold text-white">짧은 기록</b>
        </p>
        <div className="flex items-center gap-3 mt-3">
          <LogoMark size={46} color="#FFFFFF" />
          <span className="text-[34px] font-semibold text-white tracking-tight">metame</span>
        </div>
        <p className="absolute bottom-8 text-[12px] text-white/80">나를 이해하는 가장 짧은 기록</p>
      </div>
    </Screen>
  );
}

export default function StartPage() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1600);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) return <Splash />;

  return (
    <Screen
      bg="linear-gradient(180deg, #4F52E5 0%, #6367FF 22%, #8F92FF 38%, #E9E9FF 50%, #FFFFFF 58%)"
      statusBg="#4F52E5"
      statusFg="light"
      footer={
        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push('/login')}>로그인</Button>
          <Button variant="gray" className="relative font-medium">
            <span className="absolute left-7">
              <GoogleIcon />
            </span>
            Google로 시작하기
          </Button>
          <p className="text-center text-[13px] text-sub mt-1">
            계정이 존재하지 않는다면?{' '}
            <Link href="/terms" className="text-primary font-semibold">
              회원가입
            </Link>
          </p>
        </div>
      }
    >
      <div className="flex flex-col items-center pt-[165px]">
        <LogoMark size={112} color="#FFFFFF" />
        <span className="text-[44px] font-bold text-white tracking-tight -mt-1 drop-shadow-[0_6px_20px_rgba(60,60,200,0.25)]">
          metame
        </span>
      </div>
      <div className="px-7 mt-[150px]">
        <h1 className="text-[27px] font-bold text-ink leading-[1.4]">
          하루 한 번의 기록으로
          <br />
          나를 한 문장으로
        </h1>
        <p className="text-[14px] text-[#6B6B73] mt-4 leading-relaxed">
          질문에 답하기만 하면 됩니다. 기록이 쌓일수록 그 문장이 정확해져요.
        </p>
      </div>
    </Screen>
  );
}
