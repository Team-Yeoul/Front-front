'use client';

import { useState } from 'react';
import { router } from '@/lib/router';
import { useAuthStore, useLocalStore } from '@/store';
import { useGetMyAccount, useWithdrawAccount } from '@/entities/user';
import { useGetDailyRecord, useListDailyRecords } from '@/entities/diary';
import { useListPeerFeedback } from '@/entities/peer-feedback';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, ButtonPair, CogniImg, TextButton } from '@/components/ui/primitives';
import { CheckIcon } from '@/components/ui/icons';
import { Modal } from '@/components/ui/overlays';
import { Img, LinearGradient, Pressable, View, asset } from '@/components/ui/rn';
import { Span, Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { useMe } from '@/hooks/useMe';
import { useStreak } from '@/lib/streak';
import { useAccountToday } from '@/hooks/useSaveTodayRecord';
import { PeekSheet } from '@/components/settings/PeekSheet';
import { useTheme } from '@/lib/theme';

const REASONS = ['기록할 시간이 없어요', '분석이 나와 맞지 않아요', '다른 앱을 쓸 거예요'];
const MASCOT = asset('v2/cogni-default.png');
const toSettings = () => router.dismissTo('/settings');

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View className="h-14 flex-row items-center justify-center px-5 shrink-0">
      <View className="absolute left-5">
        <BackButton onPress={onBack} />
      </View>
      <Text accessibilityRole="header" className="text-[16px] font-semibold text-ink">
        회원탈퇴
      </Text>
    </View>
  );
}

const ROW_ICONS = {
  record: 'M6 3h12v18H6V3Zm3 5h6M9 12h6',
  cogni: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z',
  streak: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 2 1.5 3 2.5 3C11 9 11 6 12 3Z',
};

/**
 * 회원탈퇴 (17a → 17a2 붙잡기 → 17a3 한 번 더 → 17a5 최종 확인 → 17a4 보내주기).
 * 떠나는 이유는 받을 API가 없어 고르기만 한다.
 */
