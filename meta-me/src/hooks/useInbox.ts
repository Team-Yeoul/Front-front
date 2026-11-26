import { useMemo } from 'react';
import { useListPeerFeedback } from '@/entities/peer-feedback';
import { useListReports } from '@/entities/report';
import { useAuthStore, useLocalStore } from '@/store';
import { useCollection } from '@/hooks/useCollection';
import { useSensitiveConsent } from '@/hooks/useSensitiveConsent';

/*
 * 알림함 (10n). 서버에 알림 목록 API가 없어서, 이미 받는 데이터로 알림을 만든다.
 * - 친구 응답(피어 피드백) · 새로 만난 코그니 · 나온 리포트 · 앱(기기)이 받아 둔 푸시 알림(웹은 푸시를 받지 않는다)
 * 읽음 여부는 '마지막으로 읽은 시각'을 기기에 두고 그 뒤에 생긴 것을 안 읽음으로 본다.
 */

export type InboxKind = 'friend' | 'cogni' | 'report' | 'record';

export interface InboxItem {
  id: string;
  kind: InboxKind;
  title: string;
  body: string;
  at: string; // ISO
  href?: string;
  unread: boolean;
}

export const INBOX_FILTERS: { key: InboxKind | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'friend', label: '친구 응답' },
  { key: 'cogni', label: '코그니' },
  { key: 'report', label: '리포트' },
  { key: 'record', label: '기록' },
];

export function useInbox() {
  const token = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const local = useLocalStore((s) => (userId ? s.byUser[userId] : undefined));
  const update = useLocalStore((s) => s.update);
  const peer = useListPeerFeedback({ size: 20 }, !!token);
  // 리포트는 기록을 AI로 분석한 결과라 민감정보 처리 동의가 있을 때만 받고 보여 준다(철회하면 받아 둔 것도 숨긴다).
  const { agreed } = useSensitiveConsent();
  const reportsEnabled = !!token && agreed;
  const reports = useListReports({ size: 10 }, reportsEnabled);
  const reportList = reportsEnabled ? reports.data?.reports : undefined;
  const collection = useCollection();
  const readAt = local?.inboxReadAt ?? '';
  const pushes = local?.inboxPushes;

  const items = useMemo(() => {
    const list: Omit<InboxItem, 'unread'>[] = [];
    for (const f of peer.data?.feedbacks ?? []) {
      if (!f.created_at) continue;
      list.push({
        id: `friend-${f.feedback_id ?? f.created_at}`,
        kind: 'friend',
        title: '친구 응답이 도착했어요',
        body: '친구가 나에 대한 질문에 답했어요. 내가 보는 나와 비교해 보세요.',
        at: f.created_at,
        href: '/mirror/results',
      });
    }
    for (const c of collection) {
      if (!c.foundAt) continue;
      list.push({ id: `cogni-${c.id}`, kind: 'cogni', title: '새 코그니를 발견했어요', body: `${c.name} · ${c.desc}`, at: c.foundAt, href: `/dogam/${c.id}` });
    }
    for (const r of reportList ?? []) {
      list.push({
        id: `report-${r.report_id}`,
        kind: 'report',
        title: r.report_type === 'WEEKLY' ? '이번 주 리포트가 나왔어요' : '새 리포트가 나왔어요',
        body: r.content?.narrative?.headline || '강점과 에너지 패턴을 한눈에 볼 수 있어요.',
        at: r.created_at,
        href: '/report',
      });
    }
    for (const p of pushes ?? []) list.push({ id: `push-${p.id}`, kind: 'record', title: p.title, body: p.body, at: p.at });
    return list.sort((a, b) => b.at.localeCompare(a.at)).map((it) => ({ ...it, unread: !readAt || it.at > readAt }));
  }, [peer.data, reportList, collection, pushes, readAt]);

  const markAllRead = () => {
    if (userId) update(userId, (u) => ({ ...u, inboxReadAt: new Date().toISOString() }));
  };

  return {
    items,
    unreadCount: items.filter((i) => i.unread).length,
    markAllRead,
    loading: (peer.isLoading || (reportsEnabled && reports.isLoading)) && items.length === 0,
    // 모든 출처를 못 불러왔고 보여 줄 것도 없을 때만 오류로 본다.
    failed: peer.isError && (!reportsEnabled || reports.isError) && items.length === 0,
    retry: () => {
      peer.refetch();
      // refetch()는 꺼 둔 쿼리도 보내므로, 동의가 없으면 리포트는 다시 받지 않는다.
      if (reportsEnabled) reports.refetch();
    },
    retrying: peer.isFetching || (reportsEnabled && reports.isFetching),
  };
}
