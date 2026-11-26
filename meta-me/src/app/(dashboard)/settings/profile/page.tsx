'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { useGetMyAccount, useUpdateMyAccount } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { Button } from '@/components/ui/primitives';
import { Field } from '@/components/ui/Field';
import { SettingsShell } from '@/components/ui/settings';
import { View } from '@/components/ui/rn';
import { useMe } from '@/hooks/useMe';
import { useTextCheck } from '@/lib/textQuality';
import { goBack } from '@/lib/router';

const MAX = 12;

/** 프로필 편집: 화면에 보이는 이름(username)을 바꾼다. */
export default function ProfileEditScreen() {
  const token = useAuthStore((s) => s.accessToken);
  const { data: account } = useGetMyAccount(!!token);
  const update = useUpdateMyAccount();
  const { nickname, patch } = useMe();
  const current = nickname || account?.user?.username || '';
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? current;
  const [error, setError] = useState('');
  const trimmed = value.trim();
  const nameCheck = useTextCheck(value, true, { minLetters: 1 });

  const save = async () => {
    setError('');
    try {
      await update.mutateAsync({ username: trimmed });
    } catch (e) {
      setError(e instanceof ApiError && e.status === 400 ? '쓸 수 없는 이름이에요. 다른 이름을 입력해 주세요.' : '저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    // 이 기기에 저장된 별명이 서버 이름보다 먼저 보이므로 함께 바꾼다.
    patch((u) => ({ ...u, nickname: trimmed }));
    // 마이페이지·설정 어디서 들어왔든 그 화면으로 돌아간다.
    goBack('/settings');
  };

  return (
    <SettingsShell
      title="프로필 편집"
      sub="메타미에서 불릴 이름이에요"
      backHref="/settings"
      footer={
        <Button onPress={save} disabled={!trimmed || nameCheck.invalid || trimmed === current} loading={update.isPending}>
          저장하기
        </Button>
      }
    >
      <View className="mt-7">
        <Field
          label="이름"
          value={value}
          onChange={(v) => setDraft(v.slice(0, MAX))}
          maxLength={MAX}
          placeholder="이름을 입력해 주세요"
          error={error || nameCheck.hint || undefined}
        />
      </View>
    </SettingsShell>
  );
}
