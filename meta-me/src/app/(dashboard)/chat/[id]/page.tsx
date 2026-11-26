'use client';

import { useParams } from 'next/navigation';
import { StatusView } from '@/components/ui/states';
import { View } from '@/components/ui/rn';
import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { AiMessage, ChatBackdrop, GlassBack, UserMessage } from '@/components/ui/chatV3';
import { Text } from '@/components/ui/Text';
import { TitleBar } from '@/components/chat-report/TitleBar';
import { useChat } from '@/hooks/useChatHistory';
import { chatKindLabel, hhmm } from '@/lib/chatLabels';
import { withSensitiveGate } from '@/components/SensitiveGate';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// 항상 지난 대화로 돌아간다. 아래에 지난 대화가 없으면 이 화면을 그것으로 바꾼다.
const backToHistory = () => router.dismissTo('/chat/history');

function ChatDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const { chat, loading, failed, retry } = useChat(id ?? null);

  if (loading) {
    return (
      <Screen>
        <TitleBar title="" onBack={backToHistory} />
        <Text className="text-center text-[14px] text-sub mt-24">대화를 불러오는 중이에요...</Text>
      </Screen>
    );
  }

  if (!chat && failed) {
    return (
      <Screen>
        <TitleBar title="" onBack={backToHistory} />
        <StatusView kind="error" title="대화를 불러오지 못했어요" onRetry={() => retry()} className="pt-32" />
      </Screen>
    );
  }

  if (!chat) {
    return (
      <Screen footer={<Button onPress={backToHistory}>지난 대화로</Button>}>
        <TitleBar title="" onBack={backToHistory} />
        <Text className="text-center text-[14px] text-sub mt-24">대화를 찾을 수 없어요.</Text>
      </Screen>
    );
  }

  const d = new Date(chat.startedAt);
  return (
    <Screen
      bg="#F1EFF8"
      background={<ChatBackdrop />}
      footerClassName="px-5 pt-2"
      footer={
        <Button
          // 탭 화면으로 갈 때는 쌓인 화면을 걷어내고 기존 탭으로 돌아간다.
          onPress={() => (chat.kind === 'free' ? router.dismissTo({ pathname: '/chat', params: { resume: chat.id } }) : router.dismissTo('/report'))}
        >
          {chat.kind === 'free' ? '이어서 대화하기' : '리포트로 가기'}
        </Button>
      }
    >
      <View className="h-[52px] shrink-0 flex-row items-center px-5">
        <GlassBack onPress={backToHistory} />
        <View pointerEvents="none" className="absolute left-0 right-0 items-center">
          <Text accessibilityRole="header" className="text-[16px] font-bold text-ink">{`${d.getMonth() + 1}월 ${d.getDate()}일 · ${WEEK[d.getDay()]}`}</Text>
          <Text className="mt-0.5 text-[12px] text-mute tabular-nums">
            {hhmm(chat.startedAt)} · {chatKindLabel(chat)}
          </Text>
        </View>
      </View>
      <View className="px-5 pt-5 pb-6 gap-4">
        {chat.messages.map((m, i) =>
          m.role === 'user' ? (
            <UserMessage key={i}>{m.text}</UserMessage>
          ) : (
            <AiMessage key={i} showName={false}>
              {m.text}
            </AiMessage>
          ),
        )}
        <View className="self-center rounded-full bg-page/60 px-3 py-1">
          <Text className="text-[12px] text-text-4">대화가 끝났어요</Text>
        </View>
      </View>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(ChatDetailScreen);
