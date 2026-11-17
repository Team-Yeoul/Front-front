'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirmPasswordReset, useRequestPasswordReset } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { ErrorText, Field, MailIcon, PadlockIcon, PasswordStrength, RuleCheck } from '@/components/ui/Field';
import { AUTH_FOOTER, FooterLink, IconTile, StepHeader } from '@/components/ui/auth';

// 가입 화면과 같은 규칙. 서버는 8~64자 길이만 검사한다.
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;
// 같은 이메일은 60초에 한 번만 코드를 요청할 수 있다(어기면 429).
const RESEND_COOLDOWN_SEC = 60;

type Step = 'email' | 'code' | 'password' | 'done';

const KeyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="currentColor"
      d="M15.899 6.773c1.411.17 1.853 2.063.596 2.779a1.5 1.5 0 0 1-.914.195c-1.411-.17-1.853-2.064-.596-2.779c.278-.158.596-.234.914-.195m-4.108 8.14v1.828c-.023.36-.178.68-.5.866c-.174.101-.302.121-.5.134H8.963v1.829c-.018.271-.097.51-.293.707s-.436.275-.707.293H3.72c-.571-.038-.962-.429-1-1v-2.829c.019-.285.105-.492.293-.707l5.674-5.674c-.503-2.457.337-4.86 2.272-6.46c2.757-2.279 7.05-1.766 9.21 1.079c.732.964 1.221 2.115 1.331 3.327c.272 3.001-1.52 5.909-4.435 6.831c-1.143.362-2.384.439-3.553.145l-.694-.208l-.385-.161ZM4.72 17.155v1.415h2.243v-1.829c.023-.36.178-.68.5-.866c.174-.101.302-.121.5-.134h1.828v-1.828c.024-.36.178-.68.5-.866c.175-.101.302-.121.5-.134h1.842l.196.019c.2.04.605.238.707.274c.628.221 1.305.3 1.967.231c4.003-.417 5.465-5.512 2.318-8.006c-2.567-2.033-6.432-.676-7.17 2.515a4.5 4.5 0 0 0-.095 1.451l.073.482c.094.453.291.844.038 1.282l-.159.206Z"
    />
  </svg>
);

/** 단계 공통 머리: 아이콘 타일 + 제목 + 설명 */
function StepIntro({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 mt-9">
      <IconTile>{icon}</IconTile>
      <h1 className="text-[28px] font-bold text-ink tracking-[-0.02em] mt-5">{title}</h1>
      <div className="text-[15px] leading-6 text-[#71717A] mt-2">{children}</div>
    </div>
  );
}

