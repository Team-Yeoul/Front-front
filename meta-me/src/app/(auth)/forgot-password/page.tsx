'use client';

import { useEffect, useRef, useState } from 'react';
import { Stagger } from '@/components/ui/states';
import { useConfirmPasswordReset, useRequestPasswordReset, useVerifyPasswordReset } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { Button, Toast } from '@/components/ui/primitives';
import { Field, PasswordStrength } from '@/components/ui/Field';
import { FooterLink, IconTile, StepHeader } from '@/components/ui/auth';
import { KeyIcon, MailIcon, PadlockIcon } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';
import { Img, Pressable, TextInput, View, asset } from '@/components/ui/rn';
import { useTheme } from '@/lib/theme';
import { MAX_TEXT_LENGTH } from '@/lib/textLimits';

// 가입 화면과 같은 규칙. 서버는 8~64자 길이만 검사한다.
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;
// 같은 이메일은 60초에 한 번만 코드를 요청할 수 있다(어기면 429).
const RESEND_COOLDOWN_SEC = 60;

type Step = 'email' | 'code' | 'password' | 'done';

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

/** 단계 공통 머리: 아이콘 타일 + 24px 제목 + 설명 */
function StepIntro({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <View className="px-6 mt-9">
      <IconTile>{icon}</IconTile>
      {/* 제목 → 설명 순서로 한 줄씩 나타난다 */}
      <Stagger>
        <Text className="text-[24px] font-bold text-ink tracking-tight mt-5">{title}</Text>
        <View className="mt-2">{children}</View>
      </Stagger>
    </View>
  );
}

/**
 * 새로 들어온 글자에서 인증번호를 뽑는다.
 * 한 글자씩 치면 숫자만 남기고, 붙여넣기(한 번에 여러 글자)면 붙여넣은 글자 안의 6자리 숫자를 그대로 쓴다.
 * "인증번호: 123 456"처럼 다른 글자가 섞여 있거나, 이미 몇 자리를 넣은 뒤 붙여넣어도 된다.
 */
function nextCode(prev: string, text: string) {
  const digits = (t: string) => t.replace(/\D/g, '');
  if (text.length - prev.length > 1) {
    const pasted = text.startsWith(prev) ? text.slice(prev.length) : text;
    // 더 긴 숫자(전화번호 등)의 일부가 아닌, 딱 6자리인 숫자 덩어리를 고른다.
    const run = pasted.match(new RegExp(`(?:^|\\D)(\\d{${CODE_LENGTH}})(?!\\d)`));
    if (run) return run[1];
    if (digits(pasted).length === CODE_LENGTH) return digits(pasted);
  }
  return digits(text).slice(0, CODE_LENGTH);
}

