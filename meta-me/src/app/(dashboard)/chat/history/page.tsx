'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { ChevronRight, SearchIcon, TopBar } from '@/components/ui/primitives';
import { MOCK_CHATS } from '@/lib/mock';

type Filter = 'all' | '자유 대화' | '분석 질문';

// 대화 세션 목록 API가 없어(세션 생성·메시지 조회만 있음) 시안 예시로 목록을 보여준다.
export default function ChatHistoryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const items = useMemo(
    () =>
      MOCK_CHATS.filter((c) => (filter === 'all' || c.kind === filter) && (c.question + c.preview).includes(query.trim())),
    [filter, query],
  );
  const groups = [...new Set(items.map((c) => c.group))];

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
          {(['all', '자유 대화', '분석 질문'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-9 px-3.5 rounded-full text-[14px] ${filter === f ? 'bg-ink text-white font-semibold' : 'bg-surface-2 text-[#48484F]'}`}
            >
              {f === 'all' ? `전체 ${MOCK_CHATS.length * 3}` : f}
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
                .filter((c) => c.group === g)
                .map((c) => (
                  <button key={c.id} onClick={() => router.push(`/chat/${c.id}`)} className="rounded-2xl bg-surface-2/70 px-4 py-4 text-left">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[16px] font-bold text-ink">{c.question}</span>
                      <span className="font-mono text-[12px] text-mute shrink-0 mt-1">{c.time}</span>
                    </div>
                    <p className="text-[14px] text-sub mt-1.5 truncate">{c.preview}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-1.5">
                        {[c.kind, ...c.tags].map((t) => (
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
        {items.length === 0 && <p className="text-center text-[14px] text-sub mt-16">검색 결과가 없어요.</p>}
      </div>
    </Screen>
  );
}