/** 6칸 인증번호 입력. 투명한 input 하나가 입력을 받고 칸은 글자만 보여 준다. */
function CodeBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="relative mt-7 px-6" onClick={() => ref.current?.focus()}>
      <div className="flex gap-2">
        {Array.from({ length: CODE_LENGTH }, (_, i) => {
          const active = focused && i === Math.min(value.length, CODE_LENGTH - 1) && value.length < CODE_LENGTH;
          return (
            <span
              key={i}
              className={`flex-1 h-15 rounded-xl bg-white flex items-center justify-center text-[22px] font-semibold text-ink ${
                active ? 'border-[1.5px] border-primary' : 'border border-[#ECEEF2]'
              }`}
            >
              {value[i] ?? (active && <span className="w-px h-6 bg-primary animate-pulse" />)}
            </span>
          );
        })}
      </div>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        aria-label="인증번호 6자리"
        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
      />
    </div>
  );
}

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const requestMutation = useRequestPasswordReset();
  const confirmMutation = useConfirmPasswordReset();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  // 메일로 오는 6자리 숫자 인증코드. 발송 후 10분 동안 유효하다.
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  const rules = {
    length: newPassword.length >= 8,
    mix: /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const canRequest = EMAIL_RULE.test(email) && cooldown === 0 && !requestMutation.isPending;
  const canConfirm = PASSWORD_RULE.test(newPassword) && rules.match && !confirmMutation.isPending;

  const requestCode = async () => {
    if (!canRequest) return;
    setError('');
    try {
      await requestMutation.mutateAsync({ email });
      // 새로 요청하면 이전 코드는 무효가 되므로 입력해 둔 코드도 비운다.
      setCode('');
      setStep('code');
      setCooldown(RESEND_COOLDOWN_SEC);
      setToast('인증번호를 보냈어요');
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('잠시 후 다시 요청해 주세요. 인증번호는 1분에 한 번 받을 수 있어요.');
        setCooldown(RESEND_COOLDOWN_SEC);
      } else {
        setError('메일을 보내지 못했어요. 이메일을 다시 확인해 주세요.');
      }
    }
  };

  // 서버는 인증번호를 새 비밀번호와 함께 한 번에 확인한다. 그래서 인증번호가 틀리면 3단계에서 2단계로 되돌린다.
  const confirm = async () => {
    if (!canConfirm) return;
    setError('');
    try {
      await confirmMutation.mutateAsync({ email, code, new_password: newPassword });
      setStep('done');
    } catch (err) {
      // 서버는 만료와 불일치를 구분하지 않고 둘 다 400 AUTH_PASSWORD_RESET_TOKEN_INVALID로 준다.
      if (err instanceof ApiError && err.code === 'AUTH_PASSWORD_RESET_TOKEN_INVALID') {
        setStep('code');
        setError('인증번호가 맞지 않거나 만료됐어요. 메일을 다시 확인하거나 새로 받아 주세요.');
      } else if (err instanceof ApiError && err.status === 429) {
        // 10분 안에 5번을 넘기면 코드가 무효가 되어 다시 받아야 한다.
        setCode('');
        setStep('code');
        setError('입력 횟수를 넘었어요. 인증번호를 다시 받아 주세요.');
      } else if (err instanceof ApiError && err.code === 'VALIDATION_FAILED') {
        setError('입력한 내용을 다시 확인해 주세요. 비밀번호는 8~64자여야 해요.');
      } else {
        setError('비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    }
  };

  const goTo = (s: Step) => {
    setError('');
    setStep(s);
  };

  if (step === 'done') {
    return (
      <Screen footerClassName="px-6 pt-2 pb-8" footer={<Button onClick={() => router.replace('/login')}>로그인으로 돌아가기</Button>}>
        <div className="flex flex-col min-h-full">
          <div className="px-8 pt-[38px] flex flex-col gap-2.5">
            <h1 className="text-[24px] font-bold text-ink tracking-[-0.02em] leading-[1.4]">비밀번호를 바꿨어요</h1>
            <p className="text-[16px] font-semibold leading-[1.6] w-fit bg-[linear-gradient(90deg,#4A4EF0_0%,#9C6BFF_55%,#E36FB0_100%)] bg-clip-text text-transparent">
              새 비밀번호로 로그인하고
              <br />
              기록을 이어가세요.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/success-burst.svg" alt="" width={300} height={300} className="motion-safe:animate-pop-in" draggable={false} />
          </div>
        </div>
      </Screen>
    );
  }

  const overlay = toast && (
    <div className="absolute inset-x-0 bottom-[128px] z-40 flex justify-center pointer-events-none animate-fade-in" role="status">
      <span className="h-10 px-4 rounded-xl bg-[#2A2B35] text-white text-[14px] font-semibold flex items-center">{toast}</span>
    </div>
  );

  if (step === 'code') {
    return (
      <Screen
        overlay={overlay}
        footerClassName={AUTH_FOOTER}
        footer={
          <>
            <Button onClick={() => goTo('password')} disabled={code.length < CODE_LENGTH}>
              확인
            </Button>
            <FooterLink
              question="메일이 오지 않았나요?"
              label={cooldown > 0 ? `${mmss(cooldown)} 후 다시 받기` : '다시 받기'}
              onClick={cooldown > 0 ? undefined : requestCode}
              tone="ink"
              muted
            />
          </>
        }
      >
        <StepHeader step={2} total={3} onBack={() => goTo('email')} />
        <StepIntro icon={<MailIcon color="currentColor" size={32} />} title="메일을 확인해 주세요">
          이메일로 보낸 6자리 인증번호를 입력해 주세요.
          <br />
          <b className="font-semibold text-ink">{email}</b>
        </StepIntro>
        <CodeBoxes value={code} onChange={setCode} />
        {error && (
          <div className="px-6 mt-4">
            <ErrorText>{error}</ErrorText>
          </div>
        )}
      </Screen>
    );
  }

  if (step === 'password') {
    return (
      <Screen
        footerClassName="px-6 pt-2 pb-8"
        footer={
          <Button onClick={confirm} disabled={!canConfirm}>
            {confirmMutation.isPending ? '바꾸는 중...' : '비밀번호 바꾸기'}
          </Button>
        }
      >
        <StepHeader step={3} total={3} onBack={() => goTo('code')} />
        <StepIntro icon={<KeyIcon />} title="새 비밀번호를 만들어 주세요">
          이전에 쓰지 않은 비밀번호로 정해 주세요. 다음 로그인부터 사용돼요.
        </StepIntro>
        <form
          className="px-6 mt-7 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            confirm();
          }}
        >
          <Field
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="새 비밀번호"
            autoComplete="new-password"
            autoFocus
            icon={(f) => <PadlockIcon color={f || newPassword ? '#1A1A1E' : '#A1A1AA'} />}
          />
          <Field
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="새 비밀번호 확인"
            autoComplete="new-password"
            error={confirmPassword.length > 0 && !newPassword.startsWith(confirmPassword) && !rules.match}
            icon={(f) => <PadlockIcon color={f || confirmPassword ? '#1A1A1E' : '#A1A1AA'} />}
          />
          <div className="mt-1 flex flex-col gap-3">
            <PasswordStrength password={newPassword} withLabel={false} />
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <RuleCheck ok={rules.length}>8자 이상</RuleCheck>
              <RuleCheck ok={rules.mix}>영문 · 숫자 포함</RuleCheck>
              <RuleCheck ok={rules.match}>비밀번호 일치</RuleCheck>
            </div>
          </div>
          {error && <ErrorText>{error}</ErrorText>}
          <button type="submit" className="hidden" />
        </form>
      </Screen>
    );
  }

  return (
    <Screen
      overlay={overlay}
      footerClassName={AUTH_FOOTER}
      footer={
        <>
          <Button onClick={requestCode} disabled={!canRequest}>
            {requestMutation.isPending ? '보내는 중...' : '인증번호 받기'}
          </Button>
          <FooterLink question="비밀번호가 기억났나요?" label="로그인" href="/login" tone="ink" muted />
        </>
      }
    >
      <StepHeader step={1} total={3} backHref="/login" />
      <StepIntro icon={<PadlockIcon color="currentColor" size={32} />} title="비밀번호를 잊으셨나요?">
        가입한 이메일을 입력하면 6자리 인증번호를 보내드려요.
      </StepIntro>
      <form
        className="px-6 mt-7 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          requestCode();
        }}
      >
        <Field
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="가입한 이메일"
          autoComplete="email"
          icon={(f) => <MailIcon color={f || email ? '#1A1A1E' : '#A1A1AA'} />}
        />
        {error && <ErrorText>{error}</ErrorText>}
        <button type="submit" className="hidden" />
      </form>
    </Screen>
  );
}
