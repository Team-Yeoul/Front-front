import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useConfirmPasswordReset, useRequestPasswordReset } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { Screen } from '@/components/ui/Screen';
import { Button, TextButton, TopBar, goBack } from '@/components/ui/primitives';
import { Field } from '@/components/ui/Field';
import { Text } from '@/components/ui/Text';

// 가입 화면과 같은 규칙. 서버는 8~64자 길이만 검사한다.
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;
// 같은 이메일은 60초에 한 번만 코드를 요청할 수 있다(어기면 429).
const RESEND_COOLDOWN_SEC = 60;

type Step = 'email' | 'code' | 'done';

export default function ForgotPasswordScreen() {
  const requestMutation = useRequestPasswordReset();
  const confirmMutation = useConfirmPasswordReset();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  // 메일로 오는 6자리 숫자 인증코드. 발송 후 10분 동안 유효하다.
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const passwordError =
    newPassword.length > 0 && !PASSWORD_RULE.test(newPassword) ? '영문·숫자 조합 8~64자로 입력해 주세요' : undefined;

  const canRequest = EMAIL_RULE.test(email) && cooldown === 0 && !requestMutation.isPending;
  const canConfirm = code.length === CODE_LENGTH && PASSWORD_RULE.test(newPassword) && !confirmMutation.isPending;

  const requestCode = async () => {
    if (!canRequest) return;
    setError('');
    setNotice('');
    try {
      await requestMutation.mutateAsync({ email });
      // 새로 요청하면 이전 코드는 무효가 되므로 입력해 둔 코드도 비운다.
      setCode('');
      if (step === 'code') setNotice('인증코드를 다시 보냈어요. 새로 받은 코드를 입력해 주세요.');
      setStep('code');
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('잠시 후 다시 요청해 주세요. 인증코드는 1분에 한 번 받을 수 있어요.');
        setCooldown(RESEND_COOLDOWN_SEC);
      } else {
        setError('메일을 보내지 못했어요. 이메일을 다시 확인해 주세요.');
      }
    }
  };

  const confirm = async () => {
    if (!canConfirm) return;
    setError('');
    setNotice('');
    try {
      await confirmMutation.mutateAsync({ email, code, new_password: newPassword });
      setStep('done');
    } catch (err) {
      // 서버는 만료와 불일치를 구분하지 않고 둘 다 400 AUTH_PASSWORD_RESET_TOKEN_INVALID로 준다.
      if (err instanceof ApiError && err.code === 'AUTH_PASSWORD_RESET_TOKEN_INVALID') {
        setError('인증코드가 맞지 않거나 만료됐어요. 메일을 다시 확인하거나 코드를 다시 받아 주세요.');
      } else if (err instanceof ApiError && err.status === 429) {
        // 10분 안에 5번을 넘기면 코드가 무효가 되어 다시 받아야 한다.
        setCode('');
        setError('입력 횟수를 넘었어요. 인증코드를 다시 받아 주세요.');
      } else if (err instanceof ApiError && err.code === 'VALIDATION_FAILED') {
        setError('입력한 내용을 다시 확인해 주세요. 비밀번호는 8~64자여야 해요.');
      } else {
        setError('비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    }
  };

  const backToEmail = () => {
    setStep('email');
    setCode('');
    setNewPassword('');
    setError('');
    setNotice('');
  };

  if (step === 'done') {
    return (
      <Screen footer={<Button onPress={() => router.replace('/login')}>로그인하러 가기</Button>}>
        <TopBar title="비밀번호 찾기" noBack />
        <View className="px-5 pt-4">
          <Text className="text-[22px] font-bold text-ink">비밀번호를 바꿨어요</Text>
          <Text className="text-[14px] text-sub mt-2 leading-[22px]">새 비밀번호로 다시 로그인해 주세요.</Text>
        </View>
      </Screen>
    );
  }

  if (step === 'code') {
    return (
      <Screen
        footer={
          <>
            <Button onPress={confirm} disabled={!canConfirm}>
              비밀번호 바꾸기
            </Button>
            <TextButton className="mt-1" onPress={requestCode} disabled={!canRequest}>
              {cooldown > 0 ? `인증코드 다시 받기 (${cooldown}초)` : '인증코드 다시 받기'}
            </TextButton>
          </>
        }
      >
        <TopBar title="비밀번호 찾기" onBack={backToEmail} />
        <View className="px-5 pt-4">
          <Text className="text-[22px] font-bold text-ink">메일로 받은 인증코드를 입력해 주세요</Text>
          <Text className="text-[14px] text-sub mt-2 leading-[22px]">
            {email}로 6자리 인증코드를 보냈어요. 10분 안에 입력해 주세요. 메일이 오지 않으면 스팸함을 확인해 주세요.
          </Text>
          <View className="mt-8 gap-5">
            <Field
              label="인증코드"
              type="number"
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, CODE_LENGTH))}
              placeholder="6자리 숫자"
              maxLength={CODE_LENGTH}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
            />
            <Field
              label="새 비밀번호"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="영문·숫자 조합 8자 이상"
              autoComplete="new-password"
              textContentType="newPassword"
              error={passwordError}
            />
          </View>
          {!!notice && <Text className="text-[13px] text-primary mt-3">{notice}</Text>}
          {!!error && <Text className="text-[13px] text-danger mt-3">{error}</Text>}
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <>
          <Button onPress={requestCode} disabled={!canRequest}>
            인증코드 받기
          </Button>
          <TextButton className="mt-1" onPress={() => goBack('/login')}>
            로그인으로 돌아가기
          </TextButton>
        </>
      }
    >
      <TopBar title="비밀번호 찾기" backHref="/login" />
      <View className="px-5 pt-4">
        <Text className="text-[22px] font-bold text-ink">가입한 이메일을 알려주세요</Text>
        <Text className="text-[14px] text-sub mt-2 leading-[22px]">비밀번호를 바꿀 수 있는 인증코드를 메일로 보내드려요.</Text>
        <View className="mt-8">
          <Field
            label="이메일"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="이메일을 입력해 주세요"
            autoComplete="email"
            textContentType="emailAddress"
          />
        </View>
        {!!error && <Text className="text-[13px] text-danger mt-3">{error}</Text>}
      </View>
    </Screen>
  );
}
