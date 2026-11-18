import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Link, router, usePathname, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Polygon, Text as SvgText } from 'react-native-svg';
import { Screen } from './Screen';
import { Text } from './Text';
import { ChatFab } from './primitives';
import { ChevronLeft, LockIcon } from './icons';
import { AskSheet } from './AskSheet';

export const REPORT_TABS: { href: Href; label: string; context: string }[] = [
  { href: '/report/summary', label: '요약', context: '이번 주 요약' },
  { href: '/report/strengths', label: '강점·약점', context: '강점 / 약점' },
  { href: '/report/keywords', label: '키워드', context: '키워드 · 에너지' },
  { href: '/report/compare', label: '남 vs 나', context: '남 vs 나' },
  { href: '/report/growth', label: '성장', context: '성장 지표' },
];

const isActive = (pathname: string, href: Href) => typeof href === 'string' && pathname.startsWith(href);

/** 글자만 넘기면 지정한 글자 모양으로 감싼다. */
const asText = (node: ReactNode, cls: string) =>
  typeof node === 'string' || typeof node === 'number' ? <Text className={cls}>{node}</Text> : node;

/**
 * 리포트 상세 틀: 뒤로 + 알약 탭(위에 고정), eyebrow/제목 블록, 물어보기 시트가 달린 채팅 버튼.
 * nav는 웹의 하단 탭 표시 여부 — 앱에서는 탭 안 화면(inTabs)으로 처리한다.
 */
export function ReportScreen({
  eyebrow,
  title,
  sub,
  children,
  footer,
  nav = false,
  headerExtra,
}: {
  eyebrow?: string;
  title?: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  nav?: boolean;
  headerExtra?: ReactNode;
}) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [ask, setAsk] = useState(false);
  const context = REPORT_TABS.find((t) => isActive(pathname, t.href))?.context ?? '리포트';
  // 하단 버튼(footer)이 있으면 그 위로 띄운다. 탭 안 화면은 탭 바가 아래 안전 영역을 맡는다.
  const fabBottom = (nav ? 0 : insets.bottom) + (footer ? 92 : 24);

  return (
    <Screen
      inTabs={nav}
      footer={footer}
      scroll={false}
      overlay={
        <>
          <View className="absolute right-5 z-20" style={{ bottom: fabBottom }}>
            <ChatFab onPress={() => setAsk(true)} />
          </View>
          <AskSheet open={ask} onClose={() => setAsk(false)} context={context} />
        </>
      }
    >
      {/* 웹의 sticky 헤더: 스크롤 영역 밖에 두어 위에 고정한다. */}
      <View className="bg-white">
        <View className="flex-row items-center px-5 h-16">
          <Pressable
            onPress={() => router.dismissTo('/report')}
            accessibilityRole="button"
            accessibilityLabel="리포트로"
            className="w-10 h-10 rounded-full bg-surface-2 items-center justify-center mr-2.5"
          >
            <ChevronLeft />
          </Pressable>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5">
            {REPORT_TABS.map((t) => {
              const active = isActive(pathname, t.href);
              return (
                <Link key={t.label} href={t.href} replace asChild>
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    className={`h-9 px-3 rounded-full justify-center ${active ? 'bg-ink' : 'bg-surface-2'}`}
                  >
                    <Text className={`text-[13px] ${active ? 'font-semibold text-white' : 'text-[#48484F]'}`}>{t.label}</Text>
                  </Pressable>
                </Link>
              );
            })}
          </ScrollView>
        </View>
        {headerExtra}
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!!title && (
          <View className="px-5 pt-3">
            {!!eyebrow && <Text className="font-mono text-[12px] tracking-[1.4px] text-sub">{eyebrow}</Text>}
            <View className="mt-1.5">{asText(title, 'text-[24px] font-bold text-ink')}</View>
            {!!sub && <View className="mt-2">{asText(sub, 'text-[13px] text-sub')}</View>}
          </View>
        )}
        <View className="px-5 pt-6 pb-24 gap-4">{children}</View>
      </ScrollView>
    </Screen>
  );
}

/** 고리 도넛. extra는 끝에 노란색으로 덧붙는 부분(%). */
export function RingDonut({
  size,
  stroke,
  value,
  extra = 0,
  children,
}: {
  size: number;
  stroke: number;
  value: number;
  extra?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const base = value - extra;
  const mid = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={mid} cy={mid} r={r} fill="none" stroke="#ECECF1" strokeWidth={stroke} />
        <Circle cx={mid} cy={mid} r={r} fill="none" stroke="#6367FF" strokeWidth={stroke} strokeDasharray={[(base / 100) * c, c]} />
        {extra > 0 && (
          <Circle
            cx={mid}
            cy={mid}
            r={r}
            fill="none"
            stroke="#FFE066"
            strokeWidth={stroke}
            strokeDasharray={[(extra / 100) * c, c]}
            strokeDashoffset={-(base / 100) * c}
          />
        )}
      </Svg>
      <View className="absolute inset-0 items-center justify-center">{children}</View>
    </View>
  );
}

