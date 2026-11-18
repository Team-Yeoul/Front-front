import { useState, type Ref } from 'react';
import { Pressable, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';
import { Link } from 'expo-router';
import { Text } from './Text';
import { CheckIcon, ClearIcon, ErrorIcon, EyeIcon } from './icons';

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
  ...rest
}: Omit<TextInputProps, 'onChange' | 'onChangeText' | 'value' | 'secureTextEntry'> & {
  ref?: Ref<TextInputInstance>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: FieldType;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  return (
    <View className="gap-2">
      <Text className="text-[13px] font-medium text-[#48484F]">{label}</Text>
      <View
        className={`flex-row items-center h-14 rounded-2xl px-4 gap-3 border-[1.5px] ${
          focused ? 'bg-white border-primary' : 'bg-surface border-transparent'
        }`}
      >
        <TextInput
          {...rest}
          ref={ref}
          value={value}
          maxLength={maxLength}
          onChangeText={onChange}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          secureTextEntry={isPassword && !reveal}
          keyboardType={type === 'email' ? 'email-address' : type === 'number' ? 'number-pad' : rest.keyboardType}
          autoCapitalize={type === 'text' ? rest.autoCapitalize : 'none'}
          autoCorrect={type === 'text' ? rest.autoCorrect : false}
          placeholderTextColor="#B4B4BB"
          selectionColor="#6367FF"
          className="flex-1 text-[16px] text-ink"
          style={{ fontFamily: 'Pretendard-Regular' }}
        />
        {focused && !!value && (
          <Pressable onPress={() => onChange('')} accessibilityLabel="지우기" hitSlop={6}>
            <ClearIcon />
          </Pressable>
        )}
        {isPassword && (
          <Pressable onPress={() => setReveal((r) => !r)} accessibilityLabel="비밀번호 보기" hitSlop={6}>
            <EyeIcon off={reveal} />
          </Pressable>
        )}
        {!!maxLength && !isPassword && !focused && (
          <Text className="font-mono text-[13px] text-mute">
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
      {error && (
        <View className="flex-row items-center gap-1.5">
          <ErrorIcon />
          <Text className="text-[12px] text-danger">{error}</Text>
        </View>
      )}
    </View>
  );
}

export function RememberRow({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        className="flex-row items-center gap-2"
      >
        <View
          className={`w-[18px] h-[18px] rounded-[5px] items-center justify-center ${checked ? 'bg-primary' : 'border-[1.5px] border-[#D5D5DC]'}`}
        >
          {checked && <CheckIcon size={11} width={3} />}
        </View>
        <Text className="text-[14px] text-[#48484F]">기억하기</Text>
      </Pressable>
      <Link href="/forgot-password">
        <Text className="text-[13px] text-sub">비밀번호 찾으러 가기</Text>
      </Link>
    </View>
  );
}
