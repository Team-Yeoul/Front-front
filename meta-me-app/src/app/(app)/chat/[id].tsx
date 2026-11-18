import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { AiBubble, UserBubble } from '@/components/ui/chat';
import { Text } from '@/components/ui/Text';
import { TitleBar } from '@/components/chat-report/TitleBar';
import { useChat } from '@/hooks/useChatHistory';
import { chatKindLabel, hhmm } from '@/lib/chatLabels';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// 웹의 backHref="/chat/history"처럼 항상 지난 대화로 돌아간다. 아래에 지난 대화가 없으면 이 화면을 그것으로 바꾼다.
const backToHistory = () => router.dismissTo('/chat/history');

function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
      <Screen footer={<Button onPress={() => retry()}>다시 시도</Button>}>
        <TitleBar title="" onBack={backToHistory} />
        <Text className="text-center text-[14px] text-sub mt-24 px-5">대화를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Text>
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
      footer={
        <Button
          // 탭 화면으로 갈 때는 쌓인 화면을 걷어내고 기존 탭으로 돌아간다(navigate는 탭을 한 겹 더 쌓는다).
          onPress={() => (chat.kind === 'free' ? router.dismissTo({ pathname: '/chat', params: { resume: chat.id } }) : router.dismissTo('/report'))}
        >
          {chat.kind === 'free' ? '이어서 대화하기' : '리포트로 가기'}
        </Button>
      }
    >
      <TitleBar
        onBack={backToHistory}
        title={`${d.getMonth() + 1}월 ${d.getDate()}일 · ${WEEK[d.getDay()]}`}
        sub={`${hhmm(chat.startedAt)} · ${chatKindLabel(chat)}`}
      />
      <View className="px-4 pt-4 pb-6 gap-4">
        {chat.messages.map((m, i) => (m.role === 'user' ? <UserBubble key={i}>{m.text}</UserBubble> : <AiBubble key={i}>{m.text}</AiBubble>))}
        <View className="items-center">
          <View className="h-7 px-3 rounded-full bg-[#E6E6EC] justify-center">
            <Text className="text-[12px] text-[#48484F]">대화가 끝났어요</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

export default function ChatDetailScreen() {
  return (
    <SensitiveGate>
      <ChatDetail />
    </SensitiveGate>
  );
}
