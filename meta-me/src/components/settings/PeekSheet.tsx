'use client';

import type { ReactNode } from 'react';
import { Button, EASE_OUT, usePresence } from '@/components/ui/primitives';
import { useEscape } from '@/components/ui/overlays';
import { Img, Portal, Pressable, View, asset } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';

const MASCOT = asset('v2/cogni-default.png');

/** 화면 아래에 떠 있는 둥근 시트. 위로 코그니가 고개를 내민다. */
export function PeekSheet({
  open,
  onClose,
  badge,
  badgeTone,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  badge: string;
  badgeTone: 'gray' | 'primary';
  title: string;
  children: ReactNode;
}) {
  // 앱(RN Modal, animationType none)처럼 들어올 때만 움직이고(배경 Fade 200ms · 시트 Slide 280ms), 닫으면 바로 사라진다.
  const { active } = usePresence(open, 280);
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <Portal>
      <View role="dialog" aria-modal className="absolute inset-0 z-50 justify-end">
        <View className="absolute inset-0 bg-[#11111E]/62" style={{ opacity: active ? 1 : 0, transition: `opacity 200ms ${EASE_OUT}` }}>
          <Pressable className="flex-1" onPress={onClose} accessibilityLabel="닫기" tabIndex={-1} />
        </View>
        <View
          className="mx-3 rounded-[32px] bg-page"
          style={{
            marginBottom: 'calc(var(--safe-bottom) + 12px)',
            transform: `translateY(${active ? '0' : 'calc(100% + 12px + var(--safe-bottom))'})`,
            transition: `transform 280ms ${EASE_OUT}`,
          }}
        >
          <Img src={MASCOT} width={100} height={100} contentFit="contain" style={{ position: 'absolute', top: -56, right: 32 }} />
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-[#DADAE0] dark:bg-track" />
          </View>
          <View className="px-6 pt-4 pb-6">
            <View className={`self-start h-7 px-3 rounded-full justify-center ${badgeTone === 'primary' ? 'bg-primary-soft' : 'bg-surface-2'}`}>
              <Text className={`text-[12px] font-semibold ${badgeTone === 'primary' ? 'text-primary' : 'text-body'}`}>{badge}</Text>
            </View>
            <Text accessibilityRole="header" className="text-[24px] font-bold text-ink leading-[34px] mt-3">
              {title}
            </Text>
            {children}
          </View>
        </View>
      </View>
    </Portal>
  );
}

/**
 * 탈퇴를 마친 뒤의 인사 (17a4). 탈퇴하면 바로 로그아웃되어 앱 화면이 내려가므로, 시작 화면 위에 띄운다.
 * name은 탈퇴한 사람의 이름(없으면 '당신').
 */
export function FarewellSheet({ open, name, onClose }: { open: boolean; name?: string; onClose: () => void }) {
  const you = name ? `${name}님` : '당신';
  return (
    <PeekSheet open={open} onClose={onClose} badge="안녕" badgeTone="primary" title="그동안 고마웠어요">
      <View className="mt-5 rounded-[20px] bg-surface px-5 py-5">
        <Text className="text-[16px] text-body leading-[26px]">{you}의 기록은 모두 지워졌어요. 언젠가 돌아오면, 처음부터 다시 같이 써요.</Text>
      </View>
      <View className="mt-5">
        <Button variant="dangerSolid" onPress={onClose}>
          메타미 떠나기
        </Button>
      </View>
    </PeekSheet>
  );
}
