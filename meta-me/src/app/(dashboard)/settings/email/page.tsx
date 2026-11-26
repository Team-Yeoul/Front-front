'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { useGetMyAccount, useUpdateMyAccount } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { Button } from '@/components/ui/primitives';
import { Field } from '@/components/ui/Field';
import { SettingsShell } from '@/components/ui/settings';
import { View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { goBack } from '@/lib/router';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 이메일 (13j1): 로그인·알림 메일 주소를 바꾼다. 서버가 인증 메일 없이 바로 바꾸므로 버튼도 그렇게 적는다. */
export default function EmailSettingsScreen() {
  const token = useAuthStore((s) => s.accessToken);
  const { data: account } = useGetMyAccount(!!token);
  const update = useUpdateMyAccount();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const current = account?.user?.email ?? '';
  const next = email.trim();
  const invalid = next.length > 0 && !EMAIL_RE.test(next);

  const save = async () => {
    setError('');
    try {
      await update.mutateAsync({ email: next });
    } catch (e) {
      setError(e instanceof ApiError && (e.status === 409 || e.status === 400) ? e.message : '바꾸지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    goBack('/settings');
  };

  return (
    <SettingsShell
      title="이메일"
      sub="로그인과 알림 메일을 받는 주소예요"
      backHref="/settings"
      footer={
        <Button onPress={save} disabled={!next || invalid || next === current} loading={update.isPending}>
          이메일 바꾸기
        </Button>
      }
    >
      <View className="gap-6 mt-7">
        <View className="gap-2">
          <Text className="text-[14px] font-semibold text-text-2">현재 이메일</Text>
          <View className="h-14 rounded-xl bg-page border border-line px-4 justify-center">
            <Text numberOfLines={1} className="text-[16px] text-ink">
              {current || '불러오는 중...'}
            </Text>
          </View>
        </View>
        <Field
          label="새 이메일"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="새 이메일을 입력해 주세요"
          autoComplete="email"
          error={error || (invalid ? '이메일 형식을 확인해 주세요' : undefined)}
        />
      </View>
    </SettingsShell>
  );
}
