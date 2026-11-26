'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Pressable, TextInput, View, type TextInputProps } from './rn';
import { useTheme } from '@/lib/theme';
import { Text } from './Text';
import { CheckIcon, ClearIcon, ErrorIcon, EyeIcon } from './icons';
import { MAX_TEXT_LENGTH } from '@/lib/textLimits';

type FieldType = 'text' | 'email' | 'password' | 'number';

/** Labeled text input from the v2 auth screens (gray fill → white + primary border on focus). */
export function Field({
  label,
  value,
  onChange,
  type = 'text',
  maxLength,
  error,
  ref,
  icon,
  ...rest
}: Omit<TextInputProps, 'onChange' | 'onChangeText' | 'value' | 'secureTextEntry'> & {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: FieldType;
  /** 문자열이면 칸 아래에 문구까지, true면 테두리만 빨갛게 */
  error?: string | boolean;
  /** 입력칸 앞 아이콘. (focused) => 아이콘 */
  icon?: (focused: boolean) => ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const { fg } = useTheme();

  return (
    <View className="gap-2">
      {!!label && <Text className="text-[14px] font-semibold text-text-2">{label}</Text>}
      <View
        className={`flex-row items-center h-14 rounded-xl px-4 gap-3 border ${
          error ? 'bg-danger-soft border-danger' : focused ? 'bg-surface border-primary' : 'bg-surface border-transparent'
        }`}
      >
        {icon?.(focused)}
        <TextInput
          {...rest}
          // 위에 보이는 라벨은 입력칸과 이어져 있지 않으니, 화면 낭독기가 칸 이름으로 읽게 넘긴다.
          accessibilityLabel={rest.accessibilityLabel ?? label}
          ref={ref}
          value={value}
          // 따로 정한 제한이 없으면 공통 상한(1만 자)까지만 받는다. 글자 수 표시는 따로 정한 제한이 있을 때만 보인다.
          maxLength={maxLength ?? MAX_TEXT_LENGTH}
          onChangeText={onChange}
          onFocus={() => {
            setFocused(true);
            rest.onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            rest.onBlur?.();
          }}
          secureTextEntry={isPassword && !reveal}
          keyboardType={type === 'email' ? 'email-address' : type === 'number' ? 'number-pad' : rest.keyboardType}
          autoCapitalize={type === 'text' ? rest.autoCapitalize : 'none'}
          autoCorrect={type === 'text' ? rest.autoCorrect : false}
          placeholderTextColor={fg('#C7C7D1')}
          selectionColor="#6367FF"
          className="flex-1 self-stretch text-[16px] text-ink"
        />
        {focused && !!value && (
          // 누르는 동안 입력칸이 포커스를 잃어 버튼이 사라지지 않게 한다.
          <Pressable onPress={() => onChange('')} onPointerDown={(e) => e.preventDefault()} accessibilityLabel="지우기">
            <ClearIcon />
          </Pressable>
        )}
        {isPassword && (
          <Pressable onPress={() => setReveal((r) => !r)} onPointerDown={(e) => e.preventDefault()} accessibilityLabel="비밀번호 보기">
            <EyeIcon off={reveal} />
          </Pressable>
        )}
        {!!maxLength && !isPassword && !focused && (
          <Text className="tabular-nums text-[12px] text-placeholder">
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
      {typeof error === 'string' && !!error && (
        <View className="flex-row items-center gap-1.5">
          <ErrorIcon />
          <Text className="text-[12px] text-danger">{error}</Text>
        </View>
      )}
    </View>
  );
}

export function RememberRow({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const { fg } = useTheme();
  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        className="flex-row items-center gap-2"
      >
        <View
          className={`w-[18px] h-[18px] rounded-[5px] items-center justify-center ${checked ? 'bg-primary' : 'border-[1.5px]'}`}
          style={checked ? undefined : { borderColor: fg('#D5D5DC') }}
        >
          {checked && <CheckIcon size={11} width={3} />}
        </View>
        <Text className="text-[14px] text-text-2">기억하기</Text>
      </Pressable>
      <Link href="/forgot-password" className="text-[12px] text-sub">
        비밀번호 찾으러 가기
      </Link>
    </View>
  );
}

/* ── 비밀번호 강도 ─────────────────────────────────────── */

/** 길이 8자 이상 · 영문 · 숫자 · 특수문자 중 몇 개를 만족하는지 (0~4). 8자가 안 되면 1로 둔다. */
export function passwordScore(pw: string) {
  if (!pw) return 0;
  if (pw.length < 8) return 1;
  return [pw.length >= 8, /[A-Za-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
}

const STRENGTH = [
  { color: '#E5484D', label: '너무 약해요 · 영문과 숫자를 섞어 8자 이상으로' },
  { color: '#E5484D', label: '너무 약해요 · 영문과 숫자를 섞어 8자 이상으로' },
  { color: '#E8A317', label: '보통이에요 · 특수문자를 더하면 안전해요' },
  { color: '#E8A317', label: '보통이에요 · 특수문자를 더하면 안전해요' },
  { color: '#22A861', label: '안전해요' },
];

/** 4칸 강도 막대. withLabel이면 아래에 한 줄 안내를 붙인다. */
export function PasswordStrength({ password, withLabel = true }: { password: string; withLabel?: boolean }) {
  const score = passwordScore(password);
  const { color, label } = STRENGTH[score];
  const { bg } = useTheme();
  return (
    <View className="gap-2">
      <View className="flex-row gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="flex-1 h-[5px] rounded-full" style={{ backgroundColor: i <= score ? color : bg('#ECEEF2') }} />
        ))}
      </View>
      {withLabel && !!password && (
        <Text className="text-[12px] font-semibold" style={{ color }}>
          {label}
        </Text>
      )}
    </View>
  );
}
