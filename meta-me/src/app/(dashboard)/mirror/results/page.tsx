'use client';

import { useMemo, useRef, useState, type ReactNode } from 'react';
import { StatusView } from '@/components/ui/states';
import { Pressable, ScrollView, View } from '@/components/ui/rn';
import { router } from '@/lib/router';
import { useAuthStore } from '@/store';
import { useListPeerFeedback } from '@/entities/peer-feedback';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, TextButton, goBack } from '@/components/ui/primitives';
import { Span, Text } from '@/components/ui/Text';
import { AXES } from '@/lib/mock';
import { HARD, ROLES, parseFeedback, tally } from '@/lib/peerFeedback';
import { useTheme } from '@/lib/theme';
import { withSensitiveGate } from '@/components/SensitiveGate';

const OPEN_AT = 3;
const DONUT = ['#6367FF', '#A9ABFF', '#FFD66B', '#E4E4EA', '#C9CAD3'];
const pctOf = (n: number, total: number) => Math.round((n / total) * 100);

function Block({ q, title, meta, children }: { q: string; title: string; meta: string; children: ReactNode }) {
  return (
    <View className="rounded-[24px] bg-surface px-5 pt-5 pb-5">
      <View className="flex-row items-center gap-2">
        <View className="h-6 px-2 shrink-0 rounded-md bg-primary justify-center">
          <Text className="text-[12px] font-bold text-white">{q}</Text>
        </View>
        <Text accessibilityRole="header" numberOfLines={1} className="flex-1 min-w-0 text-[16px] font-bold text-ink">
          {title}
        </Text>
        <Text className="text-[12px] text-sub shrink-0">{meta}</Text>
      </View>
      {children}
    </View>
  );
}

/** 객관식 한 문항: 도넛 + 범례 (9d Q1) */
function Donut({ rows, total }: { rows: [string, number][]; total: number }) {
  const { bg } = useTheme();
  const R = 70;
  const C = 2 * Math.PI * R;
  // 각 조각의 길이와 시작 위치(앞 조각들 길이의 합)를 미리 구한다.
  const segs = rows.map(([label, n], i) => {
    const len = (n / total) * C;
    const start = rows.slice(0, i).reduce((sum, [, m]) => sum + (m / total) * C, 0);
    return { label, len, start, color: bg(DONUT[i % DONUT.length]) };
  });
  const top = rows[0];
  return (
    <>
      <View className="w-[184px] h-[184px] shrink-0 self-center mt-5">
        <svg width={184} height={184} viewBox="0 0 184 184" style={{ transform: 'rotate(-90deg)' }} aria-hidden>
          <circle cx="92" cy="92" r={R} fill="none" stroke={bg('#E4E4EA')} strokeWidth={30} />
          {segs.map((g) => (
            <circle
              key={g.label}
              cx="92"
              cy="92"
              r={R}
              fill="none"
              stroke={g.color}
              strokeWidth={30}
              strokeDasharray={`${Math.max(g.len - 2, 0)} ${C}`}
              strokeDashoffset={-g.start}
            />
          ))}
        </svg>
        {top && (
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-[24px] font-bold text-ink tabular-nums">{pctOf(top[1], total)}%</Text>
            <Text className="text-[12px] font-semibold text-primary">최다 응답</Text>
          </View>
        )}
      </View>
      <View className="gap-3 mt-6">
        {rows.map(([label, n], i) => (
          <View key={label} className="flex-row items-center gap-3">
            <View className="w-3 h-3 shrink-0 rounded-[4px]" style={{ backgroundColor: bg(DONUT[i % DONUT.length]) }} />
            <Text className={`flex-1 text-[14px] ${i === 0 ? 'font-bold text-ink' : 'text-body'}`}>{label}</Text>
            <Text className={`text-[14px] font-bold tabular-nums ${i === 0 ? 'text-primary' : n ? 'text-sub' : 'text-mute'}`}>{pctOf(n, total)}%</Text>
          </View>
        ))}
      </View>
    </>
  );
}

