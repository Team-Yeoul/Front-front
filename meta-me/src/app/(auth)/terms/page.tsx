'use client';

import { useEffect, useRef, useState, type UIEvent } from 'react';
import { useAuthStore, useTermsStore } from '@/store';
import { useLogout, userApi } from '@/entities/user';
import { useMe } from '@/hooks/useMe';
import { ApiError } from '@/shared/api';
import type { TermsKey } from '@/lib/terms/content';
import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { AuthHeader } from '@/components/ui/auth';
import { Sheet } from '@/components/ui/overlays';
import { TermsBody } from '@/components/ui/TermsBody';
import { Text } from '@/components/ui/Text';
import { Pressable, ScrollView, View } from '@/components/ui/rn';
import { ArrowRight, CheckIcon } from '@/components/ui/icons';
import { useTheme } from '@/lib/theme';

/** 끝까지 읽어야 동의할 수 있는 [필수] 약관 */
const REQUIRED: TermsKey[] = ['service', 'privacy', 'sensitive'];
/**
 * '전체 동의'로 함께 켜고 끄는 항목 — 선택 항목(마케팅)까지 모두.
 * 민감정보 처리 동의는 아래에 별도 줄로 따로 보여 주고 따로 풀 수 있어, 다른 동의와 구분해 받는다(개인정보 보호법 제23조).
 */
const ALL: TermsKey[] = ['service', 'privacy', 'sensitive', 'marketing'];

const ROWS: { key: TermsKey; label: string }[] = [
  { key: 'service', label: '[필수] 서비스 이용 약관' },
  { key: 'privacy', label: '[필수] 개인정보 처리방침' },
  // 민감정보는 다른 동의와 묶지 않고 따로 받아야 한다(개인정보 보호법 제23조).
  { key: 'sensitive', label: '[필수] 민감정보 처리 동의' },
  { key: 'marketing', label: '[선택] 마케팅 정보 수신' },
];

/** 36px · 모서리 10px 체크박스. 켜지면 보라 채움 + 흰 체크, 꺼지면 흰 바탕 + 회색 테두리 */
function Box({ checked }: { checked: boolean }) {
  return (
    <View className={`w-9 h-9 shrink-0 rounded-[10px] items-center justify-center ${checked ? 'bg-primary' : 'bg-page border-[1.5px] border-disabled'}`}>
      {checked && <CheckIcon size={20} width={2.6} />}
    </View>
  );
}

