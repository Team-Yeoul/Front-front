import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSensitiveConsent } from '@/hooks/useSensitiveConsent';
import { Screen } from '@/components/ui/Screen';
import { Button, Img3D, TextButton } from '@/components/ui/primitives';
import { Sheet } from '@/components/ui/overlays';
import { TermsBody } from '@/components/ui/TermsBody';
import { Text } from '@/components/ui/Text';

/**
 * 민감정보(기록·AI 분석)를 다루는 화면을 감싼다. 동의하지 않았으면 동의 화면을 대신 보여 준다.
 * 웹은 경로 목록(GATED)으로 막았고, 앱은 해당 화면이 직접 이 컴포넌트로 감싼다.
 * 홈·마이페이지·설정은 동의를 철회한 사용자도 설정·탈퇴로 갈 수 있어야 하므로 감싸지 않는다.
 */
export function SensitiveGate({ children, inTabs = false }: { children: ReactNode; inTabs?: boolean }) {
  const { agreed } = useSensitiveConsent();
  if (agreed) return <>{children}</>;
  return <ConsentRequired inTabs={inTabs} />;
}

const POINTS = [
  '기록·AI 대화를 저장하고 AI로 분석해요',
  '분석을 위해 미국 OpenAI로 보내지만 AI 학습에는 쓰지 않아요',
  '동의하지 않으면 기록, 리포트, AI 대화를 쓸 수 없어요',
  '설정에서 언제든 철회할 수 있어요',
];

function ConsentRequired({ inTabs }: { inTabs: boolean }) {
  const { agree } = useSensitiveConsent();
  const [detail, setDetail] = useState(false);

  return (
    <Screen
      inTabs={inTabs}
      footer={
        <View className="gap-1">
          <Button onPress={agree}>동의하고 계속하기</Button>
          {/* 상세 화면에서 navigate로 탭에 가면 탭 묶음이 하나 더 쌓이므로, 쌓인 화면을 걷어내고 기존 탭으로 돌아간다. */}
          <TextButton textClassName="text-sub" onPress={() => router.dismissTo('/main')}>
            나중에 할게요
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
            <Text key={p} className="text-[14px] text-[#48484F] leading-[24px]">
              · {p}
            </Text>
          ))}
        </View>
        <TextButton className="mt-2 w-auto" textClassName="text-primary underline" onPress={() => setDetail(true)}>
          동의 내용 자세히 보기
        </TextButton>
      </View>

      <Sheet open={detail} onClose={() => setDetail(false)} height="82%">
        <ScrollView className="flex-1 px-6 pt-5" showsVerticalScrollIndicator={false}>
          <TermsBody termsKey="sensitive" />
          <View className="h-6" />
        </ScrollView>
        <View className="px-5 pt-3 pb-5 border-t border-line">
          <Button onPress={() => setDetail(false)}>확인했어요</Button>
        </View>
      </Sheet>
    </Screen>
  );
}
