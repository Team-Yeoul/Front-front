'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from './primitives';
import { Sheet } from './overlays';
import { AiBubble, Composer, OutlineChip, TypingBubble, UserBubble } from './chat';

interface QA {
  q: string;
  a: string;
  refs?: string[];
  follow?: string[];
}

const DEFAULT_QA: QA[] = [
  {
    q: '왜 준비가 길어지는 게 약점이에요?',
    a: '준비가 길었던 3일은 실제로 시작한 시간이 평소보다 늦었고, 그날 기록도 짧았어요. 준비 자체보다 시작이 밀리는 게 문제로 잡힌 거예요.',
    refs: ['8월 3일 기록', '8월 5일 기록', '8월 6일 기록'],
    follow: ['시작을 앞당기는 방법', '강점 쪽도 설명해줘'],
  },
  {
    q: '마감 몰입은 어떤 기록에서 나왔어요?',
    a: '8월 1일, 4일 기록에서 마감 직전 기록 분량이 평소의 두 배였어요. “마감이 있어서 오히려 잘 붙었다”는 문장이 대표적이에요.',
    refs: ['8월 1일 기록', '8월 4일 기록'],
  },
  {
    q: '지난주와 비교하면 뭐가 달라졌어요?',
    a: '감정 태그를 3개 이상 고른 날이 2일에서 5일로 늘었어요. 감정을 언어로 정리하는 힘이 좋아진 게 정확도 상승(+8%p)으로 이어졌어요.',
  },
];

interface Turn {
  role: 'user' | 'ai';
  text: string;
  refs?: string[];
  follow?: string[];
}

/** "분석 결과 물어보기" bottom sheet (리포트 · 객관화 미러에서 열림). */
export function AskSheet({
  open,
  onClose,
  context,
  intro = '‘마감 몰입’은 강점으로, ‘시작 전 준비 지연’은 약점으로 나왔어요. 어느 부분을 더 설명해 드릴까요?',
}: {
  open: boolean;
  onClose: () => void;
  context: string;
  intro?: string;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setTurns([]);
      setInput('');
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, typing]);

  const ask = (q: string) => {
    const hit = DEFAULT_QA.find((x) => x.q === q);
    setTurns((t) => [...t, { role: 'user', text: q }]);
    setInput('');
    setTyping(true);
    // 분석 Q&A API가 없어 시안의 예시 답변으로 응답한다.
    setTimeout(() => {
      setTyping(false);
      setTurns((t) => [
        ...t,
        hit
          ? { role: 'ai', text: hit.a, refs: hit.refs, follow: hit.follow }
          : { role: 'ai', text: '좋은 질문이에요. 이번 주 기록 12개를 다시 살펴보고, 관련된 장면을 정리해 둘게요.' },
      ]);
    }, 900);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      height="82%"
      closeButton
      title="분석 결과 물어보기"
      sub={
        <span className="inline-flex h-6 px-2.5 rounded-full bg-primary-soft text-[12px] font-semibold text-primary items-center">
          지금 보는 분석 · {context}
        </span>
      }
    >
      <div ref={listRef} className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-3 flex flex-col gap-4">
        {turns.length === 0 ? (
          <>
            <AiBubble>{intro}</AiBubble>
            <div>
              <p className="text-[12px] font-semibold text-sub px-1">자주 묻는 질문</p>
              <div className="flex flex-col gap-2.5 mt-2.5">
                {DEFAULT_QA.map((qa) => (
                  <button key={qa.q} onClick={() => ask(qa.q)} className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 h-12 text-left">
                    <span className="text-[14px] text-ink">{qa.q}</span>
                    <ChevronRight size={16} color="#6367FF" />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          turns.map((t, i) =>
            t.role === 'user' ? (
              <UserBubble key={i}>{t.text}</UserBubble>
            ) : (
              <div key={i} className="flex flex-col gap-3">
                <AiBubble
                  footer={
                    t.refs && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {t.refs.map((r) => (
                          <span key={r} className="h-7 px-2.5 rounded-lg bg-surface-2 font-mono text-[11px] text-[#48484F] inline-flex items-center">
                            {r}
                          </span>
                        ))}
                      </div>
                    )
                  }
                >
                  {t.text}
                </AiBubble>
                {t.follow && i === turns.length - 1 && (
                  <div className="flex flex-wrap gap-2 pl-9">
                    {t.follow.map((f) => (
                      <OutlineChip key={f} onClick={() => ask(f)}>
                        {f}
                      </OutlineChip>
                    ))}
                  </div>
                )}
              </div>
            ),
          )
        )}
        {typing && <TypingBubble />}
      </div>
      <div className="px-4 pb-4 pt-2">
        <Composer value={input} onChange={setInput} onSend={() => ask(input.trim())} placeholder="이 분석에 대해 궁금한 걸 물어보세요" />
      </div>
    </Sheet>
  );
}
