import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Link, Redirect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { LogoMark } from '@/components/ui/brand';
import { Span, Text } from '@/components/ui/Text';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { useAuthStore } from '@/store';

/** 스플래시를 보여주는 시간(ms) */
const SPLASH_MS = 2600;
/** 스플래시가 걷히며 시작 화면으로 넘어가는 시간(ms) */
const TRANSITION_MS = 900;
const EASE = Easing.bezier(0.65, 0, 0.35, 1);

/** 스플래시는 앱을 처음 열 때만 보여준다. 앱 안에서 이동하는 동안 유지되고(로그인 → 뒤로가기 등) 앱을 다시 시작하면 초기화된다. */
let splashShown = false;

/** 시작 화면 위에 겹쳐 놓았다가 서서히 걷어내는 스플래시. */
function SplashOverlay({ leaving }: { leaving: boolean }) {
  const opacity = useSharedValue(1);
  const textOpacity = useSharedValue(1);
  useEffect(() => {
    if (!leaving) return;
    opacity.value = withTiming(0, { duration: TRANSITION_MS, easing: Easing.inOut(Easing.ease), reduceMotion: ReduceMotion.System });
    // 배경보다 글자를 먼저 지워서 시작 화면 로고와 겹쳐 보이지 않게 한다.
    textOpacity.value = withTiming(0, { duration: 300 });
  }, [leaving, opacity, textOpacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents={leaving ? 'none' : 'auto'}>
      <LinearGradient
        style={StyleSheet.absoluteFill}
        colors={['#4F52E5', '#8E8BFF', '#7C80FF', '#3B3E9E', '#2E3190']}
        locations={[0, 0.35, 0.55, 0.8, 1]}
      />
      <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, textStyle]}>
        <Text className="text-[17px] text-white/90">
          나를 이해하는 <Span className="font-bold text-white">짧은 기록</Span>
        </Text>
        <View className="flex-row items-center gap-3 mt-3">
          <LogoMark size={46} color="#FFFFFF" />
          <Text className="text-[34px] font-semibold text-white tracking-tight">metame</Text>
        </View>
        <Text className="absolute bottom-12 text-[12px] text-white/80">나를 이해하는 가장 짧은 기록</Text>
      </Animated.View>
    </Animated.View>
  );
}

/** 스플래시가 걷히기 시작하면 아래에서 살짝 올라오며 나타난다. */
function Reveal({ show, delay, children }: { show: boolean; delay: number; children: ReactNode }) {
  const p = useSharedValue(show ? 1 : 0);
  useEffect(() => {
    if (show) p.value = withDelay(delay, withTiming(1, { duration: 700, easing: EASE, reduceMotion: ReduceMotion.System }));
  }, [show, delay, p]);
  const style = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: (1 - p.value) * 24 }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** 상단 보라색 영역: 아래쪽에 내려가 있다가 스플래시와 함께 제자리로 올라온다. */
function TopGradient({ revealed }: { revealed: boolean }) {
  const { height } = useWindowDimensions();
  const y = useSharedValue(revealed ? 0 : height * 0.35);
  useEffect(() => {
    if (revealed) y.value = withTiming(0, { duration: TRANSITION_MS, easing: EASE, reduceMotion: ReduceMotion.System });
  }, [revealed, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <LinearGradient
        style={StyleSheet.absoluteFill}
        colors={['#4F52E5', '#6367FF', '#8F92FF', '#E9E9FF', '#FFFFFF']}
        locations={[0, 0.22, 0.38, 0.5, 0.58]}
      />
    </Animated.View>
  );
}

export default function StartScreen() {
  const token = useAuthStore((s) => s.accessToken);
  const [skipSplash] = useState(() => splashShown);
  const [phase, setPhase] = useState<'splash' | 'leaving' | 'start'>(skipSplash ? 'start' : 'splash');
  const revealed = phase !== 'splash';

  useEffect(() => {
    if (skipSplash) return;
    // 스플래시를 보여준 뒤 걷어내고, 이미 로그인한 사용자는 메인으로 보낸다.
    const leave = setTimeout(() => {
      splashShown = true;
      if (useAuthStore.getState().accessToken) router.replace('/main');
      else setPhase('leaving');
    }, SPLASH_MS);
    const done = setTimeout(() => setPhase('start'), SPLASH_MS + TRANSITION_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [skipSplash]);

  // 스플래시를 이미 봤다면 로그인한 사용자는 바로 메인으로.
  if (skipSplash && token) return <Redirect href="/main" />;

  return (
    <View className="flex-1">
      <Screen
        bg="#4F52E5"
        statusFg="light"
        background={<TopGradient revealed={revealed} />}
        footer={
          <Reveal show={revealed} delay={450}>
            <View className="gap-3">
              <Button onPress={() => router.push('/login')}>로그인</Button>
              <GoogleLoginButton />
              <View className="flex-row justify-center mt-1">
                <Text className="text-[13px] text-sub">계정이 존재하지 않는다면? </Text>
                <Link href="/terms">
                  <Text className="text-[13px] text-primary font-semibold">회원가입</Text>
                </Link>
              </View>
            </View>
          </Reveal>
        }
      >
        <Reveal show={revealed} delay={150}>
          <View className="items-center pt-[110px]">
            <LogoMark size={112} color="#FFFFFF" />
            <Text
              className="text-[44px] font-bold text-white tracking-tight -mt-1"
              style={{ textShadowColor: 'rgba(60,60,200,0.25)', textShadowOffset: { width: 0, height: 6 }, textShadowRadius: 20 }}
            >
              metame
            </Text>
          </View>
        </Reveal>
        <Reveal show={revealed} delay={300}>
          <View className="px-7 mt-[110px]">
            <Text className="text-[27px] font-bold text-ink leading-[38px]">{'하루 한 번의 기록으로\n나를 한 문장으로'}</Text>
            <Text className="text-[14px] text-[#6B6B73] mt-4 leading-[22px]">
              질문에 답하기만 하면 됩니다. 기록이 쌓일수록 그 문장이 정확해져요.
            </Text>
          </View>
        </Reveal>
      </Screen>
      {phase !== 'start' && <SplashOverlay leaving={phase === 'leaving'} />}
    </View>
  );
}
