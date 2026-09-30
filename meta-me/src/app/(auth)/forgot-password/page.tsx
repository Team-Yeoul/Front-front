'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequestPasswordReset } from '@/entities/user';
import { Screen } from '@/components/ui/Screen';
import { Button, TextButton, TopBar } from '@/components/ui/primitives';
import { Field } from '@/components/ui/Field';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const resetMutation = useRequestPasswordReset();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = email.includes('@') && email.includes('.') && !resetMutation.isPending;

  const submit = async () => {
    if (!canSubmit) return;
    setError('');
    try {
      await resetMutation.mutateAsync({ email });
      setSent(true);
    } catch {
      setError('메일을 보내지 못했어요. 이메일을 다시 확인해 주세요.');
    }
  };

  return (
    <Screen
      footer={
        <>
          <Button onClick={submit} disabled={!canSubmit}>
            {sent ? '링크 다시 받기' : '재설정 링크 받기'}
          </Button>
          <TextButton className="mt-1" onClick={() => router.push('/login')}>
            로그인으로 돌아가기
          </TextButton>
        </>
      }
    >
      <TopBar title="비밀번호 찾기" backHref="/login" />
      <div className="px-5 pt-4">
        <h1 className="text-[22px] font-bold text-ink">가입한 이메일을 알려주세요</h1>
        <p className="text-[14px] text-sub mt-2 leading-relaxed">
          재설정 링크를 보내드려요. 메일이 오지 않으면 스팸함을 확인해 주세요.
        </p>
        <div className="mt-8">
          <Field label="이메일" type="email" value={email} onChange={setEmail} placeholder="이메일을 입력해 주세요" autoComplete="email" />
        </div>
        {sent && <p className="text-[13px] text-primary mt-3">{email}로 재설정 링크를 보냈어요.</p>}
        {error && <p className="text-[13px] text-danger mt-3">{error}</p>}
      </div>
    </Screen>
  );
}
