'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Pressable, ScrollView, View } from './rn';
import { Screen } from './Screen';
import { Text } from './Text';
import { useTheme } from '@/lib/theme';
import { ChatFab, Spinner } from './primitives';
import { NAV_HEIGHT, navOffset } from '@/components/layout/BottomNav';
import { AskSheet } from './AskSheet';
import { Skeleton, StaggerText } from './states';

export type ReportTab = 'summary' | 'strengths' | 'keywords' | 'compare' | 'growth';

export const REPORT_TABS: { key: ReportTab; label: string; context: string }[] = [
  { key: 'summary', label: '요약', context: '이번 주 요약' },
  { key: 'strengths', label: '강점·약점', context: '강점 / 약점' },
  { key: 'keywords', label: '키워드', context: '키워드 · 에너지' },
  { key: 'compare', label: '남 vs 나', context: '남 vs 나' },
  { key: 'growth', label: '성장', context: '성장 지표' },
];

const PERIODS = ['일', '주', '월', '년'];

/** "2026년 7월 28일 ~ 8월 3일" */
export function weekRangeLabel(start: string, end: string) {
  const [y, m, d] = start.split('-').map(Number);
  const [, m2, d2] = end.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일 ~ ${m2 === m ? '' : `${m2}월 `}${d2}일`;
}

/**
 * 리포트 화면 틀 (8a~8e): 위 밑줄 탭 · 기간 선택 · "이번 주 리포트" 머리, 아래는 회색 띠로 나뉜 흰 칸들.
 * 웹은 항목마다 주소가 달랐다. 앱은 리포트 탭 안에서 위 탭만 바꿔 하단 탭 바가 그대로 남게 한다.
 * 기간은 아직 주간 리포트만 있어 '주'만 고를 수 있다.
 */
export function ReportScreen({
  tab,
  onTabChange,
  range,
  children,
  footer,
}: {
  tab: ReportTab;
  onTabChange: (t: ReportTab) => void;
  /** 기간 문구 (예: weekRangeLabel(...)) */
  range?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const [ask, setAsk] = useState(false);
  const context = REPORT_TABS.find((t) => t.key === tab)?.context ?? '리포트';
  // 떠 있는 탭 바(와 하단 버튼) 바로 위에 띄운다.
  const fabBottom = NAV_HEIGHT + navOffset() + 12 + (footer ? 72 : 0);

  return (
    <Screen
      inTabs
      scroll={false}
      footer={footer}
      overlay={
        <>
          <View pointerEvents="box-none" className="absolute right-5 z-20" style={{ bottom: fabBottom }}>
            <ChatFab onPress={() => setAsk(true)} />
          </View>
          <AskSheet open={ask} onClose={() => setAsk(false)} context={context} />
        </>
      }
    >
      {/* 웹의 sticky 헤더: 스크롤 영역 밖에 두어 위에 고정한다. */}
      <View className="flex-row border-b border-surface-2 px-3" accessibilityRole="tablist" accessibilityLabel="리포트 항목">
        {REPORT_TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable
              key={t.key}
              onPress={() => onTabChange(t.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              className="flex-1 h-12 items-center justify-center"
            >
              <Text numberOfLines={1} className={`text-[16px] ${active ? 'font-bold text-primary' : 'font-medium text-text-3'}`}>
                {t.label}
              </Text>
              {active && <View className="absolute left-1 right-1 bottom-0 h-[3px] rounded-full bg-primary" />}
            </Pressable>
          );
        })}
      </View>
      <ScrollView className="flex-1 min-h-0" contentContainerStyle={{ paddingBottom: footer ? 16 : 88 }}>
        <View className="px-5 pt-4 pb-6">
          <View className="flex-row h-11 rounded-full bg-surface-2 p-1" accessibilityLabel="기간">
            {PERIODS.map((p) => (
              <View
                key={p}
                accessibilityState={{ selected: p === '주', disabled: p !== '주' }}
                accessibilityHint={p === '주' ? undefined : '준비 중이에요'}
                className={`flex-1 rounded-full items-center justify-center ${p === '주' ? 'bg-primary' : ''}`}
              >
                <Text className={`text-[16px] ${p === '주' ? 'font-bold text-white' : 'text-mute'}`}>{p}</Text>
              </View>
            ))}
          </View>
          <Text accessibilityRole="header" className="mt-6 text-[24px] font-bold tracking-[-0.5px] text-primary">
            이번 주 리포트
          </Text>
          {range ? <Text className="mt-1 text-[16px] text-text-3 tabular-nums">{range}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </Screen>
  );
}

/** 회색 띠 위의 흰 칸 하나 */
export function ReportSection({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <View className={`border-t-8 border-surface px-6 pt-7 pb-7 ${className}`}>
      {title ? (
        <Text accessibilityRole="header" className="text-[20px] font-bold text-ink">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/** 칸 머리의 숫자 묶음 (문장 정확도 76% · 기록 12개 …) */
export function StatRow({ items }: { items: { label: string; value: string; delta?: ReactNode }[] }) {
  return (
    <View className="mt-4 flex-row gap-2">
      {items.map((it) => (
        <View key={it.label} className="flex-1">
          <Text className="text-[12px] text-sub">{it.label}</Text>
          <View className="mt-1 flex-row items-baseline gap-1.5">
            <Text className="text-[20px] font-bold text-ink tabular-nums">{it.value}</Text>
            {it.delta}
          </View>
        </View>
      ))}
    </View>
  );
}

/** 숫자 줄의 값을 못 불러왔을 때 그 아래에 두는 다시 불러오기 (예: 연속 기록일). */
export function StatRetry({ failed, onRetry, label }: { failed: boolean; onRetry: () => void; label: string }) {
  if (!failed) return null;
  return (
    <Pressable onPress={onRetry} accessibilityRole="button" className="mt-2 self-end">
      <Text className="text-[12px] font-semibold text-primary">{label}</Text>
    </Pressable>
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
  const { isDark } = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={mid} cy={mid} r={r} fill="none" stroke={isDark ? '#3A3946' : '#ECECF1'} strokeWidth={stroke} />
        <circle cx={mid} cy={mid} r={r} fill="none" stroke="#6367FF" strokeWidth={stroke} strokeDasharray={`${(base / 100) * c} ${c}`} />
        {extra > 0 && (
          <circle
            cx={mid}
            cy={mid}
            r={r}
            fill="none"
            stroke="#FFE066"
            strokeWidth={stroke}
            strokeDasharray={`${(extra / 100) * c} ${c}`}
            strokeDashoffset={-(base / 100) * c}
          />
        )}
      </svg>
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
  const { isDark, fg, bg } = useTheme();

  return (
    <svg width={size} height={size + 12} viewBox={`0 0 ${size} ${size + 12}`}>
      {[1, 0.66, 0.33].map((f) => (
        <polygon key={f} points={poly(f)} fill={f === 1 ? bg('#F1F1F5') : 'none'} stroke={isDark ? '#3A3946' : '#E2E2E8'} strokeWidth={1} />
      ))}
      <polygon points={poly(fr)} fill={bg(fill)} stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      {fr.map((f, i) => {
        const [x, y] = pt(i, f);
        return <circle key={i} cx={x} cy={y} r={3.2} fill={color} />;
      })}
      {labels.map((l, i) => {
        const [x, y] = pt(i, 1.38);
        return (
          <text key={l} x={x} y={y + 4} textAnchor="middle" fontSize={12} fontFamily="Pretendard, sans-serif" fill={fg('#48484F')}>
            {l}
          </text>
        );
      })}
    </svg>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`rounded-[20px] bg-surface px-5 py-5 ${className}`}>{children}</View>;
}

function SmallButton({ label, onPress, disabled, loading = false }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || loading, busy: loading }}
      className={`mt-5 h-11 min-w-[120px] px-5 rounded-xl bg-primary items-center justify-center ${disabled && !loading ? 'opacity-50' : 'active:opacity-80'}`}
    >
      {loading ? <Spinner size={18} /> : <Text className="text-[14px] font-semibold text-white">{label}</Text>}
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
  const { fg } = useTheme();
  const lockColor = fg('#71717A');
  if (error) {
    return (
      <View className="rounded-3xl bg-surface px-5 py-7 items-center">
        <Text className="text-[16px] font-bold text-ink text-center">{error}</Text>
        <SmallButton label="다시 시도" onPress={onGenerate} loading={generating} />
      </View>
    );
  }
  return (
    <View className="rounded-3xl bg-surface px-5 py-7 items-center">
      {/* 회색 원 안에 선만 있는 자물쇠. 아이콘은 원보다 한 톤 진한 회색이다. */}
      <View className="w-12 h-12 rounded-full bg-track items-center justify-center">
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <path d="M7 10.5V8a5 5 0 0 1 10 0v2.5M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5ZM12 14.5v2" stroke={lockColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </View>
      <View className="mt-4 items-center">
        <StaggerText header text="이번 주 리포트가 아직 없어요" className="text-[16px] font-bold text-ink text-center" />
      </View>
      <View className="mt-1.5 items-center">
        <StaggerText delay={70} text={`이번 주 기록이 ${min}개 쌓이면\nAI가 한 주를 정리해 드려요`} className="text-[12px] text-sub leading-[21px] text-center" />
      </View>
      <View className="flex-row items-center gap-3 w-full mt-5">
        <View className="flex-1 h-1.5 rounded-full bg-track overflow-hidden">
          <View className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (recordCount / min) * 100)}%` }} />
        </View>
        <Text className="tabular-nums text-[12px] font-semibold text-primary">
          {Math.min(recordCount, min)} / {min}
        </Text>
      </View>
      {canGenerate ? (
        <SmallButton label="이번 주 리포트 만들기" onPress={onGenerate} loading={generating} />
      ) : (
        <Link href="/diary/chat" className="mt-5 h-11 px-5 rounded-xl bg-ink flex flex-col justify-center active:opacity-80">
          <Text className="text-[14px] font-semibold text-page">오늘 기록하러 가기</Text>
        </Link>
      )}
    </View>
  );
}

