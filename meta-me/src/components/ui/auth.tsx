'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Pressable, View } from './rn';
import { toHref, type Href } from '@/lib/router';
import { BackButton } from './primitives';
import { Text } from './Text';
import { StaggerText } from './states';

/** 뒤로가기 + 24px 제목 + 설명 (이용약관 · 로그인 · 회원가입). 좌우 24px. */
export function AuthHeader({
  title,
  sub,
  icon,
  backHref,
  onBack,
}: {
  title: string;
  sub?: string;
  /** 제목 위 연보라 타일 아이콘 (비밀번호 찾기) */
  icon?: ReactNode;
  backHref?: Href;
  onBack?: () => void;
}) {
  return (
    <>
      <View className="px-6 pt-2">
        <BackButton href={backHref} onPress={onBack} />
      </View>
      <View className="px-6 mt-9">
        {icon && <IconTile>{icon}</IconTile>}
        {/* 제목 → 설명 순서로 한 줄씩 나타난다. */}
        <View className={icon ? 'mt-5' : ''}>
          <StaggerText header text={title} className="text-[24px] font-bold text-ink tracking-tight" />
        </View>
        {!!sub && (
          <View className="mt-2">
            <StaggerText delay={70} text={sub} className="text-[16px] leading-[24px] text-text-4" />
          </View>
        )}
      </View>
    </>
  );
}

/** 뒤로가기 + 단계 막대 + "1 / 3" (비밀번호 찾기). */
export function StepHeader({ step, total, onBack, backHref }: { step: number; total: number; onBack?: () => void; backHref?: Href }) {
  return (
    <View className="flex-row items-center gap-3.5 px-6 pt-2">
      <BackButton href={backHref} onPress={onBack} />
      <View className="flex-1 flex-row gap-1.5" accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: step }}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} className={`flex-1 h-1 rounded-full ${i < step ? 'bg-primary' : 'bg-surface-2'}`} />
        ))}
      </View>
      <Text className="text-[12px] text-sub tabular-nums">
        {step} / {total}
      </Text>
    </View>
  );
}

/** 64px 연보라 타일 안의 아이콘 */
export function IconTile({ children }: { children: ReactNode }) {
  return <View className="w-16 h-16 rounded-[20px] bg-primary-soft items-center justify-center">{children}</View>;
}

/** 주 버튼과 소셜 로그인 버튼 사이의 '또는' 구분선 */
export function OrDivider() {
  return (
    <View className="flex-row items-center gap-3 my-4" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View className="flex-1 h-px bg-border" />
      <Text className="text-[12px] text-mute">또는</Text>
      <View className="flex-1 h-px bg-border" />
    </View>
  );
}

/** 버튼 아래 "계정이 존재하지 않는다면? 회원가입" 같은 한 줄. */
export function FooterLink({ question, label, href, onPress, muted = false }: { question: string; label: string; href?: Href; onPress?: () => void; muted?: boolean }) {
  const linkCls = 'text-[14px] font-bold text-primary-pressed';
  return (
    <View className="h-11 flex-row items-center justify-center gap-1.5">
      <Text className={`text-[14px] ${muted ? 'text-sub' : 'font-semibold text-ink'}`}>{question}</Text>
      {href ? (
        <Link href={toHref(href)} className={linkCls}>
          {label}
        </Link>
      ) : (
        <Pressable onPress={onPress} accessibilityRole="button">
          <Text className={linkCls}>{label}</Text>
        </Pressable>
      )}
    </View>
  );
}