/** 6칸 인증번호 입력. 투명한 입력칸 하나가 입력을 받고, 칸에는 숫자 대신 점만 보여 준다. */
function CodeBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(true);
  return (
    <Pressable className="mt-7 px-6 gap-2" onPress={() => ref.current?.focus()} accessibilityLabel="인증번호 6자리">
      <Text className="text-[14px] font-semibold text-text-2">인증번호</Text>
      <View className="flex-row gap-2">
        {Array.from({ length: CODE_LENGTH }, (_, i) => {
          const active = focused && i === Math.min(value.length, CODE_LENGTH - 1) && value.length < CODE_LENGTH;
          return (
            <View key={i} className={`flex-1 h-14 rounded-xl bg-surface items-center justify-center border ${active ? 'border-primary' : 'border-transparent'}`}>
              {value[i] ? <View className="w-2.5 h-2.5 rounded-full bg-ink" /> : active && <View className="w-px h-6 bg-primary" />}
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(nextCode(value, t))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        autoFocus
        accessibilityLabel="인증번호 6자리"
        // 붙여넣은 글에서 6자리를 뽑으므로 6자로 자르지 않고, 공통 상한까지만 받는다.
        maxLength={MAX_TEXT_LENGTH}
        className="absolute inset-0 opacity-0"
      />
    </Pressable>
  );
}

export default function ForgotPasswordScreen() {
  const { fg } = useTheme();
  const requestMutation = useRequestPasswordReset();
  const confirmMutation = useConfirmPasswordReset();
  const verifyMutation = useVerifyPasswordReset();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  // 인증번호를 실제로 받은 이메일. 요청하는 동안 입력칸을 고쳐도 코드 확인은 이 이메일로 한다.
  const [sentEmail, setSentEmail] = useState('');
  // 메일로 오는 6자리 숫자 인증코드. 발송 후 10분 동안 유효하다.
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  // 강도 막대는 처음엔 숨겼다가, 새 비밀번호 칸을 한 번 누르면 보여 준다.
  const [pwTouched, setPwTouched] = useState(false);
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

  const match = newPassword.length > 0 && newPassword === confirmPassword;
  // 다시 받기와 비밀번호 바꾸기는 한쪽이 진행 중이면 다른 쪽을 막는다(늦게 끝난 쪽이 화면을 되돌리지 않게).
  const busy = requestMutation.isPending || verifyMutation.isPending || confirmMutation.isPending;
  const canRequest = EMAIL_RULE.test(email) && cooldown === 0 && !busy;
  const canConfirm = PASSWORD_RULE.test(newPassword) && match && !busy;

  /** target: 다시 받기는 코드 화면에 보이는 주소(sentEmail)로, 처음 요청은 입력한 주소(email)로 보낸다. */
  const requestCode = async (target: string) => {
    if (!EMAIL_RULE.test(target) || cooldown > 0 || busy) return;
    setError('');
    try {
      await requestMutation.mutateAsync({ email: target });
      setSentEmail(target);
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

  // 인증번호가 맞을 때만 새 비밀번호 단계로 간다. 틀리면 이 화면에 그대로 남는다.
  const verifyCode = async () => {
    if (code.length < CODE_LENGTH || busy) return;
    setError('');
    try {
      await verifyMutation.mutateAsync({ email: sentEmail, code });
      setStep('password');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'AUTH_PASSWORD_RESET_TOKEN_INVALID') {
        setError('인증번호가 맞지 않거나 만료됐어요. 메일을 다시 확인하거나 새로 받아 주세요.');
      } else if (err instanceof ApiError && err.status === 429) {
        setCode('');
        setError('입력 횟수를 넘었어요. 인증번호를 다시 받아 주세요.');
      } else if (err instanceof ApiError && (err.status === 404 || err.status === 401)) {
        // 확인 API가 아직 배포되지 않은 서버. 막아 두면 비밀번호를 아예 못 바꾸므로 예전처럼 다음 단계에서 확인한다.
        // 지금 서버는 없는 주소에 404 대신 401 UNAUTHORIZED를 준다(로그인 없이 부르는 API라 401은 이 경우뿐이다).
        setStep('password');
      } else {
        setError('인증번호를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    }
  };

  // 인증번호는 앞 단계에서 확인했지만, 서버는 비밀번호를 바꿀 때 한 번 더 확인한다(그 사이 만료될 수 있다). 그때 틀리면 2단계로 되돌린다.
  const confirm = async () => {
    if (!canConfirm) return;
    setError('');
    try {
      await confirmMutation.mutateAsync({ email: sentEmail, code, new_password: newPassword });
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

  const errorLine = !!error && (
    <View className="px-6 mt-4">
      <Text className="text-[12px] text-danger">{error}</Text>
    </View>
  );

  if (step === 'done') {
    return (
      <Screen scroll={false} footer={<Button onPress={() => router.replace('/login')}>로그인으로 돌아가기</Button>}>
        <View className="px-8 pt-[38px] gap-2.5">
          <Text className="text-[24px] font-bold text-ink tracking-tight leading-[34px]">비밀번호를 바꿨어요</Text>
          <Text className="text-[16px] font-semibold leading-[26px] text-primary">{'새 비밀번호로 로그인하고\n기록을 이어가세요.'}</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          {/* Reanimated ZoomIn.duration(240) */}
          <View style={{ animation: 'zoom-in 240ms ease-out both' }}>
            <Img src={asset('v2/success-burst.svg')} width={300} height={300} contentFit="contain" />
          </View>
        </View>
      </Screen>
    );
  }

  // 다시 받기는 기다리는 시간 동안, 그리고 요청을 보내는 중에는 누를 수 없다.
  const resendOff = cooldown > 0 || busy;

  if (step === 'code') {
    return (
      <Screen
        overlay={!!toast && <Toast message={toast} />}
        footer={
          <Button onPress={verifyCode} disabled={code.length < CODE_LENGTH || busy} loading={verifyMutation.isPending}>
            확인
          </Button>
        }
      >
        {/* 인증번호를 다시 요청하거나 확인하는 중에는 이전 단계로 가지 않는다(응답이 화면을 다시 바꾸지 않게). */}
        <StepHeader step={2} total={3} onBack={() => !requestMutation.isPending && !verifyMutation.isPending && goTo('email')} />
        <StepIntro icon={<MailIcon color="#6367FF" size={32} />} title="메일을 확인해 주세요">
          <Text className="text-[16px] leading-[24px] text-text-4">이메일로 보낸 6자리 인증번호를 입력해 주세요.</Text>
          <Text className="text-[16px] leading-[24px] font-semibold text-ink">{sentEmail}</Text>
        </StepIntro>
        <CodeBoxes value={code} onChange={setCode} />
        {/* 메일이 안 왔을 때 바로 찾을 수 있게 입력칸 바로 아래에 둔다. */}
        <View className="px-6 mt-5 flex-row items-center justify-center gap-2.5">
          <Text className="text-[14px] text-text-4">메일이 오지 않았나요?</Text>
          <Pressable
            onPress={() => requestCode(sentEmail)}
            disabled={resendOff}
            accessibilityRole="button"
            accessibilityState={{ disabled: resendOff }}
            className={`h-9 px-4 rounded-full items-center justify-center ${resendOff ? 'bg-surface-2' : 'bg-primary-soft'}`}
          >
            <Text className={`text-[14px] font-semibold tabular-nums ${resendOff ? 'text-mute' : 'text-primary'}`}>
              {cooldown > 0 ? `${mmss(cooldown)} 후 다시 받기` : '인증번호 다시 받기'}
            </Text>
          </Pressable>
        </View>
        {errorLine}
      </Screen>
    );
  }

  if (step === 'password') {
    return (
      <Screen
        footer={
          <Button onPress={confirm} disabled={!canConfirm} loading={confirmMutation.isPending}>
            비밀번호 바꾸기
          </Button>
        }
      >
        {/* 비밀번호를 바꾸는 중에는 뒤로 가지 않는다. 실패하면 다시 누를 수 있다. */}
        <StepHeader step={3} total={3} onBack={() => !confirmMutation.isPending && goTo('code')} />
        <StepIntro icon={<KeyIcon />} title="새 비밀번호를 만들어 주세요">
          <Text className="text-[16px] leading-[24px] text-text-4">이전에 쓰지 않은 비밀번호로 정해 주세요. 다음 로그인부터 사용돼요.</Text>
        </StepIntro>
        <View className="px-6 mt-7 gap-3">
          <Field
            label="새 비밀번호"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="새 비밀번호"
            onFocus={() => setPwTouched(true)}
            autoComplete="new-password"
            textContentType="newPassword"
            icon={(f) => <PadlockIcon color={f || newPassword ? fg('#1A1A1E') : fg('#A1A1AA')} />}
          />
          <Field
            label="새 비밀번호 확인"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="새 비밀번호 확인"
            autoComplete="new-password"
            textContentType="newPassword"
            error={confirmPassword.length > 0 && !newPassword.startsWith(confirmPassword) && !match}
            icon={(f) => <PadlockIcon color={f || confirmPassword ? fg('#1A1A1E') : fg('#A1A1AA')} />}
          />
          {(pwTouched || !!newPassword) && (
            <View className="mt-1">
              <PasswordStrength password={newPassword} withLabel={false} />
            </View>
          )}
        </View>
        {errorLine}
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View>
          <Button onPress={() => requestCode(email)} disabled={!canRequest} loading={requestMutation.isPending}>
            인증번호 받기
          </Button>
          <FooterLink question="비밀번호가 기억났나요?" label="로그인" href="/login" muted />
        </View>
      }
    >
      <StepHeader step={1} total={3} backHref="/login" />
      <StepIntro icon={<PadlockIcon color="#6367FF" size={32} />} title="비밀번호를 잊으셨나요?">
        <Text className="text-[16px] leading-[24px] text-text-4">가입한 이메일을 입력하면 6자리 인증번호를 보내드려요.</Text>
      </StepIntro>
      <View className="px-6 mt-7 gap-3">
        <Field
          label="이메일"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="가입한 이메일"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={() => requestCode(email)}
          icon={(f) => <MailIcon color={f || email ? fg('#1A1A1E') : fg('#A1A1AA')} />}
        />
      </View>
      {errorLine}
    </Screen>
  );
}