/** 리포트 content에서 뽑은 문장 목록 (발견 1 · 발견 2 …). 비어 있으면 안내 문구. */
export function ContentList({ title, items, empty = '이번 리포트에는 이 항목이 없어요', label }: { title: string; items: string[]; empty?: string; label?: string }) {
  return (
    <ReportSection title={title}>
      {items.length > 0 ? (
        <View className="mt-4 gap-2.5">
          {items.map((t, i) => (
            <View key={`${i}-${t}`} className="rounded-2xl bg-surface px-[18px] py-4">
              {label ? <Text className="text-[12px] font-semibold text-primary">{`${label} ${i + 1}`}</Text> : null}
              <Text className={`text-[16px] font-medium leading-[26px] text-ink ${label ? 'mt-1.5' : ''}`}>{t}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-[14px] text-sub mt-3">{empty}</Text>
      )}
    </ReportSection>
  );
}

/** 리포트를 불러오는 동안 분석 자리에 띄우는 뼈대 */
export function ContentSkeleton() {
  return (
    <View className="border-t-8 border-surface px-6 py-7" accessibilityLabel="리포트 불러오는 중">
      <Skeleton className="w-[90px] h-5" />
      <Skeleton className="h-14 mt-5 rounded-2xl" />
      <Skeleton className="h-14 mt-3 rounded-2xl" />
    </View>
  );
}