export default function WithdrawScreen() {
  const { isDark, fg, bg } = useTheme();
  const token = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const removeLocal = useLocalStore((s) => s.remove);
  const { nickname } = useMe();
  const { data: account } = useGetMyAccount(!!token && !nickname);
  const { data: records } = useListDailyRecords({ size: 100 }, !!token);
  const { today } = useAccountToday();
  const { streak } = useStreak(today, !!token);
  const { data: peer } = useListPeerFeedback({ size: 1 }, !!token);
  const collection = useCollection();
  const lastId = records?.records?.[0]?.record_id ?? '';
  const { data: last } = useGetDailyRecord(lastId, !!token && !!lastId);
  const withdraw = useWithdrawAccount();

  const [step, setStep] = useState<'info' | 'hold'>('info');
  const [reason, setReason] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [sheet, setSheet] = useState<'plead' | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');

  const name = nickname || account?.user?.username || '';
  const you = name ? `${name}님` : '당신';
  const recordCount = records?.page_info?.total_elements ?? records?.records?.length ?? 0;
  const lastSentence = last?.questions?.[0]?.user_answer?.trim();
  const lastDate = records?.records?.[0]?.recorded_date?.slice(2).replaceAll('-', '.');

  const run = async () => {
    if (withdraw.isPending) return;
    setError('');
    // 요청을 보낸 계정을 붙잡아 둔다(응답을 기다리는 동안 바뀌어도 그 계정의 데이터만 지운다).
    const deletedUserId = userId;
    try {
      await withdraw.mutateAsync();
    } catch {
      setConfirm(false);
      setError('탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    // 탈퇴가 끝나면 인사 시트를 닫을 때까지 기다리지 않고 바로 기기 데이터와 로그인 정보를 지운다.
    // 화면이 내려가기 전에 팝업을 닫아 두고, 인사는 로그아웃 뒤에도 보이는 시작 화면에서 띄운다.
    setConfirm(false);
    if (deletedUserId) removeLocal(deletedUserId);
    clearAuth();
    router.replace({ pathname: '/', params: { bye: name || '-' } });
  };

  const confirmModal = (
    <Modal open={confirm} onClose={() => !withdraw.isPending && setConfirm(false)}>
      <View>
        <Text className="text-[20px] font-bold text-danger">정말 탈퇴할까요?</Text>
        <Text className="text-[14px] text-sub leading-[22px] mt-2">탈퇴하면 기록과 코그니가 바로 지워지고 되돌릴 수 없어요.</Text>
        <ButtonPair className="mt-6">
          <Button variant="gray" size="pair" onPress={() => setConfirm(false)} disabled={withdraw.isPending}>
            취소
          </Button>
          <Button variant="dangerSolid" size="pair" onPress={run} loading={withdraw.isPending}>
            탈퇴하기
          </Button>
        </ButtonPair>
      </View>
    </Modal>
  );

  /* 17a 안내 */
  if (step === 'info') {
    return (
      <Screen
        footer={
          <>
            <Pressable
              onPress={() => setAgreed((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreed }}
              className="flex-row items-center gap-2.5 mb-3 self-start"
              hitSlop={6}
            >
              <View
                className={`w-5 h-5 shrink-0 rounded-md items-center justify-center ${agreed ? 'bg-primary' : 'border-[1.5px]'}`}
                style={agreed ? undefined : { borderColor: fg('#C4C4CC') }}
              >
                {agreed && <CheckIcon size={11} />}
              </View>
              <Text className="text-[14px] text-body">안내를 모두 확인했어요</Text>
            </Pressable>
            <Button variant="dangerSolid" disabled={!agreed} onPress={() => setStep('hold')}>
              탈퇴하기
            </Button>
          </>
        }
      >
        <Header onBack={() => (router.canGoBack() ? router.back() : toSettings())} />
        <View className="px-6 pt-6 pb-6">
          <Text accessibilityRole="header" className="text-[24px] font-bold text-ink leading-[34px]">
            {'탈퇴하면 이 기록이\n모두 지워져요'}
          </Text>
          <Text className="text-[14px] text-sub mt-2">지운 기록은 되돌릴 수 없어요.</Text>
          <View className="mt-6 rounded-[20px] bg-surface px-5 py-2">
            {[
              ['다이어리 기록', `${recordCount}개`],
              ['코그니 도감', `${collection.length}장`],
              ['친구 응답', `${peer?.total_elements ?? 0}개`],
            ].map(([k, v]) => (
              <View key={k} className="flex-row justify-between h-[42px] items-center">
                <Text className="text-[16px] text-body">{k}</Text>
                <Text className="text-[16px] font-bold text-ink tabular-nums">{v}</Text>
              </View>
            ))}
          </View>
          <Text className="text-[16px] font-bold text-ink mt-7">
            떠나는 이유를 알려주세요 <Span className="text-[16px] font-normal text-mute">선택</Span>
          </Text>
          <View className="gap-3 mt-3">
            {REASONS.map((r) => {
              const on = reason === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => setReason(on ? null : r)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  className={`h-[66px] rounded-2xl px-5 flex-row items-center gap-3.5 border-2 ${on ? 'bg-primary-soft border-primary' : 'bg-surface border-transparent'}`}
                >
                  <View
                    className={`w-[22px] h-[22px] shrink-0 rounded-full bg-page ${on ? 'border-[6px] border-primary' : 'border-[1.5px]'}`}
                    style={on ? undefined : { borderColor: fg('#C4C4CC') }}
                  />
                  <Text className={`text-[16px] text-ink ${on ? 'font-bold' : 'font-medium'}`}>{r}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Screen>
    );
  }

  /* 17a2 붙잡기 */
  return (
    <Screen
      background={
        <LinearGradient
          colors={[bg('#FFE1E4'), bg('#FFFFFF')]}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 360,
          }}
        />
      }
      footer={
        <>
          {error ? <Text className="text-center text-[12px] text-danger mb-3">{error}</Text> : null}
          <Button onPress={toSettings}>안 나갈게요</Button>
          <TextButton className="mt-1" textClassName="text-sub font-medium" onPress={() => setSheet('plead')}>
            그래도 나갈래요
          </TextButton>
        </>
      }
      overlay={
        <>
          {/* 17a3 한 번 더 */}
          <PeekSheet open={sheet === 'plead'} onClose={() => setSheet(null)} badge="정말요?" badgeTone="gray" title={'정말... 이래도\n갈 거예요?'}>
            <View className="mt-5 rounded-[20px] bg-surface px-5 py-5">
              <Text className="text-[16px] text-body leading-[26px]">
                어젯밤에도 {you} 기록을 기다렸어요. {collection[0] ? `${collection[0].name}도 ` : ''}
                {you} 말고는 기억하는 사람이 없어요.
              </Text>
              {lastSentence ? (
                <View className="mt-4 rounded-2xl bg-page px-4 py-3.5">
                  <Text className="text-[12px] text-sub tabular-nums">{lastDate} · 마지막으로 쓴 문장</Text>
                  <Text numberOfLines={3} className="text-[16px] font-semibold text-ink leading-[25px] mt-1">
                    “{lastSentence}”
                  </Text>
                </View>
              ) : null}
            </View>
            <View className="mt-5">
              <Button onPress={toSettings}>한 번만 더 있어볼게요</Button>
            </View>
            <TextButton
              className="mt-1"
              textClassName="text-sub font-medium"
              onPress={() => {
                setSheet(null);
                setConfirm(true);
              }}
            >
              그래도 나갈래요
            </TextButton>
          </PeekSheet>
          {/* 17a5 최종 확인 */}
          {confirmModal}
        </>
      }
    >
      <Header onBack={() => setStep('info')} />
      <View className="px-6 pb-6">
        <View className="flex-row items-start gap-3 mt-4">
          <View className="-ml-2 shrink-0">
            {collection[0]?.image ? <CogniImg src={collection[0].image} size={84} /> : <Img src={MASCOT} width={84} height={84} contentFit="contain" />}
          </View>
          <View className="mt-2 rounded-2xl rounded-tl-md bg-inverse px-4 py-3">
            <Text className="text-[16px] text-white leading-[24px]">{'지금 나가면\n제가 가만 안 있을 거예요'}</Text>
          </View>
        </View>
        <Text accessibilityRole="header" className="text-[24px] font-bold text-ink leading-[34px] mt-6">
          {'잠깐, 탈퇴 버튼 누르는 순간\n'}
          <Span className="text-[24px] font-bold text-danger">전부 사라져요</Span>
        </Text>
        <Text className="text-[16px] text-text-3 leading-[26px] mt-2">{recordCount}개의 기록, 한 번에 증발합니다. 백업도, 복구도, 봐주기도 없어요.</Text>
        <View className={`mt-6 rounded-[24px] p-3 gap-2.5 ${isDark ? 'bg-surface' : 'bg-[#FFF3F4]'}`}>
          {[
            {
              label: '다이어리 기록',
              value: `${recordCount}개`,
              d: ROW_ICONS.record,
            },
            {
              label: '모은 코그니',
              value: `${collection.length}마리`,
              d: ROW_ICONS.cogni,
            },
            { label: '연속 기록', value: `${streak}일`, d: ROW_ICONS.streak },
          ].map((row) => (
            <View key={row.label} className="h-16 rounded-2xl bg-page px-4 flex-row items-center gap-3.5">
              <View className={`w-10 h-10 shrink-0 rounded-xl items-center justify-center ${isDark ? 'bg-surface' : 'bg-[#FFE6E8]'}`}>
                <svg className="shrink-0" width={18} height={18} viewBox="0 0 24 24">
                  <path d={row.d} fill="#E5484D" />
                </svg>
              </View>
              <Text className="flex-1 text-[16px] text-ink">{row.label}</Text>
              <Text className="text-[16px] font-bold text-danger line-through tabular-nums">{row.value}</Text>
            </View>
          ))}
        </View>
        {collection.length > 0 && (
          <Text className="text-[12px] text-sub mt-5">
            코그니 {collection.length}마리는 {you} 없이는 다시 나타나지 않아요. 정말이에요.
          </Text>
        )}
      </View>
    </Screen>
  );
}