export default function TermsScreen() {
  const { fg } = useTheme();
  const setTerms = useTermsStore((s) => s.setTerms);
  const [agreed, setAgreed] = useState<Record<TermsKey, boolean>>({ service: false, privacy: false, sensitive: false, marketing: false });
  const [detail, setDetail] = useState<TermsKey | null>(null);
  // [필수] 약관은 내용을 끝까지 읽어야 동의할 수 있다. 끝까지 읽은 약관을 기억한다.
  const [read, setRead] = useState<Record<TermsKey, boolean>>({ service: false, privacy: false, sensitive: false, marketing: false });
  // 지금 연 약관을 끝까지 내렸는지
  const [reachedEnd, setReachedEnd] = useState(false);
  // '전체 동의'로 연 경우, 확인하면 아직 안 읽은 다음 [필수] 약관을 이어서 연다.
  const [chain, setChain] = useState(false);
  // 내용이 짧아 스크롤할 게 없으면 바로 읽은 것으로 본다. 화면 높이·내용 높이가 잡히거나 바뀔 때마다 판단한다(앱 onLayout·onContentSizeChange).
  // 시트는 폰 화면에 포털로 늦게 그려지므로, 스크롤 영역이 생긴 뒤에 재도록 요소를 state로 받는다.
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollEl;
    const content = el?.firstElementChild;
    if (!detail || !el || !content) return;
    const checkFits = () => {
      const viewport = el.clientHeight;
      const h = content.getBoundingClientRect().height;
      if (viewport && h && h <= viewport + 24) setReachedEnd(true);
    };
    checkFits();
    const ro = new ResizeObserver(checkFits);
    ro.observe(el);
    ro.observe(content);
    return () => ro.disconnect();
  }, [detail, scrollEl]);

  const requiredAll = agreed.service && agreed.privacy && agreed.sensitive;
  const allAgreed = ALL.every((k) => agreed[k]);
  // 전체 동의는 [필수] 약관을 끝까지 읽은 뒤에 켠다. 안 읽은 것부터 차례로 연다.
  const firstUnread = REQUIRED.find((k) => !read[k]);

  const openDetail = (key: TermsKey, viaAll = false) => {
    setReachedEnd(false);
    setChain(viaAll);
    setDetail(key);
    // 이어서 다음 약관을 열면 처음부터 읽게 맨 위로 올린다(앱은 새 ScrollView로 바뀐다).
    scrollEl?.scrollTo({ top: 0 });
  };

  // '전체 동의'는 모든 항목(선택 포함)을 함께 켜고 끈다. 안 읽은 [필수] 약관이 있으면 그 내용부터 차례로 연다.
  const agreeAll = () => setAgreed((a) => ({ ...a, ...Object.fromEntries(ALL.map((k) => [k, true])) }));
  const toggleAll = () => {
    if (allAgreed) return setAgreed((a) => ({ ...a, ...Object.fromEntries(ALL.map((k) => [k, false])) }));
    if (firstUnread) return openDetail(firstUnread, true);
    agreeAll();
  };

  // 줄의 체크칸: [필수]인데 아직 안 읽었으면 체크 대신 내용을 연다.
  const toggleRow = (key: TermsKey) => {
    if (!agreed[key] && REQUIRED.includes(key) && !read[key]) return openDetail(key);
    setAgreed((a) => ({ ...a, [key]: !a[key] }));
  };

  // 내용 시트의 '동의하기': 읽음 + 체크. [선택] 약관(마케팅)은 '확인했어요'로 닫기만 하고, 동의는 줄의 체크칸으로만 받는다.
  // 전체 동의로 열었으면 다음 안 읽은 약관으로 넘어간다.
  const confirmDetail = () => {
    if (!detail) return;
    const nextRead = { ...read, [detail]: true };
    setRead(nextRead);
    if (REQUIRED.includes(detail)) setAgreed((a) => ({ ...a, [detail]: true }));
    const next = chain ? REQUIRED.find((k) => !nextRead[k]) : undefined;
    if (next) return openDetail(next, true);
    // '전체 동의'로 시작한 흐름을 끝냈으면 모든 항목(선택 포함)을 함께 동의한다.
    if (chain) agreeAll();
    setDetail(null);
  };

  // 끝에서 24px 안쪽까지 내려오면 끝까지 읽은 것으로 본다.
  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setReachedEnd(true);
  };
  const needsRead = !!detail && REQUIRED.includes(detail) && !read[detail];

  // Google로 막 가입한 사용자: 계정은 이미 있으므로 가입 화면 대신 동의를 저장하고 알림 설정으로 넘어간다.
  const { termsPending, patch } = useMe();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const logout = useLogout();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // 동의 저장 중에 사용자가 나가면(로그아웃) 이 값을 올려, 늦게 끝난 저장이 화면을 다시 바꾸지 않게 한다.
  const attempt = useRef(0);

  const submit = async () => {
    if (!requiredAll) return;
    if (!termsPending) {
      setTerms(agreed);
      router.push('/signup');
      return;
    }
    setSaving(true);
    setError('');
    const id = ++attempt.current;
    const user = useAuthStore.getState().userId;
    const stale = () => attempt.current !== id || !useAuthStore.getState().accessToken || useAuthStore.getState().userId !== user;
    // 약관 동의를 서버에 저장한다. 서버는 민감정보 동의가 없으면 온보딩·기록을 403으로 막는다.
    // 저장에 실패하면 여기 머문다. 실패한 채 넘어가면 다음 화면에서 서버에 약관 동의가 없는 것으로 확인돼
    // 다시 이 화면으로 돌아오는 일이 반복된다.
    try {
      await userApi.updateConsents({
        consents: [
          { consent_type: 'SERVICE', agreed: agreed.service },
          { consent_type: 'PRIVACY', agreed: agreed.privacy },
          { consent_type: 'SENSITIVE', agreed: agreed.sensitive },
          { consent_type: 'MARKETING', agreed: agreed.marketing },
        ],
      });
    } catch (err) {
      if (stale()) return;
      const dev = process.env.NODE_ENV !== 'production';
      const detail =
        err instanceof ApiError ? `${err.status} ${err.code}${dev ? `: ${err.message}${err.resolution ? ` / ${err.resolution}` : ''}` : ''}` : 'network';
      console.warn('[terms] 약관 동의 저장 실패', err instanceof ApiError ? { status: err.status, code: err.code, message: err.message } : err);
      setError(`동의를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.\n(${detail})`);
      setSaving(false);
      return;
    }
    if (stale()) return;
    try {
      const current = await userApi.getNotificationSettings();
      if (stale()) return;
      await userApi.updateNotificationSettings({ ...current, marketing_consent: agreed.marketing });
    } catch {
      // 마케팅 수신 설정 저장 실패는 가입 진행을 막지 않음(설정에서 다시 바꿀 수 있음)
    }
    if (stale()) return;
    patch((u) => ({ ...u, termsPending: false, sensitiveConsent: { agreed: true, at: new Date().toISOString() } }));
    router.replace('/notifications');
  };

  // 동의하지 않고 나가면 로그인 상태를 정리해, 동의 없이 앱을 쓰지 못하게 한다.
  const leave = async () => {
    attempt.current++;
    try {
      await logout.mutateAsync();
    } catch {
      // 서버 실패와 관계없이 기기의 로그인은 정리
    }
    clearAuth();
    router.replace('/');
  };

  return (
    <Screen
      footer={
        <>
          {!!error && <Text className="text-[12px] text-danger text-center mb-2">{error}</Text>}
          <Button onPress={submit} disabled={!requiredAll} loading={saving}>
            {error ? '다시 시도' : '동의하고 계속하기'}
          </Button>
        </>
      }
    >
      <AuthHeader title="이용약관" sub={'MetaMe 서비스 이용을 위해\n약관에 동의해 주세요.'} backHref="/" onBack={termsPending ? leave : undefined} />
      <View className="px-6">
        <View className="mt-7 rounded-[22px] bg-card px-5 py-[26px]">
          <Pressable
            onPress={toggleAll}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: allAgreed }}
            className="flex-row items-center gap-4"
          >
            <Box checked={allAgreed} />
            <View className="flex-1">
              <Text className="text-[16px] font-bold text-ink">약관 전체 동의하기</Text>
              <Text className="text-[12px] text-sub mt-0.5">선택 항목도 함께 동의해요. 선택 항목은 동의하지 않아도 가입할 수 있어요</Text>
            </View>
          </Pressable>
          <View className="mx-1 my-[22px] border-t-[1.5px] border-dashed border-disabled" />
          <View className="gap-[18px]">
            {ROWS.map(({ key, label }) => (
              <View key={key} className="flex-row items-center gap-4">
                <Pressable
                  onPress={() => toggleRow(key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: agreed[key] }}
                  className="flex-row items-center gap-4 flex-1"
                >
                  <Box checked={agreed[key]} />
                  <Text className="text-[16px] font-medium text-text-2">{label}</Text>
                </Pressable>
                <Pressable onPress={() => openDetail(key)} className="p-1" accessibilityLabel={`${label} 보기`}>
                  <ArrowRight size={20} color={fg('#999999')} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
        <Text className="text-[12px] text-sub mt-3 px-1">[필수] 약관은 내용을 끝까지 읽어야 동의할 수 있어요.</Text>
      </View>

      <Sheet open={!!detail} onClose={() => setDetail(null)} height="82%">
        {detail && (
          <>
            <ScrollView ref={setScrollEl} className="flex-1 min-h-0 px-6 pt-5" onScroll={onScroll}>
              <TermsBody termsKey={detail} />
              <View className="h-6 shrink-0" />
            </ScrollView>
            <View className="px-6 pt-3 pb-5 border-t border-line shrink-0">
              {needsRead && !reachedEnd && <Text className="text-[12px] text-sub text-center mb-2">끝까지 읽으면 동의할 수 있어요</Text>}
              <Button onPress={confirmDetail} disabled={needsRead && !reachedEnd}>
                {REQUIRED.includes(detail) ? '동의하기' : '확인했어요'}
              </Button>
            </View>
          </>
        )}
      </Sheet>
    </Screen>
  );
}
