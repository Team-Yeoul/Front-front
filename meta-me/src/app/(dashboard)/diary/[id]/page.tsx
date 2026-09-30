'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteDailyRecord, useGetDailyRecord } from '@/entities/diary';
import { useAuthStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { Button, ChevronRight, TopBar } from '@/components/ui/primitives';
import { MOCK_DIARY_DETAIL } from '@/lib/mock';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export default function DiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isMock = id.startsWith('d');
  const { data } = useGetDailyRecord(id, !!accessToken && !isMock);
  const del = useDeleteDailyRecord();

  const q = data?.questions[0];
  const created = data ? new Date(data.record.created_at) : null;
  const detail =
    q && created
      ? {
          title: (q.scene_description || q.user_answer || '기록').slice(0, 20),
          date: created.toLocaleDateString('sv-SE').replaceAll('-', '.'),
          meta: `${WEEK[created.getDay()]}요일 · ${String(created.getHours()).padStart(2, '0')}:${String(created.getMinutes()).padStart(2, '0')} 작성`,
          original: q.user_answer,
          // 객관화 문장 API가 기록 상세에 아직 연결되지 않아 장면 묘사를 대신 보여준다.
          objectified: q.scene_description,
          patterns: q.emotion_tag.split(',').map((t) => t.trim()).filter(Boolean),
          cogni: MOCK_DIARY_DETAIL.cogni,
        }
      : MOCK_DIARY_DETAIL;

  const remove = async () => {
    if (!isMock && accessToken) {
      try {
        await del.mutateAsync(id);
      } catch {
        return;
      }
    }
    router.push('/diary');
  };

  return (
    <Screen
      footer={
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="danger" onClick={remove}>
            삭제
          </Button>
          <Button variant="gray" onClick={() => router.push('/diary/write')}>
            수정
          </Button>
        </div>
      }
    >
      <TopBar title={<span className="font-mono">{detail.date}</span>} right={<span className="text-[18px] text-primary tracking-widest">···</span>} />
      <div className="px-5 pt-3">
        <h1 className="text-[24px] font-bold text-ink">{detail.title}</h1>
        <p className="font-mono text-[13px] text-sub mt-1.5">{detail.meta}</p>

        <div className="mt-6 rounded-2xl bg-card border border-line px-5 py-4">
          <p className="text-[12px] font-semibold text-sub">내가 쓴 문장</p>
          <p className="text-[15px] text-ink leading-[1.75] mt-2">{detail.original}</p>
        </div>
        <div className="mt-4 rounded-2xl bg-primary-soft px-5 py-4">
          <p className="text-[12px] font-semibold text-primary">객관화된 문장</p>
          <p className="text-[15px] text-ink leading-[1.75] mt-2">{detail.objectified}</p>
        </div>

        <p className="text-[15px] font-bold text-ink mt-6">감지된 패턴</p>
        <div className="flex flex-wrap gap-2 mt-2.5">
          {detail.patterns.map((p) => (
            <span key={p} className="h-8 px-3.5 rounded-full bg-primary-soft text-[13px] font-semibold text-primary inline-flex items-center">
              {p}
            </span>
          ))}
        </div>

        <button
          onClick={() => router.push(`/dogam/${detail.cogni.id}`)}
          className="w-full mt-6 flex items-center gap-3 rounded-2xl bg-yellow-soft px-4 py-3.5 text-left"
        >
          <span className="w-10 h-10 rounded-xl bg-yellow flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="1.5" stroke="#6367FF" strokeWidth="1.6" />
              <path d="M4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16" stroke="#6367FF" strokeWidth="1.6" />
            </svg>
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[15px] font-bold text-ink">이 기록에서 발급된 코그니</span>
            <span className="block text-[13px] text-gold mt-0.5">{detail.cogni.name} · 도감에서 보기</span>
          </span>
          <ChevronRight size={18} color="#8A6D00" />
        </button>
      </div>
    </Screen>
  );
}
