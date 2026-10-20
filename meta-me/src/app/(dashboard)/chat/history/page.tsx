'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { ChevronRight, SearchIcon, TopBar } from '@/components/ui/primitives';
import { useChatHistory } from '@/hooks/useChatHistory';
import { chatKindLabel, chatPreview, chatTitle, dayGroup, hhmm } from '@/lib/chatLabels';

type Filter = 'all' | 'free' | 'analysis';

// 이 기기에 저장한 대화와 서버의 상담 세션(다른 기기·브라우저에서 나눈 대화)을 함께 보여준다.
export default function ChatHistoryPage() {
  const router = useRouter();
  const { chats, loading } = useChatHistory();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const items = useMemo(
    () =>
      chats.filter(
        (c) => (filter === 'all' || c.kind === filter) && (!query.trim() || c.messages.some((m) => m.text.includes(query.trim()))),
      ),
    [chats, filter, query],
  );
  const groups = [...new Set(items.map((c) => dayGroup(c.startedAt)))];

  return (
    <Screen nav>
      <TopBar title={<span className="text-[17px] font-bold">지난 대화</span>} backHref="/chat" />
      <div className="px-5 pt-2">
        <label className="flex items-center gap-2.5 h-12 rounded-2xl bg-surface-2 border border-line px-4">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="대화 내용 검색"
            className="flex-1 bg-transparent outline-none text-[15px] text-ink placeholder:text-mute"
          />
        </label>
        <div className="flex gap-2 mt-3">
          {(
            [
              ['all', `전체 ${chats.length}`],
              ['free', '자유 대화'],
              ['analysis', '분석 질문'],
            ] as [Filter, string][]
          ).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-9 px-3.5 rounded-full text-[14px] ${filter === f ? 'bg-ink text-white font-semibold' : 'bg-surface-2 text-[#48484F]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-8">
        {groups.map((g) => (
          <section key={g} className="mt-5">
            <p className="font-mono text-[13px] text-sub mb-2.5">{g}</p>
            <div className="flex flex-col gap-3">
              {items
                .filter((c) => dayGroup(c.startedAt) === g)
                .map((c) => (
                  <button key={c.id} onClick={() => router.push(`/chat/${c.id}`)} className="rounded-2xl bg-surface-2/70 px-4 py-4 text-left">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[16px] font-bold text-ink line-clamp-1">{chatTitle(c)}</span>
                      <span className="font-mono text-[12px] text-mute shrink-0 mt-1">{hhmm(c.startedAt)}</span>
                    </div>
                    <p className="text-[14px] text-sub mt-1.5 truncate">{chatPreview(c)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-1.5">
                        {[chatKindLabel(c), c.context].filter(Boolean).map((t) => (
                          <span key={t} className="h-7 px-2.5 rounded-full bg-primary-soft text-[12px] font-semibold text-primary inline-flex items-center">
                            {t}
                          </span>
                        ))}
                      </div>
                      <ChevronRight size={16} />
                    </div>
                  </button>
                ))}
            </div>
          </section>
        ))}
        {items.length === 0 && !loading && (
          <div className="text-center mt-20">
            <p className="text-[15px] font-semibold text-ink">{chats.length === 0 ? '아직 마친 대화가 없어요' : '검색 결과가 없어요'}</p>
            {chats.length === 0 && <p className="text-[13px] text-sub mt-1.5">대화를 나누고 ‘대화 마치기’를 누르면 여기에 저장돼요</p>}
          </div>
        )}
      </div>
    </Screen>
  );
}
