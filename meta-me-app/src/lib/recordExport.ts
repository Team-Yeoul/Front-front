import { Share } from 'react-native';
import type { DailyRecordResponse } from '@/entities/diary';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export interface ExportEntry {
  id: string;
  date: string; // 2026.05.10
  weekday: string; // 일
  month: string; // 2026.05
  question?: string;
  answer?: string;
  scene?: string;
  tags: string[];
  myselfMoment?: string;
}

export interface ExportSummary {
  total: number;
  from?: string;
  to?: string;
  topTags: { tag: string; count: number }[];
  myselfMoments: number;
  months: number;
}

// 다이어리 목록과 같은 기준: 한글이 들어간 태그만 사람에게 보여준다.
const splitTags = (raw?: string | null) =>
  (raw ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t && /[가-힣]/.test(t));

const text = (v?: string | null) => (v && v.trim() ? v.trim() : undefined);

export function toEntries(records: DailyRecordResponse[]): ExportEntry[] {
  return records.map(({ record, questions }) => {
    const q = questions?.[0];
    const [y, m, d] = record.recorded_date.split('-').map(Number);
    return {
      id: record.record_id,
      date: record.recorded_date.replaceAll('-', '.'),
      weekday: WEEK[new Date(y, m - 1, d).getDay()],
      month: record.recorded_date.slice(0, 7).replace('-', '.'),
      question: text(q?.question_text),
      answer: text(q?.user_answer),
      scene: text(q?.scene_description),
      tags: splitTags(q?.emotion_tag),
      myselfMoment: q?.is_myself_moment ? (text(q.myself_moment_desc) ?? '나다운 순간을 발견했어요') : undefined,
    };
  });
}

export function summarize(entries: ExportEntry[]): ExportSummary {
  const counts = new Map<string, number>();
  for (const e of entries) for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  const topTags = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
  return {
    total: entries.length,
    // entries는 최신순
    from: entries.at(-1)?.date,
    to: entries[0]?.date,
    topTags,
    myselfMoments: entries.filter((e) => e.myselfMoment).length,
    months: new Set(entries.map((e) => e.month)).size,
  };
}

export function groupByMonth(entries: ExportEntry[]): [string, ExportEntry[]][] {
  const map = new Map<string, ExportEntry[]>();
  for (const e of entries) {
    if (!map.has(e.month)) map.set(e.month, []);
    map.get(e.month)!.push(e);
  }
  return [...map.entries()];
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const nl = (s: string) => esc(s).replaceAll('\n', '<br>');

/** 브라우저에서 바로 열리고 그대로 인쇄(PDF 저장)할 수 있는 한 장짜리 HTML */
export function buildExportHtml(entries: ExportEntry[], nickname?: string): string {
  const s = summarize(entries);
  const title = `${nickname ? `${nickname}님의 ` : ''}기록 모음`;
  const period = s.from && s.to ? `${s.from} – ${s.to}` : '';

  const months = groupByMonth(entries)
    .map(
      ([month, items]) => `
      <section>
        <h2>${esc(month)} <span>${items.length}개</span></h2>
        ${items
          .map(
            (e) => `
          <article>
            <p class="date">${esc(e.date)} (${e.weekday})</p>
            ${e.question ? `<p class="q">Q. ${nl(e.question)}</p>` : ''}
            ${e.answer ? `<p class="a">${nl(e.answer)}</p>` : ''}
            ${e.scene ? `<p class="label">기억나는 장면</p><p class="scene">${nl(e.scene)}</p>` : ''}
            ${e.myselfMoment ? `<p class="label">나다운 순간</p><p class="scene">${nl(e.myselfMoment)}</p>` : ''}
            ${e.tags.length ? `<p class="tags">${e.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</p>` : ''}
          </article>`,
          )
          .join('')}
      </section>`,
    )
    .join('');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  body { margin: 0; background: #F6F6F9; color: #1A1A1F; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', 'Malgun Gothic', sans-serif; line-height: 1.7; }
  main { max-width: 720px; margin: 0 auto; padding: 40px 20px 64px; }
  h1 { font-size: 26px; margin: 0; }
  .period { color: #8A8A94; margin: 4px 0 24px; font-size: 14px; }
  .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .stat { background: #fff; border: 1px solid #ECECF1; border-radius: 14px; padding: 14px; }
  .stat b { display: block; font-size: 22px; }
  .stat small { color: #8A8A94; font-size: 12px; }
  .top { background: #fff; border: 1px solid #ECECF1; border-radius: 14px; padding: 14px; margin-bottom: 8px; font-size: 14px; }
  h2 { font-size: 15px; color: #8A8A94; margin: 36px 0 12px; font-weight: 600; }
  h2 span { font-weight: 400; }
  article { background: #fff; border: 1px solid #ECECF1; border-radius: 16px; padding: 16px 18px; margin-bottom: 12px; break-inside: avoid; }
  .date { font-size: 13px; color: #8A8A94; margin: 0 0 6px; font-family: ui-monospace, Menlo, monospace; }
  .q { font-weight: 700; margin: 0 0 6px; }
  .a { margin: 0; white-space: normal; }
  .label { font-size: 12px; font-weight: 600; color: #6367FF; margin: 12px 0 2px; }
  .scene { margin: 0; color: #48484F; }
  .tags { margin: 12px 0 0; display: flex; flex-wrap: wrap; gap: 6px; }
  .tags span, .top span { background: #EEEFFF; color: #6367FF; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 600; }
  .top span { display: inline-block; margin: 4px 6px 0 0; }
  @media print { body { background: #fff; } main { padding: 0; } }
</style>
</head>
<body>
<main>
  <h1>${esc(title)}</h1>
  <p class="period">${esc(period)}</p>
  <div class="summary">
    <div class="stat"><b>${s.total}</b><small>전체 기록</small></div>
    <div class="stat"><b>${s.months}</b><small>기록한 달</small></div>
    <div class="stat"><b>${s.myselfMoments}</b><small>나다운 순간</small></div>
  </div>
  ${s.topTags.length ? `<div class="top">자주 느낀 감정<br>${s.topTags.map((t) => `<span>${esc(t.tag)} ${t.count}</span>`).join('')}</div>` : ''}
  ${months}
</main>
</body>
</html>`;
}

/**
 * 앱에서 내보내기: 웹은 HTML 파일을 내려받게 했지만, 앱은 새 패키지(파일 시스템 등) 없이
 * 할 수 있는 방법이 RN 기본 공유 시트뿐이라 Share.share({ message })로 HTML 본문을 넘긴다.
 * 공유 시트에서 '파일에 저장'·메일·메모 등으로 보낼 수 있다(파일이 아니라 글자로 넘어간다).
 * 파일(.html) 첨부가 꼭 필요하면 expo-file-system으로 임시 파일을 만들어 url로 넘기도록 바꾼다.
 * 반환값: 사용자가 공유를 마쳤으면 true, 닫았으면 false.
 */
export async function shareExportHtml(entries: ExportEntry[], nickname?: string): Promise<boolean> {
  const title = `meta-me-기록-${new Date().toLocaleDateString('sv-SE')}`;
  const res = await Share.share({ title, message: buildExportHtml(entries, nickname) }, { subject: title });
  return res.action === Share.sharedAction;
}

/** 웹과 같은 이름으로 부를 수 있게 남겨 둔다. 앱에서는 공유 시트를 연다. */
export const downloadExportHtml = shareExportHtml;