/** 오각형 레이더 (표현력 · 주도성 · 공감 · 추진력 · 차분함). 값은 0–100. */
export function Radar({ labels, values, color, fill, size = 170 }: { labels: readonly string[]; values: number[]; color: string; fill: string; size?: number }) {
  const cx = size / 2;
  const cy = size / 2 + 6;
  const R = size * 0.3;
  const pt = (i: number, f: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / labels.length;
    return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f];
  };
  const poly = (f: number | number[]) => labels.map((_, i) => pt(i, Array.isArray(f) ? f[i] : f).join(',')).join(' ');
  const fr = values.map((v) => Math.max(0.15, v / 100));

  return (
    <Svg width={size} height={size + 12} viewBox={`0 0 ${size} ${size + 12}`}>
      {[1, 0.66, 0.33].map((f) => (
        <Polygon key={f} points={poly(f)} fill={f === 1 ? '#F1F1F5' : 'none'} stroke="#E2E2E8" strokeWidth={1} />
      ))}
      <Polygon points={poly(fr)} fill={fill} stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      {fr.map((f, i) => {
        const [x, y] = pt(i, f);
        return <Circle key={i} cx={x} cy={y} r={3.2} fill={color} />;
      })}
      {labels.map((l, i) => {
        const [x, y] = pt(i, 1.38);
        return (
          <SvgText key={l} x={x} y={y + 4} textAnchor="middle" fontSize={12} fontFamily="Pretendard-Regular" fill="#48484F">
            {l}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`rounded-3xl bg-surface px-5 py-5 ${className}`}>{children}</View>;
}

function SmallButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={`mt-5 h-11 px-5 rounded-xl bg-primary justify-center ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
    >
      <Text className="text-[14px] font-semibold text-white">{label}</Text>
    </Pressable>
  );
}

/** 이번 주 리포트가 아직 없을 때: 기록 진행도와 '리포트 만들기' / '기록하러 가기'. */
export function ReportLocked({
  recordCount,
  min,
  canGenerate,
  generating,
  onGenerate,
  error,
}: {
  recordCount: number;
  min: number;
  canGenerate: boolean;
  generating: boolean;
  onGenerate: () => void;
  /** 목록 조회·생성 실패 문구. 있으면 진행도 대신 오류와 재시도 버튼을 보여준다. */
  error?: string;
}) {
  if (error) {
    return (
      <View className="rounded-3xl bg-surface px-5 py-7 items-center">
        <Text className="text-[16px] font-bold text-ink text-center">{error}</Text>
        <SmallButton label={generating ? '다시 시도하는 중...' : '다시 시도'} onPress={onGenerate} disabled={generating} />
      </View>
    );
  }
  return (
    <View className="rounded-3xl bg-surface px-5 py-7 items-center">
      <View className="w-12 h-12 rounded-full bg-primary-soft items-center justify-center">
        <LockIcon size={20} color="#6367FF" />
      </View>
      <Text className="text-[16px] font-bold text-ink mt-4 text-center">이번 주 리포트가 아직 없어요</Text>
      <Text className="text-[13px] text-sub mt-1.5 leading-[21px] text-center">{`이번 주 기록이 ${min}개 쌓이면\nAI가 한 주를 정리해 드려요`}</Text>
      <View className="flex-row items-center gap-3 w-full mt-5">
        <View className="flex-1 h-1.5 rounded-full bg-[#E4E4EA] overflow-hidden">
          <View className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (recordCount / min) * 100)}%` }} />
        </View>
        <Text className="font-mono text-[13px] font-semibold text-primary">
          {Math.min(recordCount, min)} / {min}
        </Text>
      </View>
      {canGenerate ? (
        <SmallButton label={generating ? '리포트 만드는 중...' : '이번 주 리포트 만들기'} onPress={onGenerate} disabled={generating} />
      ) : (
        <Link href="/diary/chat" asChild>
          <Pressable accessibilityRole="link" className="mt-5 h-11 px-5 rounded-xl bg-white border border-line justify-center active:opacity-70">
            <Text className="text-[14px] font-semibold text-ink">오늘 기록하러 가기</Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
}

/** 리포트 content에서 뽑은 문장 목록. 비어 있으면 안내 문구. */
export function ContentList({ title, items, empty = '이번 리포트에는 이 항목이 없어요' }: { title: string; items: string[]; empty?: string }) {
  return (
    <Card>
      <Text className="text-[16px] font-bold text-ink">{title}</Text>
      {items.length > 0 ? (
        <View className="mt-1">
          {items.map((t, i) => (
            <View key={`${i}-${t}`} className={`py-3 ${i > 0 ? 'border-t border-[#E6E6EC]' : ''}`}>
              <Text className="text-[15px] text-ink leading-[24px]">{t}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-[13px] text-sub mt-3">{empty}</Text>
      )}
    </Card>
  );
}
