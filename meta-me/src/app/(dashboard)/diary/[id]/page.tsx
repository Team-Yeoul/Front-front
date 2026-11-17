'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteDailyRecord, useGetDailyRecord } from '@/entities/diary';
import { useAuthStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { Button, TopBar } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlays';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export default function DiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data, isError } = useGetDailyRecord(id, !!accessToken);
  const del = useDeleteDailyRecord();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const q = data?.questions?.[0];
  const created = data ? new Date(data.record.recorded_at) : null;
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
        }
      : null;

  const remove = async () => {
    if (del.isPending) return;
    setDeleteError('');
    try {
      await del.mutateAsync(id);
    } catch {
      setConfirmDelete(false);
      setDeleteError('기록을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    router.push('/diary');
  };

  if (!detail) {
    // 응답은 왔는데 질문이 없는 기록이면 '불러오는 중'에 멈추지 않게 따로 안내한다.
    const message = isError ? '기록을 불러오지 못했어요.' : data ? '표시할 내용이 없는 기록이에요.' : '불러오는 중...';
    return (
      <Screen>
        <TopBar backHref="/diary" />
        <p className="text-center text-[14px] text-sub mt-24">{message}</p>
      </Screen>
    );
  }

  return (
    <Screen
      overlay={
        <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
          <p className="text-[17px] font-bold text-ink text-center">이 기록을 삭제할까요?</p>
          <p className="text-[13px] text-sub text-center mt-2">삭제한 기록은 되돌릴 수 없어요.</p>
          <div className="grid grid-cols-2 gap-2 mt-5">
            <Button variant="gray" onClick={() => setConfirmDelete(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={remove} disabled={del.isPending}>
              {del.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </Modal>
      }
      footer={
        <div className="grid grid-cols-2 gap-2.5">
          {deleteError && <p className="col-span-2 text-[13px] text-danger text-center">{deleteError}</p>}
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            삭제
          </Button>
          <Button variant="gray" onClick={() => router.push(`/diary/write?edit=${id}`)}>
            수정
          </Button>
        </div>
      }
    >
      {/* 메인 '오늘 기록 다시 보기' 등 어디서 들어와도 뒤로가기는 다이어리 목록으로 간다. */}
      <TopBar backHref="/diary" title={<span className="font-mono">{detail.date}</span>} right={<span className="text-[18px] text-primary tracking-widest">···</span>} />
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

      </div>
    </Screen>
  );
}
