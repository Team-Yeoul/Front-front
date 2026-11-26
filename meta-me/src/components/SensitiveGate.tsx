'use client';

import { useState, type ComponentType } from 'react';
import { router } from '@/lib/router';
import { useTheme } from '@/lib/theme';
import { consentSyncFailed, useConsentSync, useSensitiveConsent } from '@/hooks/useSensitiveConsent';
import { Screen } from '@/components/ui/Screen';
import { Button, Img3D, Spinner, TextButton } from '@/components/ui/primitives';
import { ScrollView, View } from '@/components/ui/rn';
import { Sheet } from '@/components/ui/overlays';
import { TermsBody } from '@/components/ui/TermsBody';
import { Text } from '@/components/ui/Text';
import { ApiError } from '@/shared/api';

/**
 * 민감정보(기록·AI 분석·AI 대화)를 다루는 화면을 감싼다. 동의하지 않았으면(설정에서 철회했거나 동의 기록이 없으면)
 * 화면 대신 동의 화면을 보여 준다. 화면 컴포넌트 자체를 그리지 않으므로 그 안의 기록·대화 요청도 보내지 않는다.
 * 마이페이지·설정·알림함은 동의를 철회한 사용자도 설정·탈퇴로 갈 수 있어야 하므로 감싸지 않는다(그 안의 민감정보는 각 화면이 숨긴다).
 *
 * 쓰는 법: `export default withSensitiveGate(DiaryWriteScreen)` (하단 탭 화면은 `{ inTabs: true }`)
 * 웹 page.tsx는 'use client' 파일에서 `function Page() {…}; export default withSensitiveGate(Page)`로 쓴다.
 */
export function withSensitiveGate<P extends object>(Inner: ComponentType<P>, { inTabs = false }: { inTabs?: boolean } = {}) {
  function Gated(props: P) {
    const { agreed } = useSensitiveConsent();
    // 서버와 동의를 맞추는 동안은 화면을 열지 않는다(서버에 동의가 없으면 요청이 403으로 막힌다).
    // 오프라인이라 맞추지 못하면 기기 값으로 진행하지만, 서버가 응답했는데 맞추지 못했으면(기기 동의를 올리지 못함 등)
    // 서버에 동의가 없을 수 있으니 동의 화면을 보여 준다. 한 번 맞춘 뒤 뒤에서 다시 맞추다 실패한 경우는 쓰던 화면을 닫지 않는다.
    const sync = useConsentSync();
    const serverUnconfirmed = sync.data === undefined && consentSyncFailed(sync.error);
    if (sync.isLoading) {
      return (
        <Screen inTabs={inTabs} scroll={false}>
          <View className="flex-1 items-center justify-center">
            <GateSpinner />
          </View>
        </Screen>
      );
    }
    if (!agreed || serverUnconfirmed) return <ConsentRequired inTabs={inTabs} />;
    return <Inner {...props} />;
  }
  Gated.displayName = `SensitiveGate(${Inner.displayName ?? Inner.name ?? 'Screen'})`;
  return Gated;
}

/** iOS ActivityIndicator 자리: 회색으로 도는 로딩 원 */
function GateSpinner() {
  const { fg } = useTheme();
  return <Spinner size={22} color={fg('#8A8A96')} />;
}

const POINTS = [
  '기록·AI 대화를 저장하고 AI로 분석해요',
  '분석을 위해 미국 OpenAI로 보내지만 AI 학습에는 쓰지 않아요',
  '동의하지 않으면 기록, 리포트, AI 대화를 쓸 수 없어요',
  '설정 > 개인정보에서 언제든 철회할 수 있어요',
];

/**
 * 민감정보 처리 동의 화면.
 * - 게이트에서: 동의하면 감싼 화면이 열리고, '나중에 할게요'는 마이페이지로 보낸다.
 * - 화면 안에서(onAgreed): 저장하려다 서버가 동의가 없다고 막은 경우. 쓰던 내용을 지우지 않도록 화면은 그대로 두고 이 화면만 보여 주며,
 *   동의하면 onAgreed(다시 저장), 취소하면 onCancel(쓰던 화면으로 돌아감)을 부른다.
 */
export function ConsentRequired({
  inTabs = false,
  onAgreed,
  onCancel,
}: {
  inTabs?: boolean;
  onAgreed?: () => void;
  onCancel?: () => void;
}) {
  const { agree } = useSensitiveConsent();
  const [detail, setDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // 서버에 동의가 저장돼야 화면이 열린다. 실패하면 동의 화면에 머물고, 버튼으로 다시 시도한다.
  const onAgree = async () => {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      // 서버에 필수 약관 동의가 없으면 약관 화면으로 넘어가므로(앱 레이아웃이 보낸다) 여기서는 더 하지 않는다.
      if ((await agree()) === 'terms-required') return;
      onAgreed?.();
    } catch (err) {
      // 원인을 알 수 있도록 서버가 준 상태·코드·메시지를 남긴다(개발 빌드에서는 화면에도 붙인다).
      const detail =
        err instanceof ApiError ? `${err.status} ${err.code}: ${err.message}` : err instanceof Error ? err.message : String(err);
      console.warn('[consent] 민감정보 동의 저장 실패', detail);
      setError(`동의를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.${process.env.NODE_ENV !== 'production' ? `\n(${detail})` : ''}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      inTabs={inTabs}
      footer={
        <View className="gap-1">
          {error ? (
            <Text className="text-[13px] text-danger text-center mb-1" accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
          <Button onPress={onAgree} disabled={saving}>
            {saving ? '저장 중...' : '동의하고 계속하기'}
          </Button>
          {/* 홈도 동의가 필요하므로 설정·탈퇴로 갈 수 있는 마이페이지로 보낸다.
              상세 화면에서 navigate로 탭에 가면 탭 묶음이 하나 더 쌓이므로, 쌓인 화면을 걷어내고 기존 탭으로 돌아간다. */}
          <TextButton textClassName="text-sub" onPress={onCancel ?? (() => router.dismissTo('/mypage'))}>
            {onCancel ? '돌아가기' : '나중에 할게요'}
          </TextButton>
        </View>
      }
    >
      <View className="px-6 pt-16 items-center">
        <Img3D name="lock3d" size={96} />
        <Text className="text-[22px] font-bold text-ink mt-6 text-center">민감정보 처리 동의가 필요해요</Text>
        <Text className="text-[15px] text-sub leading-[26px] mt-3 text-center">
          {'기록과 AI 대화에는 생각과 감정이 담겨요.\n이 정보를 저장하고 AI로 분석하려면\n따로 동의를 받아야 해요.'}
        </Text>
        <View className="mt-7 w-full rounded-2xl bg-surface px-5 py-4 gap-1.5">
          {POINTS.map((p) => (
            <Text key={p} className="text-[14px] text-text-2 leading-[24px]">
              · {p}
            </Text>
          ))}
        </View>
        <TextButton className="mt-2 w-auto" textClassName="text-primary underline" onPress={() => setDetail(true)}>
          동의 내용 자세히 보기
        </TextButton>
      </View>

      <Sheet open={detail} onClose={() => setDetail(false)} height="82%">
        <ScrollView className="flex-1 min-h-0 px-6 pt-5">
          <TermsBody termsKey="sensitive" />
          <View className="h-6" />
        </ScrollView>
        <View className="px-5 pt-3 pb-5 border-t border-line shrink-0">
          <Button onPress={() => setDetail(false)}>확인했어요</Button>
        </View>
      </Sheet>
    </Screen>
  );
}