/** 막대형 비율 (9d Q2) */
function Bars({ rows, total }: { rows: [string, number][]; total: number }) {
  return (
    <View className="gap-2.5 mt-4">
      {rows.map(([label, n], i) => {
        const pct = pctOf(n, total);
        return (
          <View key={label} className="flex-row items-center gap-3">
            <View className="flex-1 h-10 rounded-xl bg-page overflow-hidden justify-center">
              <View className={`absolute top-0 bottom-0 left-0 rounded-xl ${i === 0 ? 'bg-primary' : 'bg-primary-line'}`} style={{ width: `${Math.max(pct, 12)}%` }} />
              <Text numberOfLines={1} className={`px-4 text-[14px] font-semibold ${i === 0 ? 'text-white' : 'text-ink'}`}>
                {label}
              </Text>
            </View>
            <Text className={`w-11 shrink-0 text-right text-[14px] font-bold tabular-nums ${i === 0 ? 'text-primary' : 'text-sub'}`}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}

function Quotes({ items }: { items: string[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, 2);
  return (
    <View className="gap-2.5 mt-4">
      {shown.map((t, i) => (
        <View key={i} className="rounded-xl bg-page px-4 py-3">
          <Text className="text-[14px] text-ink leading-[22px]">“{t}”</Text>
        </View>
      ))}
      {items.length > 2 && !all && (
        <Pressable onPress={() => setAll(true)} accessibilityRole="button" hitSlop={8} className="self-start mt-1">
          <Text className="text-[12px] text-sub">+ {items.length - 2}개 더보기</Text>
        </Pressable>
      )}
    </View>
  );
}

function Header({ page, onBack }: { page?: number; onBack: () => void }) {
  return (
    <View className="h-14 shrink-0 flex-row items-center justify-center px-5">
      <View className="absolute left-5">
        <BackButton onPress={onBack} />
      </View>
      <Text accessibilityRole="header" className="text-[16px] font-semibold text-ink">
        친구들의 답
      </Text>
      {page !== undefined && <Text className="absolute right-5 text-[12px] text-sub tabular-nums">{page + 1} / 2</Text>}
    </View>
  );
}

/** 친구 답 모아 보기 (9d · 9d2). 친구가 보낸 줄 형식을 다시 읽어 문항별로 모은다. */
function MirrorResultsScreen() {
  const { fg, bg } = useTheme();
  const token = useAuthStore((s) => s.accessToken);
  const { data, isError, refetch, isFetching } = useListPeerFeedback({ size: 100 }, !!token);
  const [page, setPage] = useState<0 | 1>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => (data?.feedbacks ?? []).map(parseFeedback), [data]);
  const count = data?.total_elements ?? parsed.length;

  const agg = useMemo(() => {
    const withAll = (rows: [string, number][], options: string[]) => [...rows, ...options.filter((o) => !rows.some(([l]) => l === o)).map((o) => [o, 0] as [string, number])];
    const roles = parsed.filter((p) => p.role);
    const hards = parsed.filter((p) => p.hard);
    const wordsBy = parsed.filter((p) => p.words.length > 0);
    const scored = AXES.map((axis) => {
      const xs = parsed.map((p) => p.scores[axis]).filter((n): n is number => !!n);
      return { axis, n: xs.length, avg: xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null };
    });
    return {
      relation: tally(parsed.map((p) => p.relation))[0]?.[0],
      roles: { n: roles.length, rows: withAll(tally(roles.map((p) => p.role)), ROLES.slice(0, 4)) },
      hards: { n: hards.length, rows: withAll(tally(hards.map((p) => p.hard)), HARD) },
      words: { n: wordsBy.length, rows: tally(wordsBy.flatMap((p) => p.words)).slice(0, 5) },
      strengths: parsed.flatMap((p) => (p.strength ? [p.strength] : [])),
      messages: parsed.flatMap((p) => (p.message ? [p.message] : [])),
      titles: { n: parsed.filter((p) => p.title).length, rows: tally(parsed.map((p) => p.title)).slice(0, 4) },
      scored,
      scoredN: Math.max(0, ...scored.map((s) => s.n)),
    };
  }, [parsed]);

  if (!data && isError) {
    return (
      <Screen>
        <Header onBack={() => goBack('/mirror/invite')} />
        <StatusView kind="error" title="친구 답을 불러오지 못했어요" onRetry={() => refetch()} retrying={isFetching} className="pt-28" />
      </Screen>
    );
  }

  if (!data || count < OPEN_AT) {
    return (
      <Screen footer={<Button onPress={() => router.push('/mirror/invite')}>친구에게 물어보기</Button>}>
        <Header onBack={() => goBack('/mirror/invite')} />
        <View className="px-5 pt-20 items-center">
          <Text className="text-[20px] font-bold text-ink text-center">{data ? '아직 결과가 열리지 않았어요' : '불러오는 중...'}</Text>
          {data && (
            <Text className="text-[14px] text-sub leading-[23px] mt-2 text-center">
              {`친구 ${OPEN_AT}명 이상이 답하면 여기에서 볼 수 있어요\n지금까지 `}
              <Span className="text-[14px] font-bold text-primary">{count}명</Span> 답했어요
            </Text>
          )}
        </View>
      </Screen>
    );
  }

  const goPage = (p: 0 | 1) => {
    setPage(p);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <Screen
      scroll={false}
      footer={
        page === 0 ? (
          <Button onPress={() => goPage(1)}>다음</Button>
        ) : (
          <>
            {/* 탭 화면으로 갈 때는 쌓인 화면을 걷어내고 기존 탭으로 돌아간다. */}
            <Button onPress={() => router.dismissTo({ pathname: '/report', params: { tab: 'compare' } })}>비교 리포트 보기</Button>
            <TextButton className="mt-1" textClassName="text-primary" onPress={() => router.push('/mirror/invite')}>
              친구에게 더 물어보기 ›
            </TextButton>
          </>
        )
      }
    >
      <Header page={page} onBack={() => (page === 1 ? goPage(0) : goBack('/mirror/invite'))} />
      <ScrollView ref={scrollRef} className="flex-1 min-h-0" showsVerticalScrollIndicator={false}>
        {page === 0 ? (
          <View className="px-5 pb-6">
            <View className="flex-row items-end justify-between mt-3 mb-4">
              <Text className="text-[24px] font-bold text-ink">친구들의 답이 모였어요</Text>
              {agg.relation && <Text className="text-[12px] text-sub">{agg.relation}</Text>}
            </View>
            <View className="gap-4">
              {agg.roles.n > 0 && (
                <Block q="Q1" title="그 장면에서 어떤 역할이었나요?" meta={`객관식 · ${agg.roles.n}명`}>
                  <Donut rows={agg.roles.rows} total={agg.roles.n} />
                </Block>
              )}
              {agg.words.n > 0 && (
                <Block q="Q2" title="먼저 생각나는 단어" meta={`복수 선택 · ${agg.words.n}명`}>
                  <Bars rows={agg.words.rows} total={agg.words.n} />
                </Block>
              )}
              {agg.hards.n > 0 && (
                <Block q="Q3" title="가장 힘들어 보였던 때" meta={`객관식 · ${agg.hards.n}명`}>
                  <Bars rows={agg.hards.rows} total={agg.hards.n} />
                </Block>
              )}
              {agg.roles.n + agg.words.n + agg.hards.n === 0 && (
                <Text className="text-[14px] text-sub text-center mt-10">객관식으로 모인 답이 아직 없어요. 다음 장에서 친구들의 글을 볼 수 있어요.</Text>
              )}
            </View>
          </View>
        ) : (
          <View className="px-5 pt-3 pb-6 gap-4">
            {agg.strengths.length > 0 && (
              <Block q="Q4" title="스스로는 잘 모를 것 같은 장점" meta={`서술 · ${agg.strengths.length}명`}>
                <Quotes items={agg.strengths} />
              </Block>
            )}
            {agg.scoredN > 0 && (
              <Block q="Q5" title="다섯 가지 모습, 친구의 점수" meta={`척도 · ${agg.scoredN}명`}>
                <Text className="text-[12px] text-sub leading-[19px] mt-3">친구들이 다섯 가지 모습을 1–5점으로 매긴 평균이에요.</Text>
                <View className="mt-2">
                  {agg.scored.map((s, i) => (
                    <View key={s.axis} className={`py-4 ${i > 0 ? 'border-t' : ''}`} style={i > 0 ? { borderTopColor: bg('#E6E6EC') } : undefined}>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-[16px] font-bold text-ink">{s.axis}</Text>
                        <Text className="text-[14px] font-bold text-primary tabular-nums">{s.avg === null ? '-' : s.avg.toFixed(1)}</Text>
                      </View>
                      <View className="h-3 shrink-0 mt-3 mx-2">
                        <View className="absolute left-0 right-0 top-[5px] h-0.5" style={{ backgroundColor: fg('#DADAE2') }} />
                        {[0, 1, 2, 3, 4].map((t) => (
                          <View key={t} className="absolute top-0 w-0.5 h-3" style={{ left: `${t * 25}%`, backgroundColor: fg('#DADAE2') }} />
                        ))}
                        {s.avg !== null && (
                          <View
                            className="absolute w-4 h-4 rounded-full bg-primary"
                            style={{ left: `${((s.avg - 1) / 4) * 100}%`, top: -2, marginLeft: -8, boxShadow: '0 0 0 4px rgba(99,103,255,0.2)' }}
                          />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </Block>
            )}
            {agg.titles.n > 0 && (
              <Block q="칭호" title="친구들이 붙여 준 칭호" meta={`${agg.titles.n}명`}>
                <Bars rows={agg.titles.rows as [string, number][]} total={agg.titles.n} />
              </Block>
            )}
            {agg.messages.length > 0 && (
              <Block q="Q6" title="친구들이 남긴 한 마디" meta={`서술 · ${agg.messages.length}명`}>
                <Quotes items={agg.messages} />
              </Block>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(MirrorResultsScreen);
